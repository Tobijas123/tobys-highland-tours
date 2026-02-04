import { getPayload } from 'payload'
import config from '@payload-config'

type VehicleInfo = { id: number; seats: number }
type BookingInfo = { vehicle: number | null; partySize: string }

export function getRequiredSeats(partySize: string): number {
  return partySize === '4-7' ? 7 : 3
}

/**
 * Pure function: given sorted vehicles and existing bookings for a date,
 * pick the smallest available vehicle for a new booking with `newPartySize`.
 * Returns null if nothing fits.
 */
export function pickVehicle(
  vehicles: VehicleInfo[], // MUST be sorted by seats ASC
  bookingsForDate: BookingInfo[],
  newPartySize: string,
): VehicleInfo | null {
  const occupied = new Set<number>()

  // 1. Mark explicitly assigned vehicles as occupied
  for (const b of bookingsForDate) {
    if (b.vehicle) occupied.add(b.vehicle)
  }

  // 2. Virtual-allocate for unassigned bookings (4-7 first so they grab buses)
  const unassigned = bookingsForDate
    .filter((b) => !b.vehicle)
    .sort((a, b) => {
      if (a.partySize === '4-7' && b.partySize !== '4-7') return -1
      if (a.partySize !== '4-7' && b.partySize === '4-7') return 1
      return 0
    })

  for (const b of unassigned) {
    const req = getRequiredSeats(b.partySize)
    const fit = vehicles.find((v) => v.seats >= req && !occupied.has(v.id))
    if (fit) occupied.add(fit.id)
  }

  // 3. Pick smallest fitting vehicle for the NEW booking
  const req = getRequiredSeats(newPartySize)
  return vehicles.find((v) => v.seats >= req && !occupied.has(v.id)) || null
}

/**
 * DB-backed wrapper: fetch vehicles + bookings for a single date, then pick.
 */
export async function allocateVehicleForDate(
  date: string,
  partySize: string,
): Promise<VehicleInfo | null> {
  const payload = await getPayload({ config })

  const vResult = await payload.find({
    collection: 'vehicles',
    where: { isActive: { equals: true } },
    sort: 'seats',
    limit: 100,
    depth: 0,
  })
  const vehicles: VehicleInfo[] = vResult.docs.map((v: any) => ({
    id: v.id,
    seats: v.seats as number,
  }))

  const bResult = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        { date: { equals: date } },
        { status: { not_equals: 'cancelled' } },
      ],
    },
    limit: 100,
    depth: 0,
  })

  const bookings: BookingInfo[] = bResult.docs.map((b: any) => ({
    vehicle: typeof b.vehicle === 'object' ? b.vehicle?.id : b.vehicle || null,
    partySize: b.partySize as string,
  }))

  return pickVehicle(vehicles, bookings, partySize)
}
