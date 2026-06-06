import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import Stripe from 'stripe'
import { verifyPaymentToken } from '@/lib/paymentToken'

export async function GET(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://tobyshighlandtours.com'

  try {
    const url = new URL(request.url)
    const bookingId = url.searchParams.get('bookingId')
    const token = url.searchParams.get('token')

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
    }

    // Verify token
    if (!verifyPaymentToken(bookingId, token)) {
      return NextResponse.json({ error: 'Invalid or expired payment link' }, { status: 403 })
    }

    const payload = await getPayload({ config })

    // Find the booking
    let booking: any
    try {
      booking = await payload.findByID({
        collection: 'bookings',
        id: Number(bookingId),
        depth: 1,
      })
    } catch {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if already fully paid
    if (booking.paymentStatus === 'paid') {
      return NextResponse.redirect(`${SITE_URL}/booking/success?already_paid=true`)
    }

    // Check if booking is cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'This booking has been cancelled' }, { status: 400 })
    }

    // Calculate remaining balance (80% of total)
    const totalPrice = booking.totalPrice || 0
    const remainingAmount = Math.round(totalPrice * 0.80 * 100) // in pence

    if (remainingAmount <= 0) {
      return NextResponse.json({ error: 'No remaining balance to pay' }, { status: 400 })
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

    // Create Stripe Checkout Session for remaining balance
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: booking.customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: remainingAmount,
            product_data: {
              name: `${typeLabel} Balance: ${itemTitle}`,
              description: `Remaining balance for ${itemTitle} on ${booking.date}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: String(booking.id),
        paymentType: 'remaining',
        customerName: booking.customerName,
      },
      payment_intent_data: {
        statement_descriptor: 'TOBYSTOURS',
      },
      success_url: `${SITE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}&payment=remaining`,
      cancel_url: `${SITE_URL}/booking/cancel?booking_id=${booking.id}`,
    })

    // Redirect to Stripe Checkout
    return NextResponse.redirect(session.url!)
  } catch (err) {
    console.error('[PAY-REMAINING] Error:', err)
    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 })
  }
}
