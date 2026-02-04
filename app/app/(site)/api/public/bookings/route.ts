import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isRateLimited, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'
import { allocateVehicleForDate } from '../../../lib/vehicleAllocation'

const ADMIN_EMAIL = 'info@tobyshighlandtours.com'

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
    } = body

    // Honeypot check (if frontend adds hidden field)
    if (body.website || body.url || body.honeypot) {
      // Silently reject bots
      return NextResponse.json({ success: true, bookingId: 0 }, { status: 201 })
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
      return NextResponse.json({ error: 'date must be YYYY-MM-DD format', field: 'date' }, { status: 400 })
    }

    // Pickup time validation (HH:MM 24h)
    if (!pickupTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(pickupTime)) {
      return NextResponse.json({ error: 'pickupTime must be HH:MM (24h format)', field: 'pickupTime' }, { status: 400 })
    }

    // Pickup/dropoff locations
    if (!pickupLocation || typeof pickupLocation !== 'string' || pickupLocation.trim().length < 2) {
      return NextResponse.json({ error: 'pickupLocation is required (min 2 chars)', field: 'pickupLocation' }, { status: 400 })
    }
    if (!dropoffLocation || typeof dropoffLocation !== 'string' || dropoffLocation.trim().length < 2) {
      return NextResponse.json({ error: 'dropoffLocation is required (min 2 chars)', field: 'dropoffLocation' }, { status: 400 })
    }

    // Pax count validation
    const paxNum = Number(paxCount)
    if (!paxCount || isNaN(paxNum) || paxNum < 1 || paxNum > 50 || !Number.isInteger(paxNum)) {
      return NextResponse.json({ error: 'paxCount must be integer 1-50', field: 'paxCount' }, { status: 400 })
    }

    // Party size validation
    if (!partySize || !['1-3', '4-7'].includes(partySize)) {
      return NextResponse.json({ error: 'partySize must be "1-3" or "4-7"', field: 'partySize' }, { status: 400 })
    }

    // Customer validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json({ error: 'customerName is required (min 2 chars)', field: 'customerName' }, { status: 400 })
    }
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: 'valid customerEmail is required', field: 'customerEmail' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Determine type and find the item
    const bookingType = hasTourId ? 'tour' : 'transfer'
    let item: any = null
    let itemTitle = ''
    let itemSlug = ''

    if (hasTourId) {
      try {
        item = await payload.findByID({ collection: 'tours', id: tourId })
        itemTitle = item?.title || 'Tour'
        itemSlug = item?.slug || ''
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
        itemSlug = item?.slug || ''
      } catch {
        // not found
      }
      if (!item) {
        return NextResponse.json({ error: 'Transfer not found', field: 'transferId' }, { status: 404 })
      }
    }

    // Derive priceTier from partySize
    const priceTier = partySize === '1-3' ? 'price1to3' : 'price4to7'

    // Create booking
    const bookingData: any = {
      type: bookingType,
      date,
      pickupTime,
      pickupLocation: pickupLocation.trim(),
      dropoffLocation: dropoffLocation.trim(),
      paxCount: paxNum,
      partySize,
      priceTier,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim() || undefined,
      notes: message?.trim() || undefined,
      status: 'pending',
      paymentStatus: 'unpaid',
      source: 'website',
    }

    if (bookingType === 'tour') {
      bookingData.tour = item.id
    } else {
      bookingData.transfer = item.id
    }

    // Vehicle allocation
    const allocatedVehicle = await allocateVehicleForDate(date, partySize)
    if (!allocatedVehicle) {
      return NextResponse.json(
        { error: 'No vehicles available for this date. Please choose another date.' },
        { status: 409 }
      )
    }
    bookingData.vehicle = allocatedVehicle.id

    console.log('[BOOKING API] Creating booking...', Date.now() - startTime, 'ms')
    const booking = await payload.create({
      collection: 'bookings',
      data: bookingData,
    })
    console.log('[BOOKING API] Booking created:', booking.id, Date.now() - startTime, 'ms')

    // Send notification email to admin
    const partyLabel = partySize === '1-3' ? '1–3 people' : '4–7 people'
    const typeLabel = bookingType === 'tour' ? 'Tour' : 'Transfer'
    const phoneInfo = customerPhone?.trim() ? `<li><strong>Phone:</strong> ${customerPhone.trim()}</li>` : ''

    const adminHtml = `
      <h2>New Booking Request</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Type</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${typeLabel}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>${typeLabel}</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${itemTitle}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Slug</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${itemSlug}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${date}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Pickup time</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${pickupTime}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Pickup</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${pickupLocation.trim()}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Drop-off</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${dropoffLocation.trim()}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Passengers</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${paxNum}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Party size</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${partyLabel}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Customer</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${customerName.trim()}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${customerEmail.trim()}</td></tr>
        ${customerPhone?.trim() ? `<tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${customerPhone.trim()}</td></tr>` : ''}
        ${message?.trim() ? `<tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Notes</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${message.trim()}</td></tr>` : ''}
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Payment</strong></td><td style="padding: 6px; border: 1px solid #ddd;">Unpaid</td></tr>
      </table>
      <p style="margin-top: 16px;"><a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin/collections/bookings/${booking.id}">View in Admin</a></p>
    `

    // Fire-and-forget email: don't block the response
    console.log('[BOOKING API] Queuing admin email (fire-and-forget)...', Date.now() - startTime, 'ms')
    void payload.sendEmail({
      to: ADMIN_EMAIL,
      subject: `New ${typeLabel} Booking: ${itemTitle} – ${date} ${pickupTime}`,
      html: adminHtml,
    }).then(() => {
      console.log('[BOOKING API] Admin email sent successfully')
    }).catch((err) => {
      console.error('[BOOKING API] Failed to send admin email:', err)
    })

    console.log('[BOOKING API] Returning 201 response', Date.now() - startTime, 'ms')
    return NextResponse.json(
      {
        success: true,
        bookingId: booking.id,
        message: 'Booking request received. We will confirm by email shortly.',
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Booking creation error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
