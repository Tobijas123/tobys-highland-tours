import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const siteUrl = (process.env.SITE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://tobyshighlandtours.com').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Scotland Airport Transfers & Private Driver Services',
  description: 'Reliable transfers to all Scottish airports and cities—any direction. Private car or minibus, door-to-door pickup, comfortable rides and professional service.',
  openGraph: {
    title: 'Scotland Airport Transfers & Private Driver Services',
    description: 'Reliable transfers to all Scottish airports and cities—any direction. Private car or minibus, door-to-door pickup, comfortable rides and professional service.',
    url: '/transfers',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: "Toby's Highland Tours - Private tours & transfers from Inverness" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scotland Airport Transfers & Private Driver Services',
    description: 'Reliable transfers to all Scottish airports and cities—any direction. Private car or minibus, door-to-door pickup, comfortable rides and professional service.',
    images: [{ url: '/twitter-image', width: 1200, height: 630, alt: "Toby's Highland Tours - Private tours & transfers from Inverness" }],
  },
}

function toPublicURL(url: string) {
  const base = process.env.PAYLOAD_PUBLIC_SERVER_URL
  if (!base) return url
  return url.replace(/^http:\/\/localhost:3000/, base)
}

type MediaDoc = {
  url?: string
  alt?: string | null
}

type Transfer = {
  id: string | number
  title?: string
  slug?: string
  shortDescription?: string
  heroImage?: MediaDoc | null
  price1to3?: number
  price4to7?: number
  durationText?: string
  fromLocation?: string
  toLocation?: string
}

async function getTransfers(): Promise<Transfer[]> {
  const res = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/api/transfers?limit=50&depth=1`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data?.docs ?? []) as Transfer[]
}

export default async function TransfersPage() {
  const transfers = await getTransfers()

  return (
    <main style={{ padding: '28px 24px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          <h1 style={{ fontSize: 36, fontWeight: 950, margin: '0 0 6px' }}>Transfers</h1>
          <div className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
            Airport pickups, hotel transfers and more.
          </div>

          {transfers.length === 0 ? (
          <div className="card" style={{ padding: 16 }}>
            No transfers yet.
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
            {transfers.map((t) => {
              const href = `/transfers/${t.slug ?? t.id}`
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
                      background: 'rgba(11,31,58,.04)',
                    }}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={t.heroImage?.alt || t.title || 'Transfer image'}
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
                          opacity: 0.6,
                        }}
                      >
                        No image
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 16 }}>
                    <div className="titlePremium" style={{ fontSize: 18, marginBottom: 6 }}>
                      {t.title ?? 'Transfer'}
                    </div>

                    <div className="muted" style={{ fontSize: 13, lineHeight: 1.45, minHeight: 36 }}>
                      {t.shortDescription ?? (t.fromLocation && t.toLocation ? `${t.fromLocation} → ${t.toLocation}` : 'No description yet.')}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="badge badgeMoss">
                        {t.durationText ?? '—'}
                      </span>
                    </div>
                    <div className="priceGrid">
                      <div className="pricePill pricePillGold">
                        <span className="label">1–3 people</span>
                        <span className="price">
                          {typeof t.price1to3 === 'number' ? `£${t.price1to3}` : '—'}
                        </span>
                      </div>
                      <div className="pricePill pricePillMoss">
                        <span className="label">4–7 people</span>
                        <span className="price">
                          {typeof t.price4to7 === 'number' ? `£${t.price4to7}` : '—'}
                        </span>
                      </div>
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
