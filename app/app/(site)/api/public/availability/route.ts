import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { pickVehicle, getRequiredSeats } from '../../../lib/vehicleAllocation'

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

    const payload = await getPayload({ config })

    // Fetch ALL active vehicles sorted by seats ASC
    const vehiclesResult = await payload.find({
      collection: 'vehicles',
      where: { isActive: { equals: true } },
      sort: 'seats',
      limit: 100,
      depth: 0,
    })

    const vehicles = vehiclesResult.docs.map((v: any) => ({
      id: v.id as number,
      seats: v.seats as number,
    }))

    // Fetch non-cancelled bookings in date range (pending + confirmed block)
    const bookingsResult = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { status: { not_equals: 'cancelled' } },
          { date: { greater_than_equal: firstDay } },
          { date: { less_than_equal: lastDay } },
        ],
      },
      limit: 500,
      depth: 0,
    })

    // Group bookings by date
    const byDate = new Map<string, { vehicle: number | null; partySize: string }[]>()
    for (const b of bookingsResult.docs) {
      const d = b.date as string
      if (!byDate.has(d)) byDate.set(d, [])
      byDate.get(d)!.push({
        vehicle: typeof b.vehicle === 'object' ? (b.vehicle as any)?.id : (b.vehicle as number) || null,
        partySize: b.partySize as string,
      })
    }

    // Check each day using pickVehicle
    const disabledDates: { date: string; reason: string }[] = []
    const daysInMonth = new Date(year, monthNum, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${month}-${String(day).padStart(2, '0')}`
      const dayBookings = byDate.get(dateStr) || []
      const result = pickVehicle(vehicles, dayBookings, partySize)
      if (!result) {
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
