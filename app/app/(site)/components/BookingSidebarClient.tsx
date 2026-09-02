'use client'

import { useEffect, useMemo, useState } from 'react'
import BookingCalendar from './BookingCalendar'
import { useT } from '../lib/translations'

type PartySize = '1-4' | '5-7'
type ItemType = 'tour' | 'transfer'

type Props = {
  itemType: ItemType
  itemId: number
  itemTitle: string
  price1to4: number | null
  price5to7: number | null
  durationText: string
}

type FieldErrors = {
  [key: string]: string | undefined
}

const BOOKING_EMAIL = 'info@dingwall-taxis.co.uk'

export default function BookingSidebarClient({ itemType, itemId, itemTitle, price1to4, price5to7, durationText }: Props) {
  const t = useT()
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)

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

  const currentPrice = partySize === '1-4' ? price1to4 : partySize === '5-7' ? price5to7 : null
  const typeLabel = itemType === 'tour' ? 'Tour' : 'Transfer'

  const { gmail } = useMemo(() => {
    const subjectText = `Booking request – ${itemTitle}`
    const partySizeLabel = partySize === '1-4' ? '1–4 people' : partySize === '5-7' ? '5–7 people' : 'TBD'
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

    return { gmail: gmailHref }
  }, [itemTitle, itemType, typeLabel, selected, pickupTime, pickupLocation, dropoffLocation, paxCount, partySize, currentPrice, customerName, customerEmail, customerPhone])

  // Clear field error when field value changes
  function clearFieldError(field: string) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  async function handleSubmit() {
    // Client-side validation with field errors
    const newFieldErrors: FieldErrors = {}

    if (!partySize) newFieldErrors.partySize = 'Please select party size'
    if (!selected) newFieldErrors.date = 'Please select a date'
    if (!pickupTime) newFieldErrors.pickupTime = 'Pickup time is required'
    if (!pickupLocation.trim()) newFieldErrors.pickupLocation = 'Pickup location is required'
    if (!dropoffLocation.trim()) newFieldErrors.dropoffLocation = 'Drop-off location is required'
    if (!paxCount) newFieldErrors.paxCount = 'Number of passengers is required'
    if (!customerName.trim()) newFieldErrors.customerName = 'Your name is required'
    if (!customerEmail.trim()) newFieldErrors.customerEmail = 'Your email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) newFieldErrors.customerEmail = 'Please enter a valid email'
    if (!agreedToTerms) newFieldErrors.agreedToTerms = 'You must agree to the cancellation policy before booking'

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors)
      setError('Please fix the errors below')
      return
    }

    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    // Create AbortController with 30s timeout for Stripe
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

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
        agreedToTerms,
      }

      // Send tourId or transferId based on itemType
      if (itemType === 'tour') {
        requestPayload.tourId = itemId
      } else {
        requestPayload.transferId = itemId
      }

      const res = await fetch('/api/public/bookings/create-checkout', {
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
        // Handle field-level error from server
        if (data.field) {
          setFieldErrors({ [data.field]: data.error })
        }
        setError(data.error || `Server error (${res.status}). Please try again or use email below.`)
        return
      }

      // Redirect to success page
      if (data.success && data.bookingId) {
        window.location.href = `/booking/success?bookingId=${data.bookingId}`
      } else {
        setError('Failed to create booking. Please try again.')
      }
    } catch (err: any) {
      clearTimeout(timeoutId)
      if (err?.name === 'AbortError') {
        setError(t('booking.errorTimeout'))
      } else {
        setError(t('booking.errorNetwork'))
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
      <div className="card w-full max-w-full overflow-x-hidden" style={{ padding: 14, boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{t('booking.requestSent')}</div>
          <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
            {t('booking.confirmationText')}
            {submittedBookingId && <><br/>{t('booking.bookingId')} <strong>#{submittedBookingId}</strong></>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{t('booking.duration')}</div>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{durationText}</div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>{t('booking.partySize')}</div>
        <div className="partySizeGrid">
          <button
            type="button"
            className={`partySizeBtn${partySize === '1-4' ? ' active' : ''}`}
            onClick={() => setPartySize('1-4')}
            disabled={price1to4 === null}
          >
            <span className="count">1–4</span>
            <span>{t('booking.people')}</span>
            <span style={{ marginTop: 4, fontWeight: 950 }}>
              {price1to4 !== null ? `£${price1to4}` : '—'}
            </span>
          </button>
          <button
            type="button"
            className={`partySizeBtn${partySize === '5-7' ? ' active' : ''}`}
            onClick={() => setPartySize('5-7')}
            disabled={price5to7 === null}
          >
            <span className="count">5–7</span>
            <span>{t('booking.people')}</span>
            <span style={{ marginTop: 4, fontWeight: 950 }}>
              {price5to7 !== null ? `£${price5to7}` : '—'}
            </span>
          </button>
        </div>

        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, marginTop: 14 }}>{t('booking.pickDate')}</div>

        <BookingCalendar
          onSelect={(iso) => setSelected(iso)}
          disabledDates={disabledDates}
          disabledMessage={disabledMessage}
          onMonthChange={(m) => setCalendarMonth(m)}
        />

        {disabledDates.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 11, opacity: 0.7, lineHeight: 1.5 }}>
            {t('booking.fullyBookedMessage')}{' '}
            <a href="https://wa.me/447383488007" target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>WhatsApp</a>
            {' · '}
            <a href="mailto:info@dingwall-taxis.co.uk" style={{ fontWeight: 700 }}>Email</a>
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
          {t('booking.selectedDate')} <span style={{ fontWeight: 900 }}>{selected ?? '—'}</span>
        </div>

        {/* Pickup details */}
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>{t('booking.pickupDetails')}</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <div style={{ flex: 1 }}>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => { setPickupTime(e.target.value); clearFieldError('pickupTime') }}
                className="bookingInput"
                style={{ width: '100%', borderColor: fieldErrors.pickupTime ? '#c33' : undefined }}
                required
              />
              {fieldErrors.pickupTime && <div style={{ fontSize: 11, color: '#c33', marginTop: 2 }}>{fieldErrors.pickupTime}</div>}
            </div>
            <div style={{ width: 70 }}>
              <input
                type="number"
                placeholder={t('booking.pax')}
                min={1}
                max={50}
                value={paxCount}
                onChange={(e) => { setPaxCount(e.target.value ? parseInt(e.target.value) : ''); clearFieldError('paxCount') }}
                className="bookingInput"
                style={{ width: '100%', borderColor: fieldErrors.paxCount ? '#c33' : undefined }}
                required
              />
              {fieldErrors.paxCount && <div style={{ fontSize: 11, color: '#c33', marginTop: 2 }}>{fieldErrors.paxCount}</div>}
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <input
              type="text"
              placeholder={t('booking.pickupLocation')}
              value={pickupLocation}
              onChange={(e) => { setPickupLocation(e.target.value); clearFieldError('pickupLocation') }}
              className="bookingInput"
              style={{ marginBottom: 4, borderColor: fieldErrors.pickupLocation ? '#c33' : undefined }}
              required
            />
            {fieldErrors.pickupLocation && <div style={{ fontSize: 11, color: '#c33', marginBottom: 4 }}>{fieldErrors.pickupLocation}</div>}
          </div>
          <div>
            <input
              type="text"
              placeholder={t('booking.dropoffLocation')}
              value={dropoffLocation}
              onChange={(e) => { setDropoffLocation(e.target.value); clearFieldError('dropoffLocation') }}
              className="bookingInput"
              style={{ borderColor: fieldErrors.dropoffLocation ? '#c33' : undefined }}
              required
            />
            {fieldErrors.dropoffLocation && <div style={{ fontSize: 11, color: '#c33', marginTop: 2 }}>{fieldErrors.dropoffLocation}</div>}
          </div>
        </div>

        {/* Contact details */}
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>{t('booking.yourDetails')}</div>

          <div style={{ marginBottom: 4 }}>
            <input
              type="text"
              placeholder={t('booking.yourName')}
              value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); clearFieldError('customerName') }}
              className="bookingInput"
              style={{ marginBottom: 4, borderColor: fieldErrors.customerName ? '#c33' : undefined }}
            />
            {fieldErrors.customerName && <div style={{ fontSize: 11, color: '#c33', marginBottom: 4 }}>{fieldErrors.customerName}</div>}
          </div>
          <div style={{ marginBottom: 4 }}>
            <input
              type="email"
              placeholder={t('booking.yourEmail')}
              value={customerEmail}
              onChange={(e) => { setCustomerEmail(e.target.value); clearFieldError('customerEmail') }}
              className="bookingInput"
              style={{ marginBottom: 4, borderColor: fieldErrors.customerEmail ? '#c33' : undefined }}
            />
            {fieldErrors.customerEmail && <div style={{ fontSize: 11, color: '#c33', marginBottom: 4 }}>{fieldErrors.customerEmail}</div>}
          </div>
          <input
            type="tel"
            placeholder={t('booking.phone')}
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

        {/* Price info */}
        {currentPrice !== null && (
          <div style={{ marginTop: 12, padding: 10, background: 'rgba(0,0,0,0.03)', borderRadius: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Total price:</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>£{currentPrice}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>
              Pay your driver directly (cash or card) on the day.
            </div>
          </div>
        )}

        {/* Cancellation policy */}
        <div style={{ marginTop: 14, padding: 12, background: '#fff8e6', borderRadius: 8, fontSize: 12, border: '1px solid #f0e0b0' }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: '#856404' }}>{t('cancellation.title')}</div>
          <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.6, color: '#6b5a2f' }}>
            <li>{t('cancellation.48plus')}</li>
            <li>{t('cancellation.24to48')}</li>
            <li>{t('cancellation.under24')}</li>
            <li>{t('cancellation.weCancel')}</li>
            <li>{itemType === 'tour' ? t('cancellation.remainingTour') : t('cancellation.remainingTransfer')}</li>
          </ul>
        </div>

        {/* Agreement checkbox */}
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => { setAgreedToTerms(e.target.checked); clearFieldError('agreedToTerms') }}
              style={{
                marginTop: 2,
                accentColor: '#275548',
                width: 16,
                height: 16,
                flexShrink: 0,
                borderColor: fieldErrors.agreedToTerms ? '#c33' : undefined,
              }}
            />
            <span style={{ color: fieldErrors.agreedToTerms ? '#c33' : 'inherit' }}>
              {t('cancellation.agreeLabel')}
            </span>
          </label>
          {fieldErrors.agreedToTerms && (
            <div style={{ fontSize: 11, color: '#c33', marginTop: 4, marginLeft: 24 }}>{fieldErrors.agreedToTerms}</div>
          )}
        </div>

        {/* Submit booking */}
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btnPrimary"
          aria-disabled={!canSubmit || submitting}
          style={{ marginTop: 12 }}
        >
          {submitting
            ? 'Processing...'
            : currentPrice !== null
              ? 'Book now'
              : 'Select party size'
          }
        </button>

        {/* Fallback options */}
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 8 }}>
            {t('booking.orContactUs')}
          </div>

          <a
            href={gmail}
            target="_blank"
            rel="noreferrer"
            className="btn btnGhost"
            style={{ fontSize: 12, padding: '8px 10px' }}
          >
            {t('booking.openGmail')}
          </a>

          <a
            href="https://wa.me/447383488007"
            target="_blank"
            rel="noreferrer"
            className="btn btnGhost"
            style={{ fontSize: 12, padding: '8px 10px', marginTop: 6 }}
          >
            {t('booking.openWhatsApp')}
          </a>
        </div>
      </div>
    </div>
  )
}
