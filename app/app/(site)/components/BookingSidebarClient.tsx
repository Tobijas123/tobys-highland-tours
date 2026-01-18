'use client'

import { useMemo, useState } from 'react'
import BookingCalendar from './BookingCalendar'

type PartySize = '1-3' | '4-7'
type ItemType = 'tour' | 'transfer'

type Props = {
  itemType: ItemType
  itemId: number
  itemTitle: string
  price1to3: number | null
  price4to7: number | null
  durationText: string
}

const BOOKING_EMAIL = 'info@tobyshighlandtours.com'

export default function BookingSidebarClient({ itemType, itemId, itemTitle, price1to3, price4to7, durationText }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [partySize, setPartySize] = useState<PartySize | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const currentPrice = partySize === '1-3' ? price1to3 : partySize === '4-7' ? price4to7 : null
  const typeLabel = itemType === 'tour' ? 'Tour' : 'Transfer'

  const { gmail, mailto, subject, bodyText } = useMemo(() => {
    const subjectText = `Booking request – ${itemTitle}`
    const partySizeLabel = partySize === '1-3' ? '1–3 people' : partySize === '4-7' ? '4–7 people' : 'TBD'
    const priceLabel = currentPrice !== null ? `£${currentPrice}` : 'TBD'
    const body = `Hi Toby,

I'd like to request a booking for:
- Type: ${typeLabel}
- ${typeLabel}: ${itemTitle}
- Date: ${selected ?? 'TBD'}
- Party size: ${partySizeLabel}
- Price tier: ${priceLabel}
- Name: ${customerName || 'TBD'}
- Email: ${customerEmail || 'TBD'}
${customerPhone ? `- Phone: ${customerPhone}` : ''}

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
  }, [itemTitle, itemType, typeLabel, selected, partySize, currentPrice, customerName, customerEmail, customerPhone])

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(`To: ${BOOKING_EMAIL}\nSubject: ${subject}\n\n${bodyText}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }

  async function handleSubmit() {
    if (!selected || !partySize || !customerName.trim() || !customerEmail.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const payload: Record<string, any> = {
        date: selected,
        partySize,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
      }

      // Send tourId or transferId based on itemType
      if (itemType === 'tour') {
        payload.tourId = itemId
      } else {
        payload.transferId = itemId
      }

      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Network error. Please try again or use the email option below.')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = Boolean(selected && partySize && customerName.trim() && customerEmail.trim())

  if (submitted) {
    return (
      <div className="card" style={{ padding: 14 }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Request Sent!</div>
          <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
            We've received your booking request for <strong>{itemTitle}</strong> on <strong>{selected}</strong>.
            We'll get back to you at <strong>{customerEmail}</strong> shortly.
          </div>
        </div>
      </div>
    )
  }

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

        {/* Contact details */}
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>Your details</div>

          <input
            type="text"
            placeholder="Your name *"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="bookingInput"
            style={{ marginBottom: 8 }}
          />
          <input
            type="email"
            placeholder="Your email *"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="bookingInput"
            style={{ marginBottom: 8 }}
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="bookingInput"
          />
        </div>

        {error && (
          <div style={{ marginTop: 10, padding: 10, background: 'rgba(200,50,50,.1)', borderRadius: 8, fontSize: 12, color: '#a33' }}>
            {error}
          </div>
        )}

        {/* Submit booking */}
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btnPrimary"
          aria-disabled={!canSubmit || submitting}
          style={{ marginTop: 12 }}
        >
          {submitting ? 'Sending...' : 'Request a booking'}
        </button>

        {/* Fallback options */}
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 8 }}>
            Or contact us directly:
          </div>

          <a
            href={gmail}
            target="_blank"
            rel="noreferrer"
            className="btn btnGhost"
            style={{ fontSize: 12, padding: '8px 10px' }}
          >
            Open Gmail
          </a>

          <a
            href={mailto}
            className="btn btnGhost"
            style={{ fontSize: 12, padding: '8px 10px', marginTop: 6 }}
          >
            Open mail app
          </a>

          <button
            type="button"
            onClick={copyToClipboard}
            className="btn btnGhost"
            style={{ fontSize: 12, padding: '8px 10px', marginTop: 6 }}
          >
            {copied ? 'Copied ✓' : 'Copy email text'}
          </button>
        </div>
      </div>
    </div>
  )
}
