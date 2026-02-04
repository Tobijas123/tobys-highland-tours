'use client'

import { useState, useMemo } from 'react'
import { useLanguage } from '../lib/LanguageContext'
import { pickI18n } from '../lib/pickI18n'
import { useT } from '../lib/translations'

type I18nGroup = {
  [key: string]: string | unknown | undefined
}

type TourItem = {
  id: string | number
  title?: string
  slug?: string
  shortDescription?: string
  imageUrl?: string | null
  imageAlt?: string | null
  price1to3?: number
  price4to7?: number
  durationHours?: number
  confirmedCount?: number
  bookingCount?: number
  i18n?: I18nGroup | null
}

interface ToursListClientProps {
  tours: TourItem[]
}

type FilterKey = 'all' | 'popular' | 'half-day' | 'full-day' | 'loch-ness' | 'skye' | 'whisky'

// Filter keys that have translations
const FILTER_TRANSLATION_KEYS: Partial<Record<FilterKey, string>> = {
  'all': 'tours.filter.all',
  'popular': 'tours.filter.popular',
  'half-day': 'tours.filter.halfDay',
  'full-day': 'tours.filter.fullDay',
}

const FILTERS: { key: FilterKey; fallbackLabel: string }[] = [
  { key: 'all', fallbackLabel: 'All' },
  { key: 'popular', fallbackLabel: 'Most popular' },
  { key: 'half-day', fallbackLabel: 'Half-day' },
  { key: 'full-day', fallbackLabel: 'Full-day' },
  { key: 'loch-ness', fallbackLabel: 'Loch Ness' },
  { key: 'skye', fallbackLabel: 'Skye' },
  { key: 'whisky', fallbackLabel: 'Whisky' },
]

function matchesKeyword(tour: TourItem, keywords: string[]): boolean {
  const text = `${tour.title || ''} ${tour.slug || ''} ${tour.shortDescription || ''}`.toLowerCase()
  return keywords.some((kw) => text.includes(kw.toLowerCase()))
}

export default function ToursListClient({ tours }: ToursListClientProps) {
  const { lang } = useLanguage()
  const t = useT()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  // Determine popular tours: sort by confirmedCount, fallback to bookingCount, keep original order if both missing
  const popularTours = useMemo(() => {
    const getScore = (item: TourItem): number | null => {
      if (typeof item.confirmedCount === 'number') return item.confirmedCount
      if (typeof item.bookingCount === 'number') return item.bookingCount
      return null
    }

    // Stable sort: tours with scores first (sorted desc), then tours without scores (original order)
    const sorted = [...tours].sort((a, b) => {
      const scoreA = getScore(a)
      const scoreB = getScore(b)

      // Both have no score → keep original order
      if (scoreA === null && scoreB === null) return 0
      // Only A has no score → B comes first
      if (scoreA === null) return 1
      // Only B has no score → A comes first
      if (scoreB === null) return -1
      // Both have scores → sort descending
      return scoreB - scoreA
    })

    return sorted.slice(0, 6)
  }, [tours])

  const filteredTours = useMemo(() => {
    switch (activeFilter) {
      case 'popular':
        return popularTours
      case 'half-day':
        return tours.filter((item) => typeof item.durationHours === 'number' && item.durationHours <= 4)
      case 'full-day':
        return tours.filter((item) => typeof item.durationHours === 'number' && item.durationHours > 4)
      case 'loch-ness':
        return tours.filter((item) => matchesKeyword(item, ['loch ness', 'ness']))
      case 'skye':
        return tours.filter((item) => matchesKeyword(item, ['skye']))
      case 'whisky':
        return tours.filter((item) => matchesKeyword(item, ['whisky', 'distillery', 'speyside']))
      default:
        return tours
    }
  }, [activeFilter, tours, popularTours])

  return (
    <>
      {/* Filter chips */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          overflowX: 'auto',
          paddingBottom: 4,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {FILTERS.map((f) => {
          const translationKey = FILTER_TRANSLATION_KEYS[f.key]
          const label = translationKey ? t(translationKey as any) : f.fallbackLabel
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 999,
                border: activeFilter === f.key ? '1px solid var(--navy)' : '1px solid rgba(0,0,0,0.15)',
                background: activeFilter === f.key ? 'var(--navy)' : '#fff',
                color: activeFilter === f.key ? '#fff' : 'inherit',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', marginBottom: 12 }}>
        {t('tours.showing')} {filteredTours.length} {filteredTours.length !== 1 ? t('tours.tours') : t('tours.tour')}
      </div>

      {/* Tours grid */}
      {filteredTours.length === 0 ? (
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            padding: '20px 16px',
            background: 'rgba(11,31,58,0.02)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: '#111' }}>
            {t('tours.noMatch')}
          </div>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', margin: '0 0 16px' }}>
            {t('tours.tryAnother')}
          </p>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 999,
              border: '1px solid var(--navy)',
              background: 'var(--navy)',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            {t('tours.viewAll')}
          </button>
        </div>
      ) : (
        <div className="toursGrid">
          {/* Bespoke Tours tile - always first */}
          <a
            href="/tours/bespoke"
            className="card tourCard"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(180deg, var(--heatherSoft), var(--surface))',
              borderColor: 'rgba(125,107,158,.25)',
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
                {tours.slice(0, 6).map((tour, idx) => (
                  <div
                    key={idx}
                    style={{
                      aspectRatio: '4/3',
                      background: 'var(--stoneSoft)',
                      overflow: 'hidden',
                    }}
                  >
                    {tour.imageUrl ? (
                      <img
                        src={tour.imageUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--stoneSoft)' }} />
                    )}
                  </div>
                ))}
                {/* Placeholders if less than 6 tours */}
                {Array.from({ length: Math.max(0, 6 - tours.length) }).map((_, idx) => (
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
                  color: 'var(--heather)',
                }}
              >
                {t('bespoke.cardTitle')}
              </div>
              <div
                className="muted"
                style={{ fontSize: 13, lineHeight: 1.45 }}
              >
                {t('bespoke.cardSubtitle')}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--heather)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {lang === 'es' ? 'Ver más' : 'Learn more'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>

          {filteredTours.map((tour) => {
            const href = `/tours/${tour.slug ?? tour.id}`

            return (
              <a
                key={String(tour.id)}
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
                  {tour.imageUrl ? (
                    <img
                      src={tour.imageUrl}
                      alt={tour.imageAlt || tour.title || 'Tour image'}
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
                      {t('common.noImage')}
                    </div>
                  )}
                </div>

                <div style={{ padding: 16 }}>
                  <div className="titlePremium" style={{ fontSize: 18, marginBottom: 6 }}>
                    {pickI18n(tour, 'title', lang, tour.title ?? 'Tour')}
                  </div>

                  <div className="muted" style={{ fontSize: 13, lineHeight: 1.45, minHeight: 36 }}>
                    {pickI18n(tour, 'shortDescription', lang, tour.shortDescription ?? t('common.noDescription'))}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge badgeMoss">
                      {typeof tour.durationHours === 'number' ? `${tour.durationHours}h` : '—'}
                    </span>
                  </div>
                  <div className="priceGrid">
                    <div className="pricePill pricePillGold">
                      <span className="label">{t('price.1to3')}</span>
                      <span className="price">
                        {typeof tour.price1to3 === 'number' ? `£${tour.price1to3}` : '—'}
                      </span>
                    </div>
                    <div className="pricePill pricePillMoss">
                      <span className="label">{t('price.4to7')}</span>
                      <span className="price">
                        {typeof tour.price4to7 === 'number' ? `£${tour.price4to7}` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}

      <style>{`
        .toursGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          align-items: stretch;
        }
        @media (max-width: 1000px) {
          .toursGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .toursGrid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}
