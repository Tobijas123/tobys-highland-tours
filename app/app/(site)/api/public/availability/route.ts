import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const month = url.searchParams.get('month')
    const partySize = url.searchParams.get('partySize')

    // Validate month param (YYYY-MM)
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'month parameter is required in YYYY-MM format' },
        { status: 400 }
      )
    }

    // Validate partySize param
    if (!partySize || !['1-3', '4-7'].includes(partySize)) {
      return NextResponse.json(
        { error: 'partySize parameter is required ("1-3" or "4-7")' },
        { status: 400 }
      )
    }

    // Parse month to get date range
    const [yearStr, monthStr] = month.split('-')
    const year = parseInt(yearStr, 10)
    const monthNum = parseInt(monthStr, 10)

    if (monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: 'Invalid month value (must be 01-12)' },
        { status: 400 }
      )
    }

    // First and last day of month
    const firstDay = `${month}-01`
    const lastDay = new Date(year, monthNum, 0).toISOString().split('T')[0]

    // Determine required seats based on party size
    const requiredSeats = partySize === '1-3' ? 3 : 7

    const payload = await getPayload({ config })

    // Fetch active vehicles with enough seats
    const vehiclesResult = await payload.find({
      collection: 'vehicles',
      where: {
        isActive: { equals: true },
        seats: { greater_than_equal: requiredSeats },
      },
      limit: 100,
      depth: 0,
    })

    const vehicles = vehiclesResult.docs
    const vehicleIds = new Set(vehicles.map((v) => v.id))

    // Fetch confirmed bookings in date range with a vehicle assigned
    const bookingsResult = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { status: { equals: 'confirmed' } },
          { vehicle: { exists: true } },
          { date: { greater_than_equal: firstDay } },
          { date: { less_than_equal: lastDay } },
        ],
      },
      limit: 500,
      depth: 0,
    })

    // Build map: date -> set of booked vehicle IDs
    const bookedByDate = new Map<string, Set<number>>()

    for (const booking of bookingsResult.docs) {
      const bookingDate = booking.date as string
      const vehicleId = typeof booking.vehicle === 'object'
        ? (booking.vehicle as any)?.id
        : booking.vehicle

      if (!vehicleId) continue

      if (!bookedByDate.has(bookingDate)) {
        bookedByDate.set(bookingDate, new Set())
      }
      bookedByDate.get(bookingDate)!.add(vehicleId as number)
    }

    // Generate all dates in month and check availability
    const disabledDates: { date: string; reason: string }[] = []
    const daysInMonth = new Date(year, monthNum, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${month}-${String(day).padStart(2, '0')}`
      const bookedVehicles = bookedByDate.get(dateStr) || new Set()

      // Count available vehicles (have enough seats AND not booked on this date)
      let availableCount = 0
      for (const vId of vehicleIds) {
        if (!bookedVehicles.has(vId as number)) {
          availableCount++
        }
      }

      if (availableCount === 0) {
        disabledDates.push({ date: dateStr, reason: 'fully_booked' })
      }
    }

    return NextResponse.json({
      month,
      partySize,
      disabledDates,
      fullyBookedMessage: "We're fully booked on this date. Please contact us — we may be able to arrange an alternative.",
    })
  } catch (err) {
    console.error('[AVAILABILITY API] Error:', err)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
