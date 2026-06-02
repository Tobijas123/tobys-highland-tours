import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ booking_id?: string }>
}

export default async function BookingCancelPage({ searchParams }: Props) {
  const params = await searchParams
  const bookingId = params.booking_id

  let deleted = false
  let errorMessage = ''

  if (bookingId) {
    try {
      const payload = await getPayload({ config })

      // Find the booking first to verify it's pending and unpaid
      const booking = await payload.findByID({
        collection: 'bookings',
        id: Number(bookingId),
      })

      if (booking && booking.status === 'pending' && booking.paymentStatus === 'unpaid') {
        // Delete the pending booking
        await payload.delete({
          collection: 'bookings',
          id: Number(bookingId),
        })
        deleted = true
        console.log('[CANCEL PAGE] Deleted pending booking:', bookingId)
      } else if (booking) {
        // Booking exists but is not in a cancellable state
        errorMessage = 'This booking cannot be cancelled automatically. Please contact us.'
        console.log('[CANCEL PAGE] Booking not cancellable:', bookingId, booking.status, booking.paymentStatus)
      } else {
        // Booking not found (may have already been deleted)
        deleted = true
      }
    } catch (err) {
      console.error('[CANCEL PAGE] Error:', err)
      errorMessage = 'An error occurred. Please contact us if you need assistance.'
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✕</div>
        <h1 style={{ fontSize: 24, marginBottom: 12, color: '#071a34' }}>Booking Cancelled</h1>

        {errorMessage ? (
          <p style={{ opacity: 0.7, marginBottom: 24, color: '#a33' }}>
            {errorMessage}
          </p>
        ) : (
          <p style={{ opacity: 0.7, marginBottom: 24 }}>
            Your booking has been cancelled and your payment was not processed.
            <br />
            No charges have been made to your card.
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <Link href="/tours" style={{ display: 'inline-block', padding: '12px 24px', background: '#071a34', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
            Browse Tours
          </Link>
          <Link href="/transfers" style={{ display: 'inline-block', padding: '12px 24px', background: '#f0f0f0', color: '#071a34', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
            Browse Transfers
          </Link>
        </div>

        <div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.6 }}>
          <p>Need help? Contact us:</p>
          <p style={{ marginTop: 8 }}>
            <a href="mailto:info@tobyshighlandtours.com" style={{ color: '#071a34', fontWeight: 700 }}>info@tobyshighlandtours.com</a>
            {' · '}
            <a href="https://wa.me/447383488007" target="_blank" rel="noreferrer" style={{ color: '#071a34', fontWeight: 700 }}>WhatsApp</a>
          </p>
        </div>
      </div>
    </main>
  )
}
