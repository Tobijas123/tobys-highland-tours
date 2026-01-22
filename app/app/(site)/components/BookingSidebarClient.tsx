'use client'

import { useEffect, useMemo, useState } from 'react'
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
  const [pickupTime, setPickupTime] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [paxCount, setPaxCount] = useState<number | ''>('')
  const [partySize, setPartySize] = useState<PartySize | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedBookingId, setSubmittedBookingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Availability state
  const [calendarMonth, setCalendarMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [disabledDates, setDisabledDates] = useState<string[]>([])
  const [disabledMessage, setDisabledMessage] = useState<string>('')

  // Fetch availability when partySize or calendarMonth changes
  useEffect(() => {
    if (!partySize) {
      setDisabledDates([])
      return
    }

    const controller = new AbortController()

    fetch(`/api/public/availability?month=${calendarMonth}&partySize=${partySize}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setDisabledDates(data.disabledDates?.map((d: { date: string }) => d.date) ?? [])
        setDisabledMessage(data.fullyBookedMessage ?? '')
      })
      .catch(() => {
        setDisabledDates([])
      })

    return () => controller.abort()
  }, [partySize, calendarMonth])

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
- Pickup time: ${pickupTime || 'TBD'}
- Pickup location: ${pickupLocation || 'TBD'}
- Drop-off location: ${dropoffLocation || 'TBD'}
- Passengers: ${paxCount || 'TBD'}
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
  }, [itemTitle, itemType, typeLabel, selected, pickupTime, pickupLocation, dropoffLocation, paxCount, partySize, currentPrice, customerName, customerEmail, customerPhone])

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
    if (!selected || !pickupTime || !pickupLocation.trim() || !dropoffLocation.trim() || !paxCount || !partySize || !customerName.trim() || !customerEmail.trim()) return

    setSubmitting(true)
    setError(null)

    // Create AbortController with 15s timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const requestPayload: Record<string, any> = {
        date: selected,
        pickupTime,
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        paxCount: Number(paxCount),
        partySize,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
      }

      // Send tourId or transferId based on itemType
      if (itemType === 'tour') {
        requestPayload.tourId = itemId
      } else {
        requestPayload.transferId = itemId
      }

      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      let data: any = {}
      try {
        data = await res.json()
      } catch {
        // Response not JSON
      }

      if (!res.ok) {
        setError(data.error || `Server error (${res.status}). Please try again or use email below.`)
        return
      }

      setSubmittedBookingId(data.bookingId || null)
      setSubmitted(true)
    } catch (err: any) {
      clearTimeout(timeoutId)
      if (err?.name === 'AbortError') {
        setError('Request timed out. Server may be busy. Please try again or use the email option below.')
      } else {
        setError('Network error. Please try again or use the email option below.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = Boolean(
    selected &&
    pickupTime &&
    pickupLocation.trim() &&
    dropoffLocation.trim() &&
    paxCount &&
    partySize &&
    customerName.trim() &&
    customerEmail.trim()
  )

  if (submitted) {
    return (
      <div className="card" style={{ padding: 14 }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Request Sent!</div>
          <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
            We've received your booking request for <strong>{itemTitle}</strong> on <strong>{selected}</strong> at <strong>{pickupTime}</strong>.
            {submittedBookingId && <><br/>Booking ID: <strong>#{submittedBookingId}</strong></>}
            <br/><br/>We'll confirm by email at <strong>{customerEmail}</strong> shortly.
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

        <BookingCalendar
          onSelect={(iso) => setSelected(iso)}
          disabledDates={disabledDates}
          disabledMessage={disabledMessage}
          onMonthChange={(m) => setCalendarMonth(m)}
        />

        {disabledDates.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 11, opacity: 0.7, lineHeight: 1.5 }}>
            We're fully booked on some dates. Contact us and we'll try to arrange an alternative:{' '}
            <a href="https://wa.me/447383488007" target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>WhatsApp</a>
            {' · '}
            <a href="mailto:info@tobyshighlandtours.com" style={{ fontWeight: 700 }}>Email</a>
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
          Selected date: <span style={{ fontWeight: 900 }}>{selected ?? '—'}</span>
        </div>

        {/* Pickup details */}
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>Pickup details</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="bookingInput"
              style={{ flex: 1 }}
              required
            />
            <input
              type="number"
              placeholder="Pax *"
              min={1}
              max={50}
              value={paxCount}
              onChange={(e) => setPaxCount(e.target.value ? parseInt(e.target.value) : '')}
              className="bookingInput"
              style={{ width: 70 }}
              required
            />
          </div>

          <input
            type="text"
            placeholder="Pickup location *"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            className="bookingInput"
            style={{ marginBottom: 8 }}
            required
          />
          <input
            type="text"
            placeholder="Drop-off location *"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            className="bookingInput"
            required
          />
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
