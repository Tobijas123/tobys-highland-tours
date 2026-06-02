import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const BOOKING_EMAIL = process.env.BOOKING_EMAIL || 'info@tobyshighlandtours.com'

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // Read raw body for signature verification
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[WEBHOOK] Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[WEBHOOK] Signature verification failed:', message)
    return NextResponse.json({ error: `Signature verification failed: ${message}` }, { status: 400 })
  }

  console.log('[WEBHOOK] Received event:', event.type, event.id)

  const payload = await getPayload({ config })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(payload, session)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(payload, paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleChargeRefunded(payload, charge)
        break
      }

      default:
        console.log('[WEBHOOK] Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[WEBHOOK] Error processing event:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(payload: any, session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId
  if (!bookingId) {
    console.error('[WEBHOOK] checkout.session.completed: No bookingId in metadata')
    return
  }

  console.log('[WEBHOOK] Processing checkout.session.completed for booking:', bookingId)

  // Find the booking
  let booking: any
  try {
    booking = await payload.findByID({
      collection: 'bookings',
      id: Number(bookingId),
      depth: 1,
    })
  } catch (err) {
    console.error('[WEBHOOK] Failed to find booking:', bookingId, err)
    return
  }

  if (!booking) {
    console.error('[WEBHOOK] Booking not found:', bookingId)
    return
  }

  // Get item title
  const bookingType = booking.type || 'tour'
  const typeLabel = bookingType === 'tour' ? 'Tour' : 'Transfer'
  let itemTitle = typeLabel

  if (bookingType === 'tour' && booking.tour) {
    itemTitle = typeof booking.tour === 'object' ? booking.tour.title || 'Tour' : 'Tour'
  } else if (bookingType === 'transfer' && booking.transfer) {
    itemTitle = typeof booking.transfer === 'object' ? booking.transfer.title || 'Transfer' : 'Transfer'
  }

  // Extract payment intent ID
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id || null

  // Update the booking
  try {
    await payload.update({
      collection: 'bookings',
      id: Number(bookingId),
      data: {
        paymentStatus: 'deposit',
        status: 'confirmed',
        stripePaymentIntentId: paymentIntentId,
        depositPaidAt: new Date().toISOString(),
      },
    })
    console.log('[WEBHOOK] Booking updated:', bookingId)
  } catch (err) {
    console.error('[WEBHOOK] Failed to update booking:', bookingId, err)
    return
  }

  // Calculate amounts
  const totalPrice = booking.totalPrice || 0
  const depositAmount = session.amount_total ? (session.amount_total / 100) : Math.round(totalPrice * 0.20)
  const remainingBalance = Math.round(totalPrice * 0.80)

  // Send customer confirmation email
  const customerSubject = `Booking Confirmed - ${itemTitle} on ${booking.date}`
  const customerHtml = generateCustomerConfirmationEmail({
    customerName: booking.customerName,
    bookingId: booking.id,
    type: bookingType,
    typeLabel,
    itemTitle,
    date: booking.date,
    pickupTime: booking.pickupTime,
    pickupLocation: booking.pickupLocation,
    dropoffLocation: booking.dropoffLocation,
    paxCount: booking.paxCount,
    totalPrice,
    depositPaid: depositAmount,
    remainingBalance,
  })

  try {
    await payload.sendEmail({
      to: booking.customerEmail,
      subject: customerSubject,
      html: customerHtml,
    })
    console.log('[WEBHOOK] Customer confirmation email sent to:', booking.customerEmail)
  } catch (err) {
    console.error('[WEBHOOK] Failed to send customer email:', err)
  }

  // Send Toby notification email
  const tobySubject = `New Paid Booking #${booking.id} - £${depositAmount} deposit`
  const tobyHtml = generateTobyNotificationEmail({
    bookingId: booking.id,
    type: bookingType,
    typeLabel,
    itemTitle,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    date: booking.date,
    pickupTime: booking.pickupTime,
    pickupLocation: booking.pickupLocation,
    dropoffLocation: booking.dropoffLocation,
    paxCount: booking.paxCount,
    totalPrice,
    depositPaid: depositAmount,
    remainingBalance,
  })

  try {
    await payload.sendEmail({
      to: BOOKING_EMAIL,
      subject: tobySubject,
      html: tobyHtml,
    })
    console.log('[WEBHOOK] Toby notification email sent to:', BOOKING_EMAIL)
  } catch (err) {
    console.error('[WEBHOOK] Failed to send Toby notification email:', err)
  }
}

async function handlePaymentFailed(payload: any, paymentIntent: Stripe.PaymentIntent) {
  console.log('[WEBHOOK] Payment failed:', paymentIntent.id)

  // Try to find booking by payment intent ID
  const bookings = await payload.find({
    collection: 'bookings',
    where: { stripePaymentIntentId: { equals: paymentIntent.id } },
    limit: 1,
  })

  if (bookings.docs.length === 0) {
    console.log('[WEBHOOK] No booking found for failed payment intent:', paymentIntent.id)
    return
  }

  const booking = bookings.docs[0]
  console.log('[WEBHOOK] Payment failed for booking:', booking.id)

  // Send failure notification to customer
  const subject = 'Payment Failed - Please Try Again'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #071a34; color: #fff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Toby's Highland Tours</h1>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #a33; margin-top: 0;">Payment Failed</h2>
        <p>Hi ${booking.customerName},</p>
        <p>Unfortunately, your payment could not be processed. Please try again or use a different payment method.</p>
        <p>If you continue to experience issues, please contact us at <a href="mailto:info@tobyshighlandtours.com">info@tobyshighlandtours.com</a>.</p>
        <p style="margin-top: 24px;">Cheers,<br/><strong>Toby's Highland Tours</strong></p>
      </div>
    </div>
  `

  try {
    await payload.sendEmail({
      to: booking.customerEmail,
      subject,
      html,
    })
    console.log('[WEBHOOK] Payment failed email sent to:', booking.customerEmail)
  } catch (err) {
    console.error('[WEBHOOK] Failed to send payment failed email:', err)
  }
}

async function handleChargeRefunded(payload: any, charge: Stripe.Charge) {
  console.log('[WEBHOOK] Charge refunded:', charge.id)

  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) {
    console.log('[WEBHOOK] No payment intent ID on refunded charge')
    return
  }

  // Find booking by payment intent ID
  const bookings = await payload.find({
    collection: 'bookings',
    where: { stripePaymentIntentId: { equals: paymentIntentId } },
    limit: 1,
  })

  if (bookings.docs.length === 0) {
    console.log('[WEBHOOK] No booking found for refunded charge:', paymentIntentId)
    return
  }

  const booking = bookings.docs[0]
  console.log('[WEBHOOK] Processing refund for booking:', booking.id)

  // Check if full refund
  const isFullRefund = charge.amount_refunded >= charge.amount

  // Update booking
  try {
    await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: {
        paymentStatus: isFullRefund ? 'refunded' : 'deposit', // Keep deposit if partial refund
        status: isFullRefund ? 'cancelled' : booking.status,
      },
    })
    console.log('[WEBHOOK] Booking updated after refund:', booking.id, 'Full refund:', isFullRefund)
  } catch (err) {
    console.error('[WEBHOOK] Failed to update booking after refund:', err)
  }
}

function generateCustomerConfirmationEmail(data: {
  customerName: string
  bookingId: number | string
  type: string
  typeLabel: string
  itemTitle: string
  date: string
  pickupTime?: string
  pickupLocation?: string
  dropoffLocation?: string
  paxCount?: number
  totalPrice: number
  depositPaid: number
  remainingBalance: number
}): string {
  const {
    customerName,
    bookingId,
    type,
    typeLabel,
    itemTitle,
    date,
    pickupTime,
    pickupLocation,
    dropoffLocation,
    paxCount,
    totalPrice,
    depositPaid,
    remainingBalance,
  } = data

  // Different payment instructions for tours vs transfers
  const paymentInstructions = type === 'tour'
    ? `<p style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #275548;">
        <strong>Remaining balance:</strong> £${remainingBalance} payable on the day of your tour in cash or card.
      </p>`
    : `<p style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #275548;">
        <strong>Remaining balance:</strong> £${remainingBalance}. We will send you a payment link the day before your transfer.
      </p>`

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #071a34; color: #fff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Toby's Highland Tours</h1>
      </div>

      <div style="padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; color: #275548;">✓</div>
          <h2 style="color: #071a34; margin: 8px 0;">Booking Confirmed!</h2>
          <p style="color: #666; margin: 0;">Booking #${bookingId}</p>
        </div>

        <p>Hi ${customerName},</p>
        <p>Thank you for your booking! Your deposit has been received and your ${typeLabel.toLowerCase()} is confirmed.</p>

        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #071a34; margin: 0 0 16px; font-size: 16px;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">${typeLabel}</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${itemTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Date</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${date}</td>
            </tr>
            ${pickupTime ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Pickup Time</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${pickupTime}</td>
            </tr>` : ''}
            ${pickupLocation ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Pickup</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${pickupLocation}</td>
            </tr>` : ''}
            ${dropoffLocation ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Drop-off</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${dropoffLocation}</td>
            </tr>` : ''}
            ${paxCount ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Passengers</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${paxCount}</td>
            </tr>` : ''}
          </table>
        </div>

        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #071a34; margin: 0 0 16px; font-size: 16px;">Payment Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Total Price</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">£${totalPrice}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #275548; font-weight: 600;">Deposit Paid</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #275548;">£${depositPaid}</td>
            </tr>
            <tr style="border-top: 1px solid #ddd;">
              <td style="padding: 12px 0 8px; color: #666;">Remaining Balance</td>
              <td style="padding: 12px 0 8px; text-align: right; font-weight: 700; font-size: 18px;">£${remainingBalance}</td>
            </tr>
          </table>
        </div>

        ${paymentInstructions}

        <div style="background: #fff3cd; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <strong style="color: #856404;">Cancellation Policy</strong>
          <p style="color: #856404; margin: 8px 0 0; font-size: 14px;">
            Free cancellation up to 48 hours before your booking. Deposits are non-refundable within 48 hours of the scheduled date.
          </p>
        </div>

        <p>If you have any questions, reply to this email or contact us:</p>
        <p>
          <a href="mailto:info@tobyshighlandtours.com" style="color: #071a34; font-weight: 600;">info@tobyshighlandtours.com</a><br/>
          <a href="https://wa.me/447383488007" style="color: #071a34; font-weight: 600;">WhatsApp: +44 7383 488007</a>
        </p>

        <p style="margin-top: 32px;">We look forward to showing you the Highlands!</p>
        <p>Cheers,<br/><strong>Toby's Highland Tours</strong></p>
      </div>

      <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin: 0;">Toby's Highland Tours | Inverness, Scotland</p>
        <p style="margin: 8px 0 0;">
          <a href="https://tobyshighlandtours.com" style="color: #666;">tobyshighlandtours.com</a>
        </p>
      </div>
    </div>
  `
}

function generateTobyNotificationEmail(data: {
  bookingId: number | string
  type: string
  typeLabel: string
  itemTitle: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  date: string
  pickupTime?: string
  pickupLocation?: string
  dropoffLocation?: string
  paxCount?: number
  totalPrice: number
  depositPaid: number
  remainingBalance: number
}): string {
  const {
    bookingId,
    typeLabel,
    itemTitle,
    customerName,
    customerEmail,
    customerPhone,
    date,
    pickupTime,
    pickupLocation,
    dropoffLocation,
    paxCount,
    totalPrice,
    depositPaid,
    remainingBalance,
  } = data

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #275548; color: #fff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">New Paid Booking!</h1>
      </div>

      <div style="padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 36px; color: #275548; font-weight: bold;">£${depositPaid}</div>
          <p style="color: #666; margin: 4px 0;">Deposit received</p>
          <p style="font-weight: 600; margin: 0;">Booking #${bookingId}</p>
        </div>

        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #071a34; margin: 0 0 16px; font-size: 16px;">Customer Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Name</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Email</td>
              <td style="padding: 8px 0; text-align: right;"><a href="mailto:${customerEmail}" style="color: #071a34; font-weight: 600;">${customerEmail}</a></td>
            </tr>
            ${customerPhone ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Phone</td>
              <td style="padding: 8px 0; text-align: right;"><a href="tel:${customerPhone}" style="color: #071a34; font-weight: 600;">${customerPhone}</a></td>
            </tr>` : ''}
          </table>
        </div>

        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #071a34; margin: 0 0 16px; font-size: 16px;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">${typeLabel}</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${itemTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Date</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${date}</td>
            </tr>
            ${pickupTime ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Pickup Time</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${pickupTime}</td>
            </tr>` : ''}
            ${pickupLocation ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Pickup</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${pickupLocation}</td>
            </tr>` : ''}
            ${dropoffLocation ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Drop-off</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${dropoffLocation}</td>
            </tr>` : ''}
            ${paxCount ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Passengers</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${paxCount}</td>
            </tr>` : ''}
          </table>
        </div>

        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #071a34; margin: 0 0 16px; font-size: 16px;">Payment</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Total Price</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">£${totalPrice}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #275548; font-weight: 600;">Deposit Paid</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #275548;">£${depositPaid}</td>
            </tr>
            <tr style="border-top: 1px solid #ddd;">
              <td style="padding: 12px 0 8px; color: #666;">Remaining</td>
              <td style="padding: 12px 0 8px; text-align: right; font-weight: 700;">£${remainingBalance}</td>
            </tr>
          </table>
        </div>

        <p style="text-align: center;">
          <a href="https://tobyshighlandtours.com/admin/collections/bookings/${bookingId}"
             style="display: inline-block; background: #071a34; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View in Admin
          </a>
        </p>
      </div>
    </div>
  `
}
