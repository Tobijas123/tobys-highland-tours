import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import Stripe from 'stripe'
import Link from 'next/link'
import GoogleAdsConversion from '../../components/GoogleAdsConversion'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ session_id?: string }>
}

export default async function BookingSuccessPage({ searchParams }: Props) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })

  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    redirect('/')
  }

  let session: Stripe.Checkout.Session | null = null
  let booking: any = null
  let itemTitle = ''

  try {
    // Fetch Stripe session
    session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session || session.payment_status !== 'paid') {
      return (
        <main style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>!</div>
            <h1 style={{ fontSize: 24, marginBottom: 12 }}>Payment Not Completed</h1>
            <p style={{ opacity: 0.7, marginBottom: 24 }}>
              Your payment was not completed. Please try again or contact us.
            </p>
            <Link href="/" style={{ display: 'inline-block', padding: '12px 24px', background: '#071a34', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
              Back to Home
            </Link>
          </div>
        </main>
      )
    }

    // Get booking ID from metadata
    const bookingId = session.metadata?.bookingId
    if (bookingId) {
      const payload = await getPayload({ config })
      booking = await payload.findByID({
        collection: 'bookings',
        id: Number(bookingId),
        depth: 1,
      })

      // Get item title
      if (booking?.type === 'tour' && booking?.tour) {
        itemTitle = typeof booking.tour === 'object' ? booking.tour.title : 'Tour'
      } else if (booking?.type === 'transfer' && booking?.transfer) {
        itemTitle = typeof booking.transfer === 'object' ? booking.transfer.title : 'Transfer'
      }
    }
  } catch (err) {
    console.error('[SUCCESS PAGE] Error:', err)
  }

  const depositPaid = session?.amount_total ? (session.amount_total / 100).toFixed(2) : '—'
  const totalPrice = booking?.totalPrice ?? 0
  const remainingBalance = totalPrice ? Math.round(totalPrice * 0.80) : 0

  // Conversion value: amount actually paid (in GBP)
  const conversionValue = session?.amount_total ? session.amount_total / 100 : 0

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      {/* Google Ads conversion - fires only when payment confirmed and has value */}
      {session?.payment_status === 'paid' && conversionValue > 0 && (
        <GoogleAdsConversion value={conversionValue} transactionId={sessionId} />
      )}

      <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: '#275548' }}>✓</div>
        <h1 style={{ fontSize: 24, marginBottom: 12, color: '#071a34' }}>Booking Confirmed!</h1>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>
          Thank you for your booking. Check your email for confirmation details.
        </p>

        {booking && (
          <div style={{ textAlign: 'left', padding: 20, background: '#f8f9fa', borderRadius: 8, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 16, color: '#071a34' }}>Booking Summary</h2>

            <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
              {booking.id && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Booking ID:</span>
                  <span style={{ fontWeight: 700 }}>#{booking.id}</span>
                </div>
              )}
              {itemTitle && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>{booking.type === 'tour' ? 'Tour' : 'Transfer'}:</span>
                  <span style={{ fontWeight: 700 }}>{itemTitle}</span>
                </div>
              )}
              {booking.date && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Date:</span>
                  <span style={{ fontWeight: 700 }}>{booking.date}</span>
                </div>
              )}
              {booking.pickupTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Pickup Time:</span>
                  <span style={{ fontWeight: 700 }}>{booking.pickupTime}</span>
                </div>
              )}
              {booking.pickupLocation && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Pickup:</span>
                  <span style={{ fontWeight: 700 }}>{booking.pickupLocation}</span>
                </div>
              )}
              {booking.paxCount && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Passengers:</span>
                  <span style={{ fontWeight: 700 }}>{booking.paxCount}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ opacity: 0.7 }}>Total Price:</span>
                <span style={{ fontWeight: 700 }}>£{totalPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#275548' }}>
                <span>Deposit Paid:</span>
                <span style={{ fontWeight: 700 }}>£{depositPaid}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Remaining Balance:</span>
                <span style={{ fontWeight: 700 }}>£{remainingBalance}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 24, lineHeight: 1.6 }}>
          {booking?.type === 'tour' ? (
            <p>Please bring the remaining balance (£{remainingBalance}) in cash or card on the day of your tour.</p>
          ) : (
            <p>You will receive an email with a link to pay the remaining balance before your transfer.</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ display: 'inline-block', padding: '12px 24px', background: '#071a34', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
            Back to Home
          </Link>
          <Link href="/tours" style={{ display: 'inline-block', padding: '12px 24px', background: '#f0f0f0', color: '#071a34', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
            Browse Tours
          </Link>
        </div>
      </div>
    </main>
  )
}
