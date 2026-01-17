'use client'

import { useMemo, useState } from 'react'

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}
function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}
function pad2(n: number) {
  return String(n).padStart(2, '0')
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

type Props = {
  onSelect?: (isoDate: string) => void
}

export default function BookingCalendar({ onSelect }: Props) {
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<string | null>(null)

  const { monthLabel, cells } = useMemo(() => {
    const y = viewMonth.getFullYear()
    const m = viewMonth.getMonth()
    const first = new Date(y, m, 1)
    const firstDowMon0 = (first.getDay() + 6) % 7 // Mon=0..Sun=6
    const dim = daysInMonth(viewMonth)

    const monthLabel = viewMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })

    const out: Array<{ iso: string | null; day: number | null }> = []
    for (let i = 0; i < firstDowMon0; i++) out.push({ iso: null, day: null })
    for (let day = 1; day <= dim; day++) {
      const d = new Date(y, m, day)
      out.push({ iso: toISODate(d), day })
    }
    while (out.length % 7 !== 0) out.push({ iso: null, day: null })
    return { monthLabel, cells: out }
  }, [viewMonth])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <button
          type="button"
          onClick={() => setViewMonth(addMonths(viewMonth, -1))}
          style={{
            padding: '6px 10px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.2)',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 800,
          }}
          aria-label="Previous month"
        >
          ←
        </button>

        <div style={{ fontWeight: 900 }}>{monthLabel}</div>

        <button
          type="button"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          style={{
            padding: '6px 10px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.2)',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 800,
          }}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 10 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} style={{ fontSize: 11, opacity: 0.7, textAlign: 'center', fontWeight: 800 }}>
            {d}
          </div>
        ))}

        {cells.map((c, idx) => {
          const isSelected = c.iso && selected === c.iso
          const isEmpty = !c.iso

          return (
            <button
              key={idx}
              type="button"
              disabled={isEmpty}
              onClick={() => {
                if (!c.iso) return
                setSelected(c.iso)
                onSelect?.(c.iso)
              }}
              style={{
                padding: '10px 0',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.12)',
                background: isEmpty ? 'transparent' : isSelected ? 'rgba(0,0,0,0.08)' : 'white',
                cursor: isEmpty ? 'default' : 'pointer',
                fontWeight: 900,
                opacity: isEmpty ? 0 : 1,
              }}
              aria-label={c.iso ?? 'empty'}
            >
              {c.day ?? ''}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
        Selected: <span style={{ fontWeight: 900 }}>{selected ?? '—'}</span>
      </div>
    </div>
  )
}
