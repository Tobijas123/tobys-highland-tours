import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { t } from '../../lib/translations'
import ContactFormClient from '../../components/ContactFormClient'

export const dynamic = 'force-dynamic'

const siteUrl = (process.env.SITE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://tobyshighlandtours.com').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Request a Custom Transfer | Get a Quote',
  description: 'Need a transfer to a destination not listed? Request a custom quote for airport pickups, hotel transfers, or any journey across Scotland.',
  openGraph: {
    title: 'Request a Custom Transfer | Get a Quote',
    description: 'Need a transfer to a destination not listed? Request a custom quote for airport pickups, hotel transfers, or any journey across Scotland.',
    url: '/transfers/request',
    type: 'website',
  },
}

type MediaDoc = {
  url?: string
  alt?: string | null
}

type Transfer = {
  id: string | number
  title?: string
  heroImage?: MediaDoc | number | null
}

async function getGalleryTransfers(): Promise<Transfer[]> {
  try {
    const res = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/api/transfers?limit=6&depth=2`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data?.docs ?? []) as Transfer[]
  } catch {
    return []
  }
}

export default async function TransferRequestPage() {
  const langCookie = (await cookies()).get('site_lang')?.value
  const lang = langCookie === 'es' ? 'es' : 'en'

  const transfers = await getGalleryTransfers()

  // Extract image URLs from transfers
  const galleryImages = transfers.slice(0, 6).map((transfer) => {
    const heroImage = transfer.heroImage
    if (heroImage && typeof heroImage === 'object' && 'url' in heroImage && heroImage.url) {
      return { url: heroImage.url, alt: heroImage.alt || transfer.title || 'Scotland transfer' }
    }
    return null
  })

  return (
    <main style={{ padding: '28px 24px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <a
            href="/transfers"
            style={{
              display: 'inline-block',
              marginBottom: 16,
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--moss)',
              textDecoration: 'none',
            }}
          >
            {lang === 'es' ? '← Volver a Traslados' : '← Back to Transfers'}
          </a>
          <h1
            style={{
              fontSize: 38,
              fontWeight: 950,
              letterSpacing: '-0.02em',
              margin: '0 0 12px',
              color: 'var(--navy)',
            }}
          >
            {t('transferRequest.title', lang)}
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--muted)',
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            {t('transferRequest.subtitle', lang)}
          </p>
        </div>

        {/* Gallery 3x2 */}
        <div className="card" style={{ padding: 20, marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              marginBottom: 16,
              color: 'var(--navy)',
            }}
          >
            {t('transferRequest.galleryTitle', lang)}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                style={{
                  aspectRatio: '4/3',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: 'var(--stoneSoft)',
                }}
              >
                {img ? (
                  <img
                    src={img.url}
                    alt={img.alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                    {t('common.noImage', lang)}
                  </div>
                )}
              </div>
            ))}
            {/* Fill remaining slots if less than 6 images */}
            {Array.from({ length: Math.max(0, 6 - galleryImages.length) }).map((_, idx) => (
              <div
                key={`placeholder-${idx}`}
                style={{
                  aspectRatio: '4/3',
                  borderRadius: 12,
                  background: 'var(--stoneSoft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--muted)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {t('common.noImage', lang)}
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="card" style={{ padding: 24, marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 12,
              color: 'var(--navy)',
            }}
          >
            {t('transferRequest.descTitle', lang)}
          </h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <li style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink)' }}>
              {t('transferRequest.bullet1', lang)}
            </li>
            <li style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink)' }}>
              {t('transferRequest.bullet2', lang)}
            </li>
            <li style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink)' }}>
              {t('transferRequest.bullet3', lang)}
            </li>
          </ul>
        </div>

        {/* WhatsApp CTA + Contact Form */}
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          {/* WhatsApp button */}
          <a
            href="https://wa.me/447383488007"
            target="_blank"
            rel="noreferrer"
            className="btn btnWhatsApp"
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: 15,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t('transferRequest.whatsappCta', lang)}
          </a>

          {/* Divider text */}
          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--muted)',
              marginBottom: 16,
            }}
          >
            {t('transferRequest.orFillForm', lang)}
          </p>

          {/* Contact form */}
          <ContactFormClient />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .card > div[style*="grid-template-columns"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </main>
  )
}
