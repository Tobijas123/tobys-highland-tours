'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'

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

type Driver = {
  id: number
  firstName: string
  lastName: string
}

type DriverBlock = {
  id: number
  driver: number | { id: number; firstName?: string; lastName?: string }
  startDate: string
  endDate: string
  reason?: string
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

// Add days to a YYYY-MM-DD string safely (UTC-based)
function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

// Check if dateStr is within [start, end] inclusive
function isDateInRange(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end
}

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
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [blocks, setBlocks] = useState<DriverBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Block modal state
  const [blockModal, setBlockModal] = useState<{ date: string } | null>(null)
  const [blockDriverId, setBlockDriverId] = useState<number | ''>('')
  const [blockDays, setBlockDays] = useState(1)
  const [blockReason, setBlockReason] = useState('Unavailable')
  const [blockSaving, setBlockSaving] = useState(false)

  const cells = useMemo(() => buildGrid(year, month), [year, month])
  const startStr = ymd(cells[0])
  const endStr = ymd(cells[41])
  const todayStr = ymd(now)

  // Fetch drivers once
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/drivers?limit=200&depth=0', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (res.ok) {
          const data = await res.json()
          setDrivers(Array.isArray(data?.docs) ? data.docs : [])
        }
      } catch {
        // ignore
      }
    })()
  }, [])

  // Fetch bookings and blocks for visible range
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch bookings
      const bp = new URLSearchParams()
      bp.set('where[date][greater_than_equal]', startStr)
      bp.set('where[date][less_than_equal]', endStr)
      bp.set('limit', '1000')
      bp.set('depth', '1')
      bp.set('sort', 'date')
      const bookingsRes = await fetch(`/api/bookings?${bp.toString()}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      if (!bookingsRes.ok) throw new Error(`HTTP ${bookingsRes.status}`)
      const bookingsData = await bookingsRes.json()
      setBookings(Array.isArray(bookingsData?.docs) ? bookingsData.docs : [])

      // Fetch blocks (overlapping with visible range)
      const blp = new URLSearchParams()
      blp.set('where[startDate][less_than_equal]', endStr)
      blp.set('where[endDate][greater_than_equal]', startStr)
      blp.set('limit', '500')
      blp.set('depth', '1')
      const blocksRes = await fetch(`/api/driver-blocks?${blp.toString()}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      if (blocksRes.ok) {
        const blocksData = await blocksRes.json()
        setBlocks(Array.isArray(blocksData?.docs) ? blocksData.docs : [])
      }
    } catch (e: any) {
      setError(e?.message || 'Błąd ładowania')
    } finally {
      setLoading(false)
    }
  }, [startStr, endStr])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Group bookings by date
  const byDate = useMemo(() => {
    const m: Record<string, Booking[]> = {}
    for (const b of bookings) {
      if (filterType !== 'all' && b.type !== filterType) continue
      const k = (b.date || '').slice(0, 10)
      if (k) (m[k] ||= []).push(b)
    }
    return m
  }, [bookings, filterType])

  // Group blocks by date (expand ranges into individual days)
  const blocksByDate = useMemo(() => {
    const m: Record<string, DriverBlock[]> = {}
    for (const block of blocks) {
      // Iterate through each day in the block range that's visible
      let current = block.startDate
      while (current <= block.endDate && current <= endStr) {
        if (current >= startStr) {
          (m[current] ||= []).push(block)
        }
        current = addDays(current, 1)
      }
    }
    return m
  }, [blocks, startStr, endStr])

  const prev = () => { const m = month - 1; if (m < 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m) }
  const next = () => { const m = month + 1; if (m > 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m) }
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()) }

  // Handle clicking empty area of a day cell
  const handleDayClick = (e: React.MouseEvent, dateStr: string) => {
    // Only open modal if clicking on the cell background, not on a booking/block bar
    if ((e.target as HTMLElement).closest('[data-bar]')) return
    setBlockModal({ date: dateStr })
    setBlockDriverId('')
    setBlockDays(1)
    setBlockReason('Unavailable')
  }

  // Save block
  const handleSaveBlock = async () => {
    if (!blockModal || !blockDriverId) return
    setBlockSaving(true)
    try {
      const endDate = addDays(blockModal.date, blockDays - 1)
      const res = await fetch('/api/driver-blocks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver: blockDriverId,
          startDate: blockModal.date,
          endDate,
          reason: blockReason || 'Unavailable',
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setBlockModal(null)
      fetchData()
    } catch {
      alert('Nie udało się zapisać blokady')
    } finally {
      setBlockSaving(false)
    }
  }

  // Delete block
  const handleDeleteBlock = async (block: DriverBlock) => {
    const driverName = typeof block.driver === 'object'
      ? `${block.driver.firstName || ''} ${block.driver.lastName || ''}`.trim()
      : `Driver #${block.driver}`
    if (!confirm(`Usunąć blokadę "${driverName}" (${block.startDate} – ${block.endDate})?`)) return
    try {
      const blockId = block.id
      if (!blockId) {
        console.error('[BLOCK-DELETE] Missing block.id', block)
        alert('Nie udało się usunąć blokady — brak ID')
        return
      }
      const res = await fetch(`/api/driver-blocks/${blockId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      if (!res.ok) {
        const body = await res.text()
        console.error('[BLOCK-DELETE]', res.status, body)
        throw new Error(`HTTP ${res.status}`)
      }
      fetchData()
    } catch (err) {
      console.error('[BLOCK-DELETE] error', err)
      alert('Nie udało się usunąć blokady')
    }
  }

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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        borderRight: border,
        borderBottom: border,
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{
            padding: '8px 6px',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 12,
            background: 'var(--theme-elevation-100, #f3f4f6)',
            borderTop: border,
            borderLeft: border,
          }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          const key = ymd(d)
          const inMonth = d.getMonth() === month
          const isToday = key === todayStr
          const items = byDate[key] || []
          const dayBlocks = blocksByDate[key] || []
          return (
            <div
              key={i}
              onClick={(e) => handleDayClick(e, key)}
              style={{
                minHeight: 96,
                padding: 6,
                background: 'var(--theme-elevation-0, #fff)',
                opacity: inMonth ? 1 : 0.4,
                borderTop: border,
                borderLeft: border,
                outline: isToday ? '2px solid #2563eb' : 'none',
                outlineOffset: -2,
                cursor: 'pointer',
              }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{d.getDate()}</div>

              {/* Driver blocks */}
              {dayBlocks.map(block => {
                const driverName = typeof block.driver === 'object'
                  ? `${block.driver.firstName || ''} ${block.driver.lastName || ''}`.trim()
                  : `Driver #${block.driver}`
                const reasonText = block.reason && block.reason !== 'Unavailable' ? ` — ${block.reason}` : ''
                return (
                  <div
                    key={`block-${block.id}`}
                    data-bar="block"
                    onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block) }}
                    title={`${driverName} — off${reasonText}\n${block.startDate} → ${block.endDate}\nKliknij aby usunąć`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 11, lineHeight: 1.3, marginBottom: 3, padding: '2px 5px', borderRadius: 4,
                      background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                      color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      cursor: 'pointer', border: '1px dashed rgba(255,255,255,0.4)',
                    }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      🚫 {driverName} — off{reasonText}
                    </span>
                  </div>
                )
              })}

              {/* Bookings */}
              {items.map(b => {
                const customerLabel = b.customerName || b.name || b.email || `#${b.id}`
                const driverName = b.driver && typeof b.driver === 'object' && b.driver.firstName
                  ? `${b.driver.firstName} ${b.driver.lastName || ''}`.trim()
                  : ''
                const label = driverName ? `${customerLabel} · ${driverName}` : customerLabel
                const sc = STATUS_COLOR[b.status || ''] || '#6b7280'
                const pd = PAYMENT_DOT[b.paymentStatus || ''] || '#9ca3af'
                return (
                  <a
                    key={String(b.id)}
                    data-bar="booking"
                    href={`/admin/collections/bookings/${b.id}`}
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
        <span style={{ opacity: 0.6 }}>|</span>
        <Legend color="#dc2626" label="driver off" />
      </div>

      {/* Block Modal */}
      {blockModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setBlockModal(null)}
        >
          <div
            style={{
              background: 'var(--theme-elevation-0, #fff)', borderRadius: 12, padding: 20,
              minWidth: 320, maxWidth: '90vw', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Block driver — {blockModal.date}</h3>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Driver</label>
              <select
                value={blockDriverId}
                onChange={(e) => setBlockDriverId(e.target.value ? Number(e.target.value) : '')}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border, fontSize: 14 }}
              >
                <option value="">— wybierz kierowcę —</option>
                {drivers.map(dr => (
                  <option key={dr.id} value={dr.id}>{dr.firstName} {dr.lastName}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Number of days</label>
              <input
                type="number"
                min={1}
                value={blockDays}
                onChange={(e) => setBlockDays(Math.max(1, Number(e.target.value) || 1))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border, fontSize: 14 }}
              />
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                {blockModal.date} → {addDays(blockModal.date, blockDays - 1)}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Reason (optional)</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Unavailable"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border, fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                style={{ ...btn, background: 'transparent' }}
                onClick={() => setBlockModal(null)}
              >
                Cancel
              </button>
              <button
                style={{
                  ...btn,
                  background: blockDriverId ? '#dc2626' : '#ccc',
                  color: '#fff',
                  cursor: blockDriverId ? 'pointer' : 'not-allowed',
                }}
                disabled={!blockDriverId || blockSaving}
                onClick={handleSaveBlock}
              >
                {blockSaving ? 'Saving...' : 'Save Block'}
              </button>
            </div>
          </div>
        </div>
      )}
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
