'use client'

import React, { useEffect, useMemo, useState } from 'react'

type Booking = {
  id: string | number
  date: string
  type?: 'tour' | 'transfer'
  status?: string
  paymentStatus?: string
  customerName?: string
  name?: string
  email?: string
  totalPrice?: number
  driver?: number | { id?: number; firstName?: string; lastName?: string }
}

const STATUS_COLOR: Record<string, string> = {
  confirmed: '#16a34a',
  pending: '#d97706',
  cancelled: '#9ca3af',
}

const PAYMENT_DOT: Record<string, string> = {
  paid: '#16a34a',
  deposit: '#2563eb',
  unpaid: '#9ca3af',
  refunded: '#dc2626',
}

const WEEKDAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz']
const MONTHS = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień']

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function buildGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - offset)
  return Array.from({ length: 42 }, (_, i) =>
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  )
}

export default function BookingsCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [filterType, setFilterType] = useState<'all' | 'tour' | 'transfer'>('all')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cells = useMemo(() => buildGrid(year, month), [year, month])
  const startStr = ymd(cells[0])
  const endStr = ymd(cells[41])
  const todayStr = ymd(now)

  useEffect(() => {
    let off = false
    ;(async () => {
      setLoading(true); setError(null)
      try {
        const p = new URLSearchParams()
        p.set('where[date][greater_than_equal]', startStr)
        p.set('where[date][less_than_equal]', endStr)
        p.set('limit', '1000'); p.set('depth', '1'); p.set('sort', 'date')
        const res = await fetch(`/api/bookings?${p.toString()}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!off) setBookings(Array.isArray(data?.docs) ? data.docs : [])
      } catch (e: any) {
        if (!off) setError(e?.message || 'Błąd ładowania')
      } finally {
        if (!off) setLoading(false)
      }
    })()
    return () => { off = true }
  }, [startStr, endStr])

  const byDate = useMemo(() => {
    const m: Record<string, Booking[]> = {}
    for (const b of bookings) {
      if (filterType !== 'all' && b.type !== filterType) continue
      const k = (b.date || '').slice(0, 10)
      if (k) (m[k] ||= []).push(b)
    }
    return m
  }, [bookings, filterType])

  const prev = () => { const m = month - 1; if (m < 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m) }
  const next = () => { const m = month + 1; if (m > 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m) }
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()) }

  const border = '1px solid var(--theme-elevation-150, #e5e7eb)'
  const btn: React.CSSProperties = {
    padding: '6px 12px', border, borderRadius: 6, cursor: 'pointer',
    background: 'var(--theme-elevation-50, #f9fafb)', color: 'var(--theme-text, #111)',
  }
  const activeBtn = (on: boolean): React.CSSProperties => ({
    ...btn, background: on ? 'var(--theme-text, #111)' : 'var(--theme-elevation-50, #f9fafb)',
    color: on ? 'var(--theme-elevation-0, #fff)' : 'var(--theme-text, #111)',
  })

  return (
    <div style={{ padding: '24px', color: 'var(--theme-text, #111)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Kalendarz — {MONTHS[month]} {year}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn} onClick={prev}>‹</button>
          <button style={btn} onClick={goToday}>Dziś</button>
          <button style={btn} onClick={next}>›</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button style={activeBtn(filterType === 'all')} onClick={() => setFilterType('all')}>Wszystkie</button>
        <button style={activeBtn(filterType === 'tour')} onClick={() => setFilterType('tour')}>Tury</button>
        <button style={activeBtn(filterType === 'transfer')} onClick={() => setFilterType('transfer')}>Transfery</button>
        {loading && <span style={{ alignSelf: 'center', opacity: 0.6 }}>ładowanie…</span>}
        {error && <span style={{ alignSelf: 'center', color: '#dc2626' }}>{error}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--theme-elevation-150, #e5e7eb)', border, borderRadius: 8, overflow: 'hidden' }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, fontSize: 12, background: 'var(--theme-elevation-100, #f3f4f6)' }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          const key = ymd(d)
          const inMonth = d.getMonth() === month
          const isToday = key === todayStr
          const items = byDate[key] || []
          return (
            <div key={i} style={{
              minHeight: 96, padding: 6, background: 'var(--theme-elevation-0, #fff)',
              opacity: inMonth ? 1 : 0.4,
              outline: isToday ? '2px solid #2563eb' : 'none', outlineOffset: -2,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{d.getDate()}</div>
              {items.map(b => {
                const customerLabel = b.customerName || b.name || b.email || `#${b.id}`
                const driverName = b.driver && typeof b.driver === 'object' && b.driver.firstName
                  ? `${b.driver.firstName} ${b.driver.lastName || ''}`.trim()
                  : ''
                const label = driverName ? `${customerLabel} · ${driverName}` : customerLabel
                const sc = STATUS_COLOR[b.status || ''] || '#6b7280'
                const pd = PAYMENT_DOT[b.paymentStatus || ''] || '#9ca3af'
                return (
                  <a key={String(b.id)} href={`/admin/collections/bookings/${b.id}`}
                     title={`${label} · ${b.type || ''} · ${b.status || ''} · ${b.paymentStatus || ''}${b.totalPrice != null ? ` · £${b.totalPrice}` : ''}`}
                     style={{
                       display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none',
                       fontSize: 11, lineHeight: 1.3, marginBottom: 3, padding: '2px 5px', borderRadius: 4,
                       background: sc, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                       textDecorationLine: b.status === 'cancelled' ? 'line-through' : 'none',
                     }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: pd, flexShrink: 0, boxShadow: '0 0 0 1px rgba(255,255,255,.6)' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.type === 'transfer' ? '🚐' : '🏔'} {label}
                    </span>
                  </a>
                )
              })}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, fontSize: 12 }}>
        <Legend color="#16a34a" label="confirmed" />
        <Legend color="#d97706" label="pending" />
        <Legend color="#9ca3af" label="cancelled" />
        <span style={{ opacity: 0.6 }}>| kropka = płatność:</span>
        <Legend color="#16a34a" label="paid" dot />
        <Legend color="#2563eb" label="deposit" dot />
        <Legend color="#9ca3af" label="unpaid" dot />
      </div>
    </div>
  )
}

function Legend({ color, label, dot }: { color: string; label: string; dot?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: dot ? 9 : 12, height: dot ? 9 : 12, borderRadius: dot ? '50%' : 3, background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}
