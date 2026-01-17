export const dynamic = 'force-dynamic'

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
  durationHours?: number
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

          {tours.length === 0 ? (
          <div className="card" style={{ padding: 16 }}>
            No tours yet.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 16,
              alignItems: 'stretch',
            }}
          >
            {tours.map((t) => {
              const href = `/tours/${t.slug ?? t.id}`
              const imgUrl =
                typeof t.heroImage?.url === 'string' ? toPublicURL(t.heroImage.url) : null

              return (
                <a
                  key={String(t.id)}
                  href={href}
                  className="card tourCard"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    className="tourMedia"
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      background: 'rgba(15,23,42,.04)',
                      borderBottom: '1px solid var(--border)',
                      overflow: 'hidden',
                    }}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={t.heroImage?.alt || t.title || 'Tour image'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          opacity: 0.8,
                        }}
                      >
                        Image
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 6 }}>
                      {t.title ?? 'Tour'}
                    </div>

                    <div style={{ fontSize: 13, opacity: 0.82, lineHeight: 1.4, minHeight: 36 }}>
                      {t.shortDescription ?? 'No short description yet.'}
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                      <span className="badge badgeMoss" style={{ fontWeight: 900 }}>
                        {typeof t.durationHours === 'number' ? `${t.durationHours}h` : '—'}
                      </span>

                      <span className="badge badgeGold" style={{ fontWeight: 900 }}>
                        {typeof t.priceFrom === 'number' ? `from £${t.priceFrom}` : 'price —'}
                      </span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
        </div>

        <style>{`
          @media (max-width: 1000px) {
            main div[style*="grid-template-columns"] { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }
          @media (max-width: 640px) {
            main div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </main>
  )
}

