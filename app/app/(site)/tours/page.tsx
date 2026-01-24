export const dynamic = 'force-dynamic'
import ToursListClient from './ToursListClient'

function toPublicURL(url: string) {
  const base = process.env.PAYLOAD_PUBLIC_SERVER_URL
  if (!base) return url
  return url.replace(/^http:\/\/localhost:3000/, base)
}

type MediaDoc = {
  url?: string
  alt?: string | null
}

type Tour = {
  id: string | number
  title?: string
  slug?: string
  shortDescription?: string
  heroImage?: MediaDoc | null
  priceFrom?: number
  price1to3?: number
  price4to7?: number
  durationHours?: number
  confirmedCount?: number
  bookingCount?: number
}

async function getTours(): Promise<Tour[]> {
  const res = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/api/tours?limit=50&depth=1`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data?.docs ?? []) as Tour[]
}

export default async function ToursPage() {
  const tours = await getTours()

  return (
    <main style={{ padding: '28px 24px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          <h1 style={{ fontSize: 36, fontWeight: 950, margin: '0 0 6px' }}>Tours</h1>
          <div className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
            Pick a tour and see details + booking sidebar.
          </div>

          <ToursListClient tours={tours} toPublicURL={toPublicURL} />
        </div>
      </div>
    </main>
  )
}
