import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const ADMIN_EMAIL = 'info@tobyshighlandtours.com'

// Simple in-memory rate limit (resets on server restart)
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true
  }

  entry.count++
  return false
}

export async function POST(request: Request) {
  try {
    // Basic rate limiting by IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { tourId, tourSlug, date, partySize, customerName, customerEmail, message } = body

    // Honeypot check (if frontend adds hidden field)
    if (body.website || body.url || body.honeypot) {
      // Silently reject bots
      return NextResponse.json({ success: true, bookingId: 0 }, { status: 201 })
    }

    // Validation
    if (!tourId && !tourSlug) {
      return NextResponse.json({ error: 'tourId or tourSlug is required' }, { status: 400 })
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'date must be YYYY-MM-DD format' }, { status: 400 })
    }
    if (!partySize || !['1-3', '4-7'].includes(partySize)) {
      return NextResponse.json({ error: 'partySize must be "1-3" or "4-7"' }, { status: 400 })
    }
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json({ error: 'customerName is required (min 2 chars)' }, { status: 400 })
    }
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: 'valid customerEmail is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Find tour by ID or slug
    let tour: any = null
    if (tourId) {
      try {
        tour = await payload.findByID({ collection: 'tours', id: tourId })
      } catch {
        // not found
      }
    } else if (tourSlug) {
      const result = await payload.find({
        collection: 'tours',
        where: { slug: { equals: tourSlug } },
        limit: 1,
      })
      tour = result.docs[0] || null
    }

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    // Derive priceTier from partySize
    const priceTier = partySize === '1-3' ? 'price1to3' : 'price4to7'

    // Create booking
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        tour: tour.id,
        date,
        partySize,
        priceTier,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        notes: message?.trim() || undefined,
        status: 'pending',
        source: 'website',
      },
    })

    // Send notification email to admin
    const partyLabel = partySize === '1-3' ? '1–3 people' : '4–7 people'
    const adminHtml = `
      <h2>New Booking Request</h2>
      <ul>
        <li><strong>Tour:</strong> ${tour.title}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Party size:</strong> ${partyLabel}</li>
        <li><strong>Customer:</strong> ${customerName.trim()}</li>
        <li><strong>Email:</strong> ${customerEmail.trim()}</li>
        ${message ? `<li><strong>Message:</strong> ${message.trim()}</li>` : ''}
      </ul>
      <p><a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin/collections/bookings/${booking.id}">View in Admin</a></p>
    `

    try {
      await payload.sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Booking: ${tour.title} – ${date}`,
        html: adminHtml,
      })
    } catch (err) {
      console.error('Failed to send admin notification:', err)
    }

    return NextResponse.json(
      {
        success: true,
        bookingId: booking.id,
        message: 'Booking request received. We will contact you shortly.',
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Booking creation error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
