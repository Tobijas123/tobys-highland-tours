import type { Metadata } from 'next'
import BookingSidebarClient from '../../components/BookingSidebarClient'
import { TourTitleClient, TourDescriptionClient, BackToToursClient, HighlightsTitleClient, NoImageClient } from './TourTitleClient'
import TourGallerySlider from './TourGallerySlider'

export const dynamic = 'force-dynamic'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://tobyshighlandtours.com').replace(/\/$/, '')

function toPublicURL(url: string) {
  const base = process.env.PAYLOAD_PUBLIC_SERVER_URL
  if (!base) return url
  return url.replace(/^http:\/\/localhost:3000/, base)
}

type MediaDoc = {
  url?: string
  alt?: string | null
}

type I18nGroup = {
  [key: string]: string | unknown | undefined
}

type DescriptionStyle = {
  backgroundColor?: string
  textColor?: string
  padding?: string
  borderRadius?: string
}

type Tour = {
  id: string | number
  title?: string
  slug?: string
  shortDescription?: string
  longDescription?: unknown
  descriptionStyle?: DescriptionStyle | null
  heroImage?: MediaDoc | null
  gallery?: { id: string; image?: MediaDoc | null }[]
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tour = await getTourBySlug(slug)

  if (!tour) {
    return {
      title: "Tour Not Found | Toby's Highland Tours",
    }
  }

  const title = `${tour.title} | Toby's Highland Tours`
  const description = tour.shortDescription || `Private ${tour.title} from Inverness. Flexible stops, small groups, local driver-guide.`
  const heroImageUrl = tour.heroImage?.url ? toPublicURL(tour.heroImage.url) : undefined

  return {
    title,
    description,
    alternates: {
      canonical: `/tours/${tour.slug}`,
    },
    openGraph: {
      title: tour.title,
      description,
      url: `${siteUrl}/tours/${tour.slug}`,
      type: 'website',
      ...(heroImageUrl && {
        images: [{ url: heroImageUrl, width: 1200, height: 630, alt: tour.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: tour.title,
      description,
      ...(heroImageUrl && {
        images: [heroImageUrl],
      }),
    },
  }
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

  // Build slides: gallery first, fallback to heroImage
  const slides: { url: string; alt: string }[] = []
  if (tour.gallery && tour.gallery.length > 0) {
    for (const item of tour.gallery) {
      if (typeof item.image?.url === 'string') {
        slides.push({ url: toPublicURL(item.image.url), alt: item.image.alt || tour.title || 'Tour image' })
      }
    }
  }
  if (slides.length === 0 && typeof tour.heroImage?.url === 'string') {
    slides.push({ url: toPublicURL(tour.heroImage.url), alt: tour.heroImage.alt || tour.title || 'Tour image' })
  }

  const heroImageUrl = tour.heroImage?.url ? toPublicURL(tour.heroImage.url) : undefined
  const lowestPrice = tour.price1to3 ?? tour.price4to7 ?? tour.priceFrom

  const tourSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.shortDescription,
    ...(heroImageUrl && { image: heroImageUrl }),
    ...(tour.durationHours && { duration: `PT${tour.durationHours}H` }),
    provider: {
      '@type': 'TravelAgency',
      name: "Toby's Highland Tours",
      url: siteUrl,
    },
    offers: {
      '@type': 'Offer',
      ...(lowestPrice && { price: lowestPrice }),
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/tours/${tour.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tourSchema) }}
      />
    <main style={{ padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          <p style={{ marginBottom: 16 }}>
            <BackToToursClient />
          </p>

          <TourTitleClient tour={{ title: tour.title, i18n: tour.i18n }} />

          <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4 md:gap-6">
          {/* LEFT: image + description */}
          <div
            className="card"
            style={{
              padding: 0,
              ...(tour.descriptionStyle?.backgroundColor && { background: tour.descriptionStyle.backgroundColor }),
            }}
          >
            {slides.length > 0 ? (
              <TourGallerySlider slides={slides} />
            ) : (
              <div className="tourMedia" style={{ width: '100%', aspectRatio: '16/9', background: 'rgba(11,31,58,.04)' }}>
                <NoImageClient />
              </div>
            )}

            <div
              style={{
                display: 'flow-root',
                width: '100%',
                boxSizing: 'border-box',
                padding: tour.descriptionStyle?.padding || 32,
                color: tour.descriptionStyle?.textColor || 'inherit',
              }}
            >
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
            className="card w-full max-w-full overflow-x-hidden md:sticky md:top-[18px]"
            style={{
              padding: 18,
              boxSizing: 'border-box',
              height: 'fit-content',
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

      </div>
    </main>
    </>
  )
}
