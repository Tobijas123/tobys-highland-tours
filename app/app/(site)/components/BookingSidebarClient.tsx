'use client'

import { useMemo, useState } from 'react'
import BookingCalendar from './BookingCalendar'

type PartySize = '1-3' | '4-7'

type Props = {
  tourTitle: string
  price1to3: number | null
  price4to7: number | null
  durationText: string
}

const BOOKING_EMAIL = 'info@tobyshighlandtours.com'

export default function BookingSidebarClient({ tourTitle, price1to3, price4to7, durationText }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [partySize, setPartySize] = useState<PartySize | null>(null)
  const [copied, setCopied] = useState(false)

  const currentPrice = partySize === '1-3' ? price1to3 : partySize === '4-7' ? price4to7 : null

  const { gmail, mailto, subject, bodyText } = useMemo(() => {
    const subjectText = `Booking request – ${tourTitle}`
    const partySizeLabel = partySize === '1-3' ? '1–3 people' : partySize === '4-7' ? '4–7 people' : 'TBD'
    const priceLabel = currentPrice !== null ? `£${currentPrice}` : 'TBD'
    const body = `Hi Toby,

I'd like to request a booking for:
- Tour: ${tourTitle}
- Date: ${selected ?? 'TBD'}
- Party size: ${partySizeLabel}
- Price tier: ${priceLabel}

Thanks!`

    const gmailHref =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(BOOKING_EMAIL)}` +
      `&su=${encodeURIComponent(subjectText)}` +
      `&body=${encodeURIComponent(body)}`

    const mailtoHref = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(
      subjectText,
    )}&body=${encodeURIComponent(body)}`

    return { gmail: gmailHref, mailto: mailtoHref, subject: subjectText, bodyText: body }
  }, [tourTitle, selected, partySize, currentPrice])

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(`To: ${BOOKING_EMAIL}\nSubject: ${subject}\n\n${bodyText}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }

  const canRequest = Boolean(selected && partySize)

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Duration</div>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{durationText}</div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>Party size</div>
        <div className="partySizeGrid">
          <button
            type="button"
            className={`partySizeBtn${partySize === '1-3' ? ' active' : ''}`}
            onClick={() => setPartySize('1-3')}
            disabled={price1to3 === null}
          >
            <span className="count">1–3</span>
            <span>people</span>
            <span style={{ marginTop: 4, fontWeight: 950 }}>
              {price1to3 !== null ? `£${price1to3}` : '—'}
            </span>
          </button>
          <button
            type="button"
            className={`partySizeBtn${partySize === '4-7' ? ' active' : ''}`}
            onClick={() => setPartySize('4-7')}
            disabled={price4to7 === null}
          >
            <span className="count">4–7</span>
            <span>people</span>
            <span style={{ marginTop: 4, fontWeight: 950 }}>
              {price4to7 !== null ? `£${price4to7}` : '—'}
            </span>
          </button>
        </div>

        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, marginTop: 14 }}>Pick a date</div>

        <BookingCalendar onSelect={(iso) => setSelected(iso)} />

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
          Selected date: <span style={{ fontWeight: 900 }}>{selected ?? '—'}</span>
        </div>

        {/* Gmail primary */}
        <a
          href={canRequest ? gmail : undefined}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => { if (!canRequest) e.preventDefault() }}
          className="btn btnPrimary"
          aria-disabled={!canRequest}
          style={{ marginTop: 10 }}
        >
          Request a booking (Gmail)
        </a>

        {/* mailto secondary */}
        <a
          href={canRequest ? mailto : undefined}
          onClick={(e) => { if (!canRequest) e.preventDefault() }}
          className="btn btnSecondary"
          aria-disabled={!canRequest}
          style={{ marginTop: 8 }}
        >
          Open in mail app (mailto)
        </a>

        {/* copy */}
        <button type="button" onClick={copyToClipboard} className="btn btnGhost" style={{ marginTop: 8 }}>
          {copied ? 'Copied ✓' : 'Copy email text'}
        </button>

        <div style={{ marginTop: 8, fontSize: 11, opacity: 0.65, lineHeight: 1.35 }}>
          Gmail button opens a new tab. If you prefer another mail client, use “mailto” or copy the text.
        </div>
      </div>
    </div>
  )
}

