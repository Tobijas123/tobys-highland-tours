import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isRateLimited, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'
import { allocateVehicleForDate } from '../../../../lib/vehicleAllocation'

const ADMIN_EMAIL = 'info@dingwall-taxis.co.uk'

export async function POST(request: Request) {
  const startTime = Date.now()
  console.log('[BOOKING API] Request started')

  try {
    // Rate limiting by IP (10 per minute)
    const ip = getClientIP(request)
    console.log('[BOOKING API] IP:', ip)

    if (isRateLimited('bookings', ip, RATE_LIMITS.bookings)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      tourId,
      transferId,
      date,
      pickupTime,
      pickupLocation,
      dropoffLocation,
      paxCount,
      partySize,
      customerName,
      customerEmail,
      customerPhone,
      message,
      agreedToTerms,
    } = body

    // Honeypot check (if frontend adds hidden field)
    if (body.website || body.url || body.honeypot) {
      // Silently reject bots
      return NextResponse.json({ success: true, bookingId: 0, checkoutUrl: '/' }, { status: 201 })
    }

    // Terms agreement validation (must be checked before creating booking/Stripe session)
    if (agreedToTerms !== true) {
      return NextResponse.json(
        { error: 'You must agree to the cancellation policy before booking', field: 'agreedToTerms' },
        { status: 400 }
      )
    }

    // Validation: must have exactly one of tourId or transferId
    const hasTourId = tourId !== undefined && tourId !== null
    const hasTransferId = transferId !== undefined && transferId !== null

    if (!hasTourId && !hasTransferId) {
      return NextResponse.json({ error: 'tourId or transferId is required', field: 'tourId' }, { status: 400 })
    }
    if (hasTourId && hasTransferId) {
      return NextResponse.json({ error: 'Cannot specify both tourId and transferId', field: 'tourId' }, { status: 400 })
    }

    // Date validation
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)', field: 'date' }, { status: 400 })
    }

    // Pickup time validation (HH:MM 24h)
    if (!pickupTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(pickupTime)) {
      return NextResponse.json({ error: 'Pickup time is required (HH:MM)', field: 'pickupTime' }, { status: 400 })
    }

    // Pickup/dropoff locations
    if (!pickupLocation || typeof pickupLocation !== 'string' || pickupLocation.trim().length < 2) {
      return NextResponse.json({ error: 'Pickup location is required', field: 'pickupLocation' }, { status: 400 })
    }
    if (!dropoffLocation || typeof dropoffLocation !== 'string' || dropoffLocation.trim().length < 2) {
      return NextResponse.json({ error: 'Drop-off location is required', field: 'dropoffLocation' }, { status: 400 })
    }

    // Pax count validation
    const paxNum = Number(paxCount)
    if (!paxCount || isNaN(paxNum) || paxNum < 1 || paxNum > 50 || !Number.isInteger(paxNum)) {
      return NextResponse.json({ error: 'Number of passengers is required (1-50)', field: 'paxCount' }, { status: 400 })
    }

    // Party size validation
    if (!partySize || !['1-4', '5-7'].includes(partySize)) {
      return NextResponse.json({ error: 'Party size is required', field: 'partySize' }, { status: 400 })
    }

    // Customer validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json({ error: 'Your name is required', field: 'customerName' }, { status: 400 })
    }
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: 'Valid email is required', field: 'customerEmail' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Determine type and find the item
    const bookingType = hasTourId ? 'tour' : 'transfer'
    let item: any = null
    let itemTitle = ''

    if (hasTourId) {
      try {
        item = await payload.findByID({ collection: 'tours', id: tourId })
        itemTitle = item?.title || 'Tour'
      } catch {
        // not found
      }
      if (!item) {
        return NextResponse.json({ error: 'Tour not found', field: 'tourId' }, { status: 404 })
      }
    } else {
      try {
        item = await payload.findByID({ collection: 'transfers', id: transferId })
        itemTitle = item?.title || 'Transfer'
      } catch {
        // not found
      }
      if (!item) {
        return NextResponse.json({ error: 'Transfer not found', field: 'transferId' }, { status: 404 })
      }
    }

    // Get price based on party size
    const priceField = partySize === '1-4' ? 'price1to4' : 'price5to7'
    const totalPrice = item[priceField]

    if (typeof totalPrice !== 'number' || totalPrice <= 0) {
      return NextResponse.json({ error: 'Price not available for this party size', field: 'partySize' }, { status: 400 })
    }

    // Derive priceTier from partySize
    const priceTier = partySize === '1-4' ? 'price1to4' : 'price5to7'

    // Vehicle allocation
    const allocatedVehicle = await allocateVehicleForDate(date, partySize)
    if (!allocatedVehicle) {
      return NextResponse.json(
        { error: 'No vehicles available for this date. Please choose another date.', field: 'date' },
        { status: 409 }
      )
    }

    // Create booking with status pending, paymentStatus unpaid
    const bookingData: any = {
      type: bookingType,
      date,
      pickupTime,
      pickupLocation: pickupLocation.trim(),
      dropoffLocation: dropoffLocation.trim(),
      paxCount: paxNum,
      partySize,
      priceTier,
      totalPrice,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim() || undefined,
      notes: message?.trim() || undefined,
      status: 'pending',
      paymentStatus: 'unpaid',
      source: 'website',
      vehicle: allocatedVehicle.id,
    }

    if (bookingType === 'tour') {
      bookingData.tour = item.id
    } else {
      bookingData.transfer = item.id
    }

    console.log('[BOOKING API] Creating booking...', Date.now() - startTime, 'ms')
    const booking = await payload.create({
      collection: 'bookings',
      data: bookingData,
    })
    console.log('[BOOKING API] Booking created:', booking.id, Date.now() - startTime, 'ms')

    const typeLabel = bookingType === 'tour' ? 'Tour' : 'Transfer'
    const createdAt = new Date().toISOString()

    // Send confirmation email to customer (non-blocking)
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #071a34; color: #fff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Toby's Highland Tours</h1>
        </div>

        <div style="padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; color: #275548;">✓</div>
            <h2 style="color: #071a34; margin: 8px 0;">Booking Received!</h2>
            <p style="color: #666; margin: 0;">Booking #${booking.id}</p>
          </div>

          <p>Hi ${customerName.trim()},</p>
          <p>Thank you for your booking request! We've received your details and will confirm your booking shortly.</p>

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
              <tr>
                <td style="padding: 8px 0; color: #666;">Pickup Time</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${pickupTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Pickup Location</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${pickupLocation.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Drop-off Location</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${dropoffLocation.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Passengers</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${paxNum}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Total Price</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">£${totalPrice}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #275548;">
            <h3 style="color: #275548; margin: 0 0 12px; font-size: 16px;">Payment Information</h3>
            <p style="margin: 0 0 8px; color: #166534;">
              <strong>Pay directly to your driver on the day</strong> — cash or card accepted.
            </p>
            <p style="margin: 0; color: #166534; font-size: 14px;">
              Prefer to pay by card in advance? Simply reply to this email and we'll send you a secure payment link.
            </p>
          </div>

          <p>If you have any questions, reply to this email or contact us:</p>
          <p>
            <a href="mailto:info@dingwall-taxis.co.uk" style="color: #071a34; font-weight: 600;">info@dingwall-taxis.co.uk</a><br/>
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

    void (async () => {
      try {
        await payload.sendEmail({
          to: customerEmail.trim().toLowerCase(),
          replyTo: ADMIN_EMAIL,
          subject: `Booking received — Toby's Highland Tours`,
          html: customerEmailHtml,
        })
        console.log('[BOOKING API] Customer confirmation email sent to:', customerEmail.trim())
      } catch (err) {
        console.error('[BOOKING API] Customer email failed:', err)
      }
    })()

    // Send notification to admin (non-blocking)
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #275548; color: #fff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">New Booking</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Awaiting confirmation</p>
        </div>

        <div style="padding: 24px;">
          <p style="background: #f0fdf4; border-left: 4px solid #275548; padding: 12px; margin: 0 0 24px;">
            <strong>Booking #${booking.id}</strong> — Customer will pay driver directly (cash/card on day).
          </p>

          <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="color: #071a34; margin: 0 0 16px; font-size: 16px;">Customer Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Name</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${customerName.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Email</td>
                <td style="padding: 8px 0; text-align: right;"><a href="mailto:${customerEmail.trim()}" style="color: #071a34; font-weight: 600;">${customerEmail.trim()}</a></td>
              </tr>
              ${customerPhone?.trim() ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Phone / WhatsApp</td>
                <td style="padding: 8px 0; text-align: right;"><a href="tel:${customerPhone.trim()}" style="color: #071a34; font-weight: 600;">${customerPhone.trim()}</a></td>
              </tr>` : ''}
            </table>
          </div>

          <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
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
              <tr>
                <td style="padding: 8px 0; color: #666;">Pickup Time</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${pickupTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Pickup Location</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${pickupLocation.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Drop-off Location</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${dropoffLocation.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Passengers</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${paxNum}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Total Price</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">£${totalPrice}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Booking ID</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">#${booking.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Created</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${createdAt}</td>
              </tr>
            </table>
          </div>

          <p style="text-align: center;">
            <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://tobyshighlandtours.com'}/admin/collections/bookings/${booking.id}"
               style="display: inline-block; background: #071a34; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View in Admin
            </a>
          </p>
        </div>
      </div>
    `

    void (async () => {
      try {
        await payload.sendEmail({
          to: ADMIN_EMAIL,
          subject: `New booking #${booking.id} — ${itemTitle} on ${date}`,
          html: adminEmailHtml,
        })
        console.log('[BOOKING API] Admin notification sent for booking:', booking.id)
      } catch (err) {
        console.error('[BOOKING API] Admin email failed:', err)
      }
    })()

    console.log('[BOOKING API] Completed:', booking.id, Date.now() - startTime, 'ms')

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
    })
  } catch (err) {
    console.error('[BOOKING API] Error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
