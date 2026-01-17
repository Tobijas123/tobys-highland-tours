'use client'

import { useMemo, useState } from 'react'
import BookingCalendar from './BookingCalendar'

type Props = {
  tourTitle: string
  priceText: string
  durationText: string
}

const BOOKING_EMAIL = 'info@tobyshighlandtours.com'

export default function BookingSidebarClient({ tourTitle, priceText, durationText }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { gmail, mailto, subject, bodyText } = useMemo(() => {
    const subjectText = `Booking request – ${tourTitle}`
    const body = `Hi Toby,

I'd like to request a booking for:
- Tour: ${tourTitle}
- Date: ${selected ?? 'TBD'}

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
  }, [tourTitle, selected])

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(`To: ${BOOKING_EMAIL}\nSubject: ${subject}\n\n${bodyText}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }

  const canRequest = Boolean(selected)

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>From</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>{priceText}</div>

      <div style={{ fontSize: 12, opacity: 0.7 }}>Duration</div>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{durationText}</div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>Pick a date</div>

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

