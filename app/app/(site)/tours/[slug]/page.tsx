import BookingSidebarClient from '../../components/BookingSidebarClient'
import { TourTitleClient, TourDescriptionClient, BackToToursClient, HighlightsTitleClient, NoImageClient } from './TourTitleClient'

export const dynamic = 'force-dynamic'

function toPublicURL(url: string) {
  const base = process.env.PAYLOAD_PUBLIC_SERVER_URL
  if (!base) return url
  return url.replace(/^http:\/\/localhost:3000/, base)
}

function lexicalToPlainText(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') return value

  const out: string[] = []

  const walk = (node: any) => {
    if (!node) return
    if (Array.isArray(node)) return node.forEach(walk)

    if (node.type === 'text' && typeof node.text === 'string') {
      out.push(node.text)
      return
    }

    if (node.type === 'paragraph' || node.type === 'heading') {
      if (node.children) walk(node.children)
      out.push('\n\n')
      return
    }

    if (node.children) walk(node.children)
  }

  if (value?.root?.children) walk(value.root.children)
  else walk(value)

  return out.join('').replace(/\n{3,}/g, '\n\n').trim()
}

type MediaDoc = {
  url?: string
  alt?: string | null
}

type I18nGroup = {
  [key: string]: string | unknown | undefined
}

type Tour = {
  id: string | number
  title?: string
  slug?: string
  shortDescription?: string
  longDescription?: unknown
  heroImage?: MediaDoc | null
  priceFrom?: number
  price1to3?: number
  price4to7?: number
  durationHours?: number
  highlights?: { text: string }[]
  i18n?: I18nGroup | null
}

async function getTourBySlug(slug: string): Promise<Tour | null> {
  const url = `http://127.0.0.1:3000/api/tours?where[slug][equals]=${encodeURIComponent(
    slug,
  )}&limit=1&depth=2`

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null

  const data = await res.json()
  const tour: Tour | undefined = data?.docs?.[0]
  return tour ?? null
}

export default async function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tour = await getTourBySlug(slug)

  if (!tour) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Tour not found</h1>
        <p style={{ marginTop: 12 }}>
          <a href="/tours" style={{ textDecoration: 'underline' }}>
            ← Back to Tours
          </a>
        </p>
      </main>
    )
  }

  const imgUrl = typeof tour.heroImage?.url === 'string' ? toPublicURL(tour.heroImage.url) : null

  return (
    <main style={{ padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          <p style={{ marginBottom: 16 }}>
            <BackToToursClient />
          </p>

          <TourTitleClient tour={{ title: tour.title, i18n: tour.i18n }} />

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 22 }}>
          {/* LEFT: image + description */}
          <div className="card" style={{ padding: 0 }}>
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
                  alt={tour.heroImage?.alt || tour.title || 'Tour image'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <NoImageClient />
              )}
            </div>

            <div style={{ padding: 20 }}>
              <TourDescriptionClient
                tour={{
                  title: tour.title,
                  shortDescription: tour.shortDescription,
                  longDescription: tour.longDescription,
                  i18n: tour.i18n,
                }}
              />

              {tour.highlights && tour.highlights.length > 0 ? (
                <div style={{ marginTop: 20 }}>
                  <HighlightsTitleClient />
                  <ul className="prose" style={{ display: 'grid', gap: 6 }}>
                    {tour.highlights.map((h, idx) => (
                      <li key={idx}>{h.text}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          {/* RIGHT: booking sidebar */}
          <aside
            className="card"
            style={{
              padding: 14,
              height: 'fit-content',
              position: 'sticky',
              top: 18,
            }}
          >
            <BookingSidebarClient
              itemType="tour"
              itemId={typeof tour.id === 'number' ? tour.id : Number(tour.id)}
              itemTitle={tour.title ?? 'Tour'}
              price1to3={typeof tour.price1to3 === 'number' ? tour.price1to3 : null}
              price4to7={typeof tour.price4to7 === 'number' ? tour.price4to7 : null}
              durationText={typeof tour.durationHours === 'number' ? `${tour.durationHours} hours` : '—'}
            />
          </aside>
          </div>
        </div>

        <style>{`
          @media (max-width: 980px) {
            main div[style*="grid-template-columns: 3fr 1fr"] { grid-template-columns: 1fr !important; }
            aside { position: static !important; }
          }
        `}</style>
      </div>
    </main>
  )
}

