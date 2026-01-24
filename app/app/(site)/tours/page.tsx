export const dynamic = 'force-dynamic'
import ToursListClient from './ToursListClient'

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
  price1to3?: number
  price4to7?: number
  durationHours?: number
  confirmedCount?: number
  bookingCount?: number
}

function toPublicURL(url: string) {
  const base = process.env.PAYLOAD_PUBLIC_SERVER_URL
  if (!base) return url
  return url.replace(/^http:\/\/localhost:3000/, base)
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

  // Map to serializable data for client component
  const toursForClient = tours.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    shortDescription: t.shortDescription,
    imageUrl: typeof t.heroImage?.url === 'string' ? toPublicURL(t.heroImage.url) : null,
    imageAlt: t.heroImage?.alt ?? null,
    price1to3: t.price1to3,
    price4to7: t.price4to7,
    durationHours: t.durationHours,
    confirmedCount: t.confirmedCount,
    bookingCount: t.bookingCount,
  }))

  return (
    <main style={{ padding: '28px 24px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          <h1 style={{ fontSize: 36, fontWeight: 950, margin: '0 0 6px' }}>Tours</h1>
          <div className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
            Pick a tour and see details + booking sidebar.
          </div>

          <ToursListClient tours={toursForClient} />
        </div>
      </div>
    </main>
  )
}
