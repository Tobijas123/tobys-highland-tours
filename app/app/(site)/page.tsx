import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { t } from './lib/translations'

export const dynamic = 'force-dynamic'

const siteUrl = (process.env.SITE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://tobyshighlandtours.com').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Private Highland Tours & Transfers | Toby's Highland Tours",
  description: "Private tours from Inverness across the Highlands. Loch Ness 360, Isle of Skye, cruise tours from Invergordon, and airport transfers across Scotland.",
  openGraph: {
    title: "Private Highland Tours & Transfers | Toby's Highland Tours",
    description: "Private tours from Inverness across the Highlands. Loch Ness 360, Isle of Skye, cruise tours from Invergordon, and airport transfers across Scotland.",
    url: '/',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: "Toby's Highland Tours - Private tours & transfers from Inverness" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Private Highland Tours & Transfers | Toby's Highland Tours",
    description: "Private tours from Inverness across the Highlands. Loch Ness 360, Isle of Skye, cruise tours from Invergordon, and airport transfers across Scotland.",
    images: [{ url: '/twitter-image', width: 1200, height: 630, alt: "Toby's Highland Tours - Private tours & transfers from Inverness" }],
  },
}

import HeroSliderClient from './components/HeroSliderClient'
import ContactFormClient from './components/ContactFormClient'
import PromoSectionClient from './components/PromoSectionClient'
import ReviewsRotatorClient from './components/ReviewsRotatorClient'
import SectionHeaderClient from './components/SectionHeaderClient'

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

type HeroSlide = {
  image?: MediaDoc | null
  heading?: string
  subheading?: string
}

type PromoSection = {
  enabled?: boolean
  heightPx?: number
  backgroundImages?: { image?: MediaDoc | null; focus?: string }[]
  overlayOpacity?: number
  heading?: string
  headingEffect?: 'none' | 'shadow' | 'glow' | 'outline'
  content?: unknown
  ctaLabel?: string
  ctaHref?: string
}

type HomepageData = {
  heroLogo?: MediaDoc | null
  heroSlides?: HeroSlide[]
  promoSection?: PromoSection
}

type Testimonial = {
  id: string
  authorName: string
  text: string
  rating: number
  source: 'facebook' | 'google' | 'manual'
  sourceUrl?: string
}

async function getHomepage(): Promise<HomepageData | null> {
  try {
    const res = await fetch(
      `${process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/api/globals/homepage?depth=1`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function getTours(): Promise<Tour[]> {
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

  // First try: sort by confirmedCount (most confirmed first)
  const res = await fetch(
    `${baseUrl}/api/tours?limit=6&depth=1&sort=-confirmedCount`,
    { cache: 'no-store' }
  )
  if (!res.ok) return []
  const data = await res.json()
  const docs = (data?.docs ?? []) as Tour[]

  // If all have confirmedCount = 0, fallback to bookingCount
  const hasConfirmed = docs.some((d: Tour & { confirmedCount?: number }) => (d.confirmedCount ?? 0) > 0)
  if (!hasConfirmed && docs.length > 0) {
    const fallbackRes = await fetch(
      `${baseUrl}/api/tours?limit=6&depth=1&sort=-bookingCount`,
      { cache: 'no-store' }
    )
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json()
      return (fallbackData?.docs ?? []) as Tour[]
    }
  }

  return docs
}

async function getTransfers(): Promise<Transfer[]> {
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

  // First try: sort by confirmedCount (most confirmed first)
  const res = await fetch(
    `${baseUrl}/api/transfers?limit=6&depth=1&sort=-confirmedCount`,
    { cache: 'no-store' }
  )
  if (!res.ok) return []
  const data = await res.json()
  const docs = (data?.docs ?? []) as Transfer[]

  // If all have confirmedCount = 0, fallback to bookingCount
  const hasConfirmed = docs.some((d: Transfer & { confirmedCount?: number }) => (d.confirmedCount ?? 0) > 0)
  if (!hasConfirmed && docs.length > 0) {
    const fallbackRes = await fetch(
      `${baseUrl}/api/transfers?limit=6&depth=1&sort=-bookingCount`,
      { cache: 'no-store' }
    )
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json()
      return (fallbackData?.docs ?? []) as Transfer[]
    }
  }

  return docs
}

async function getTestimonials(): Promise<Testimonial[]> {
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(
      `${baseUrl}/api/testimonials?where[featured][equals]=true&limit=12&sort=order`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data?.docs ?? []) as Testimonial[]
  } catch {
    return []
  }
}

function ProductCard({
  href,
  image,
  title,
  description,
  price1to3,
  price4to7,
  badge,
  lang,
}: {
  href: string
  image: MediaDoc | null | undefined
  title: string
  description: string
  price1to3?: number
  price4to7?: number
  badge?: string
  lang: 'en' | 'es'
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
            {t('common.noImage', lang)}
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
            <span className="label">{t('price.1to3', lang)}</span>
            <span className="price">
              {typeof price1to3 === 'number' ? `£${price1to3}` : '—'}
            </span>
          </div>
          <div className="pricePill pricePillMoss">
            <span className="label">{t('price.4to7', lang)}</span>
            <span className="price">
              {typeof price4to7 === 'number' ? `£${price4to7}` : '—'}
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

export default async function HomePage() {
  const langCookie = (await cookies()).get('site_lang')?.value
  const lang = langCookie === 'es' ? 'es' : 'en'

  const [tours, transfers, homepage, testimonials] = await Promise.all([
    getTours(),
    getTransfers(),
    getHomepage(),
    getTestimonials(),
  ])

  // Transform CMS slides to component format
  const heroSlides = homepage?.heroSlides
    ?.filter((s) => s.image?.url)
    .map((s) => ({
      image: toPublicURL(s.image!.url!),
      heading: s.heading,
      subheading: s.subheading,
    }))

  const heroLogoUrl = homepage?.heroLogo?.url ? toPublicURL(homepage.heroLogo.url) : null

  // Transform promo section data
  const promo = homepage?.promoSection
  const promoBackgroundImages = promo?.backgroundImages
    ?.filter((b) => b.image?.url)
    .map((b) => ({
      url: toPublicURL(b.image!.url!),
      focus: b.focus || 'center',
    })) ?? []

  return (
    <>
      <HeroSliderClient slides={heroSlides} logoUrl={heroLogoUrl} />

      {promo?.enabled && (
        <PromoSectionClient
          enabled={promo.enabled}
          heightPx={promo.heightPx}
          backgroundImages={promoBackgroundImages}
          overlayOpacity={promo.overlayOpacity}
          heading={promo.heading}
          headingEffect={promo.headingEffect}
          content={promo.content}
          ctaLabel={promo.ctaLabel}
          ctaHref={promo.ctaHref}
        />
      )}

      {/* Tours Section */}
      <section id="tours" style={{ marginBottom: 48, scrollMarginTop: 20 }}>
        <SectionHeaderClient titleKey="section.ourTours" linkKey="section.viewAllTours" href="/tours" />

        {tours.length === 0 ? (
          <div className="card" style={{ padding: 24 }}>
            <p className="muted">No tours available yet.</p>
          </div>
        ) : (
          <div className="productGrid">
            {tours.map((tour) => (
              <ProductCard
                key={String(tour.id)}
                href={`/tours/${tour.slug ?? tour.id}`}
                image={tour.heroImage}
                title={tour.title ?? 'Tour'}
                description={tour.shortDescription ?? 'No description yet.'}
                price1to3={tour.price1to3}
                price4to7={tour.price4to7}
                badge={typeof tour.durationHours === 'number' ? `${tour.durationHours}h` : undefined}
                lang={lang}
              />
            ))}
          </div>
        )}
      </section>

      {/* Transfers Section */}
      <section>
        <SectionHeaderClient titleKey="section.transfers" linkKey="section.viewAllTransfers" href="/transfers" />

        {transfers.length === 0 ? (
          <div className="card" style={{ padding: 24 }}>
            <p className="muted">No transfers available yet.</p>
          </div>
        ) : (
          <div className="productGrid">
            {transfers.map((tr) => (
              <ProductCard
                key={String(tr.id)}
                href={`/transfers/${tr.slug ?? tr.id}`}
                image={tr.heroImage}
                title={tr.title ?? 'Transfer'}
                description={tr.shortDescription ?? 'No description yet.'}
                price1to3={tr.price1to3}
                price4to7={tr.price4to7}
                lang={lang}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reviews Section */}
      {testimonials.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <SectionHeaderClient titleKey="section.reviews" />
          <ReviewsRotatorClient testimonials={testimonials} />
        </section>
      )}

      {/* Contact Section */}
      <section style={{ marginTop: 48 }}>
        <ContactFormClient />
      </section>
    </>
  )
}
