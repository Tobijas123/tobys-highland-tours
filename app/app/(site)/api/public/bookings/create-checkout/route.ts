import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import Stripe from 'stripe'
import { isRateLimited, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'
import { allocateVehicleForDate } from '../../../../lib/vehicleAllocation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://tobyshighlandtours.com'

export async function POST(request: Request) {
  const startTime = Date.now()
  console.log('[CHECKOUT API] Request started')

  try {
    // Rate limiting by IP (10 per minute)
    const ip = getClientIP(request)
    console.log('[CHECKOUT API] IP:', ip)

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
      return NextResponse.json({ success: true, bookingId: 0, checkoutUrl: '/' }, { status: 201 })
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

    console.log('[CHECKOUT API] Creating booking...', Date.now() - startTime, 'ms')
    const booking = await payload.create({
      collection: 'bookings',
      data: bookingData,
    })
    console.log('[CHECKOUT API] Booking created:', booking.id, Date.now() - startTime, 'ms')

    // Calculate deposit (20% of total price)
    const depositAmount = Math.round(totalPrice * 0.20 * 100) // in pence
    const typeLabel = bookingType === 'tour' ? 'Tour' : 'Transfer'

    // Create Stripe Checkout Session
    console.log('[CHECKOUT API] Creating Stripe session...', Date.now() - startTime, 'ms')
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail.trim().toLowerCase(),
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: depositAmount,
            product_data: {
              name: `${typeLabel} Deposit: ${itemTitle}`,
              description: `20% deposit for ${itemTitle} on ${date} at ${pickupTime}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: String(booking.id),
        type: bookingType,
        customerName: customerName.trim(),
      },
      payment_intent_data: {
        statement_descriptor: 'TOBYSTOURS',
      },
      success_url: `${SITE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/booking/cancel?booking_id=${booking.id}`,
    })

    console.log('[CHECKOUT API] Stripe session created:', session.id, Date.now() - startTime, 'ms')

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      checkoutUrl: session.url,
    })
  } catch (err) {
    console.error('[CHECKOUT API] Error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
