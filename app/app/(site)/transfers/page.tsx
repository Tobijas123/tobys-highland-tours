import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { t } from '../lib/translations'

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
  const langCookie = (await cookies()).get('site_lang')?.value
  const lang = langCookie === 'es' ? 'es' : 'en'

  return (
    <main style={{ padding: '28px 24px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          <h1 style={{ fontSize: 36, fontWeight: 950, margin: '0 0 6px' }}>{t('transfers.title', lang)}</h1>
          <div className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
            {t('transfers.subtitle', lang)}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 16,
              alignItems: 'stretch',
            }}
          >
            {/* Request a Quote tile - always first */}
            <a
              href="/transfers/request"
              className="card tourCard"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, var(--mossSoft), var(--surface))',
                borderColor: 'rgba(74,124,111,.25)',
              }}
            >
              {/* Mini gallery 3x2 */}
              <div style={{ padding: 10, paddingBottom: 0 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 4,
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  {transfers.slice(0, 6).map((tr, idx) => {
                    const imgUrl = typeof tr.heroImage?.url === 'string' ? toPublicURL(tr.heroImage.url) : null
                    return (
                      <div
                        key={idx}
                        style={{
                          aspectRatio: '4/3',
                          background: 'var(--stoneSoft)',
                          overflow: 'hidden',
                        }}
                      >
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'var(--stoneSoft)' }} />
                        )}
                      </div>
                    )
                  })}
                  {/* Placeholders if less than 6 transfers */}
                  {Array.from({ length: Math.max(0, 6 - transfers.length) }).map((_, idx) => (
                    <div
                      key={`ph-${idx}`}
                      style={{
                        aspectRatio: '4/3',
                        background: 'var(--stoneSoft)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ padding: 16 }}>
                <div
                  className="titlePremium"
                  style={{
                    fontSize: 18,
                    marginBottom: 6,
                    color: 'var(--moss)',
                  }}
                >
                  {t('transferRequest.cardTitle', lang)}
                </div>
                <div
                  className="muted"
                  style={{ fontSize: 13, lineHeight: 1.45 }}
                >
                  {t('transferRequest.cardSubtitle', lang)}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 12,
                    fontWeight: 800,
                    color: 'var(--moss)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {lang === 'es' ? 'Solicitar' : 'Get a quote'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {transfers.map((tr) => {
              const href = `/transfers/${tr.slug ?? tr.id}`
              const imgUrl =
                typeof tr.heroImage?.url === 'string' ? toPublicURL(tr.heroImage.url) : null

              return (
                <a
                  key={String(tr.id)}
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
                        alt={tr.heroImage?.alt || tr.title || 'Transfer image'}
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
                      {tr.title ?? t('common.transfer', lang)}
                    </div>

                    <div className="muted" style={{ fontSize: 13, lineHeight: 1.45, minHeight: 36 }}>
                      {tr.shortDescription ?? (tr.fromLocation && tr.toLocation ? `${tr.fromLocation} → ${tr.toLocation}` : t('common.noDescription', lang))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="badge badgeMoss">
                        {tr.durationText ?? '—'}
                      </span>
                    </div>
                    <div className="priceGrid">
                      <div className="pricePill pricePillGold">
                        <span className="label">{t('price.1to3', lang)}</span>
                        <span className="price">
                          {typeof tr.price1to3 === 'number' ? `£${tr.price1to3}` : '—'}
                        </span>
                      </div>
                      <div className="pricePill pricePillMoss">
                        <span className="label">{t('price.4to7', lang)}</span>
                        <span className="price">
                          {typeof tr.price4to7 === 'number' ? `£${tr.price4to7}` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
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
