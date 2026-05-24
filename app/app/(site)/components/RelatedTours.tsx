'use client'

type RelatedTour = {
  id: string | number
  title?: string
  slug?: string
  shortDescription?: string
  heroImage?: {
    url?: string
    alt?: string | null
  } | null
  price1to3?: number
  durationHours?: number
}

interface RelatedToursProps {
  tours: RelatedTour[]
  title?: string
}

export default function RelatedTours({ tours, title = 'You Might Also Like' }: RelatedToursProps) {
  if (!tours || tours.length === 0) return null

  return (
    <div style={{ marginTop: 40 }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 800,
          marginBottom: 16,
          color: 'var(--navy)',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {tours.slice(0, 3).map((tour) => (
          <a
            key={String(tour.id)}
            href={`/tours/${tour.slug}`}
            className="card"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                aspectRatio: '16/9',
                background: 'var(--stoneSoft)',
                overflow: 'hidden',
              }}
            >
              {tour.heroImage?.url ? (
                <img
                  src={tour.heroImage.url}
                  alt={tour.heroImage.alt || tour.title || 'Tour'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--muted)',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  No image
                </div>
              )}
            </div>
            <div style={{ padding: 14 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--ink)',
                }}
              >
                {tour.title}
              </h3>
              {tour.shortDescription && (
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: 'var(--muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {tour.shortDescription}
                </p>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {typeof tour.durationHours === 'number' && (
                  <span className="badge badgeMoss">{tour.durationHours}h</span>
                )}
                {typeof tour.price1to3 === 'number' && (
                  <span className="badge">From £{tour.price1to3}</span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
