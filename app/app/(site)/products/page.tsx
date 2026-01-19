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
  price1to3?: number
  price4to7?: number
  durationHours?: number
}

type Transfer = {
  id: string | number
  title?: string
  slug?: string
  shortDescription?: string
  heroImage?: MediaDoc | null
  price1to3?: number
  price4to7?: number
}

async function getTours(): Promise<Tour[]> {
  const res = await fetch(
    `${process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/api/tours?limit=50&depth=1`,
    { cache: 'no-store' }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data?.docs ?? []) as Tour[]
}

async function getTransfers(): Promise<Transfer[]> {
  const res = await fetch(
    `${process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/api/transfers?limit=50&depth=1`,
    { cache: 'no-store' }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data?.docs ?? []) as Transfer[]
}

function ProductCard({
  href,
  image,
  title,
  description,
  price1to3,
  price4to7,
  badge,
}: {
  href: string
  image: MediaDoc | null | undefined
  title: string
  description: string
  price1to3?: number
  price4to7?: number
  badge?: string
}) {
  const imgUrl = typeof image?.url === 'string' ? toPublicURL(image.url) : null

  return (
    <a
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
            alt={image?.alt || title}
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
          {title}
        </div>

        <div className="muted" style={{ fontSize: 13, lineHeight: 1.45, minHeight: 36 }}>
          {description}
        </div>

        {badge && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <span className="badge badgeMoss">{badge}</span>
          </div>
        )}

        <div className="priceGrid">
          <div className="pricePill pricePillGold">
            <span className="label">1–3 people</span>
            <span className="price">
              {typeof price1to3 === 'number' ? `£${price1to3}` : '—'}
            </span>
          </div>
          <div className="pricePill pricePillMoss">
            <span className="label">4–7 people</span>
            <span className="price">
              {typeof price4to7 === 'number' ? `£${price4to7}` : '—'}
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

export default async function ProductsPage() {
  const [tours, transfers] = await Promise.all([getTours(), getTransfers()])

  return (
    <>
      <h1 style={{ fontSize: 36, fontWeight: 950, margin: '0 0 8px' }}>Our Offerings</h1>
      <p className="muted" style={{ marginBottom: 32 }}>
        Explore our guided tours and transfer services across the Scottish Highlands.
      </p>

      {/* Tours Section */}
      <section style={{ marginBottom: 48 }}>
        <div className="sectionHeader">
          <h2 className="sectionTitle">Tours</h2>
          <a href="/tours" className="viewAllLink">
            View all
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </a>
        </div>

        {tours.length === 0 ? (
          <div className="card" style={{ padding: 24 }}>
            <p className="muted">No tours available yet.</p>
          </div>
        ) : (
          <div className="productGrid">
            {tours.map((t) => (
              <ProductCard
                key={String(t.id)}
                href={`/tours/${t.slug ?? t.id}`}
                image={t.heroImage}
                title={t.title ?? 'Tour'}
                description={t.shortDescription ?? 'No description yet.'}
                price1to3={t.price1to3}
                price4to7={t.price4to7}
                badge={typeof t.durationHours === 'number' ? `${t.durationHours}h` : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {/* Transfers Section */}
      <section>
        <div className="sectionHeader">
          <h2 className="sectionTitle">Transfer Services</h2>
          <a href="/transfers" className="viewAllLink">
            View all
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </a>
        </div>

        {transfers.length === 0 ? (
          <div className="card" style={{ padding: 24 }}>
            <p className="muted">No transfers available yet.</p>
          </div>
        ) : (
          <div className="productGrid">
            {transfers.map((t) => (
              <ProductCard
                key={String(t.id)}
                href={`/transfers/${t.slug ?? t.id}`}
                image={t.heroImage}
                title={t.title ?? 'Transfer'}
                description={t.shortDescription ?? 'No description yet.'}
                price1to3={t.price1to3}
                price4to7={t.price4to7}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
