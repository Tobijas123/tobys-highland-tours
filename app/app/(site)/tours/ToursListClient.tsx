'use client'

import { useState, useMemo } from 'react'
import { useLanguage } from '../lib/LanguageContext'
import { pickI18n } from '../lib/pickI18n'
import { t as tr } from '../lib/translations'

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

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'popular', label: 'Most popular' },
  { key: 'half-day', label: 'Half-day' },
  { key: 'full-day', label: 'Full-day' },
  { key: 'loch-ness', label: 'Loch Ness' },
  { key: 'skye', label: 'Skye' },
  { key: 'whisky', label: 'Whisky' },
]

function matchesKeyword(tour: TourItem, keywords: string[]): boolean {
  const text = `${tour.title || ''} ${tour.slug || ''} ${tour.shortDescription || ''}`.toLowerCase()
  return keywords.some((kw) => text.includes(kw.toLowerCase()))
}

export default function ToursListClient({ tours }: ToursListClientProps) {
  const { lang } = useLanguage()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  // Determine popular tours: sort by confirmedCount, fallback to bookingCount, keep original order if both missing
  const popularTours = useMemo(() => {
    const getScore = (t: TourItem): number | null => {
      if (typeof t.confirmedCount === 'number') return t.confirmedCount
      if (typeof t.bookingCount === 'number') return t.bookingCount
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
        return tours.filter((t) => typeof t.durationHours === 'number' && t.durationHours <= 4)
      case 'full-day':
        return tours.filter((t) => typeof t.durationHours === 'number' && t.durationHours > 4)
      case 'loch-ness':
        return tours.filter((t) => matchesKeyword(t, ['loch ness', 'ness']))
      case 'skye':
        return tours.filter((t) => matchesKeyword(t, ['skye']))
      case 'whisky':
        return tours.filter((t) => matchesKeyword(t, ['whisky', 'distillery', 'speyside']))
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
        {FILTERS.map((f) => (
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
            {f.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', marginBottom: 12 }}>
        Showing {filteredTours.length} tour{filteredTours.length !== 1 ? 's' : ''}
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
            No tours match this filter
          </div>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', margin: '0 0 16px' }}>
            Try another filter or view all tours.
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
            View all
          </button>
        </div>
      ) : (
        <div className="toursGrid">
          {filteredTours.map((t) => {
            const href = `/tours/${t.slug ?? t.id}`

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
                  {t.imageUrl ? (
                    <img
                      src={t.imageUrl}
                      alt={t.imageAlt || t.title || 'Tour image'}
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
                    {pickI18n(t, 'title', lang, t.title ?? 'Tour')}
                  </div>

                  <div className="muted" style={{ fontSize: 13, lineHeight: 1.45, minHeight: 36 }}>
                    {pickI18n(t, 'shortDescription', lang, t.shortDescription ?? 'No short description yet.')}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge badgeMoss">
                      {typeof t.durationHours === 'number' ? `${t.durationHours}h` : '—'}
                    </span>
                  </div>
                  <div className="priceGrid">
                    <div className="pricePill pricePillGold">
                      <span className="label">{tr('price.1to3', lang)}</span>
                      <span className="price">
                        {typeof t.price1to3 === 'number' ? `£${t.price1to3}` : '—'}
                      </span>
                    </div>
                    <div className="pricePill pricePillMoss">
                      <span className="label">{tr('price.4to7', lang)}</span>
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
