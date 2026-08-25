import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import Stripe from 'stripe'
import Link from 'next/link'
import GoogleAdsConversion from '../../components/GoogleAdsConversion'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ session_id?: string; bookingId?: string; payment?: string }>
}

export default async function BookingSuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const sessionId = params.session_id
  const bookingIdParam = params.bookingId
  const paymentType = params.payment // 'remaining' for pay-remaining flow

  // If neither session_id nor bookingId, redirect home
  if (!sessionId && !bookingIdParam) {
    redirect('/')
  }

  const payload = await getPayload({ config })
  let booking: any = null
  let itemTitle = ''
  let isStripePayment = false
  let depositPaid = 0
  let conversionValue = 0

  // CASE 1: Stripe payment flow (session_id present) - used for pay-remaining
  if (sessionId) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    })

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)

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

      isStripePayment = true
      depositPaid = session.amount_total ? session.amount_total / 100 : 0
      conversionValue = depositPaid

      // Get booking from metadata
      const metaBookingId = session.metadata?.bookingId
      if (metaBookingId) {
        booking = await payload.findByID({
          collection: 'bookings',
          id: Number(metaBookingId),
          depth: 1,
        })
      }
    } catch (err) {
      console.error('[SUCCESS PAGE] Stripe error:', err)
    }
  }

  // CASE 2: Cash booking flow (bookingId present, no session_id)
  if (!isStripePayment && bookingIdParam) {
    try {
      booking = await payload.findByID({
        collection: 'bookings',
        id: Number(bookingIdParam),
        depth: 1,
      })
    } catch (err) {
      console.error('[SUCCESS PAGE] Booking fetch error:', err)
    }
  }

  // Get item title
  if (booking?.type === 'tour' && booking?.tour) {
    itemTitle = typeof booking.tour === 'object' ? booking.tour.title : 'Tour'
  } else if (booking?.type === 'transfer' && booking?.transfer) {
    itemTitle = typeof booking.transfer === 'object' ? booking.transfer.title : 'Transfer'
  }

  const totalPrice = booking?.totalPrice ?? 0

  // For Stripe payments, calculate remaining
  const remainingBalance = isStripePayment ? Math.round(totalPrice - depositPaid) : 0

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      {/* Google Ads conversion - only for Stripe payments */}
      {isStripePayment && conversionValue > 0 && sessionId && (
        <GoogleAdsConversion value={conversionValue} transactionId={sessionId} />
      )}

      <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: '#275548' }}>✓</div>
        <h1 style={{ fontSize: 24, marginBottom: 12, color: '#071a34' }}>
          {isStripePayment && paymentType === 'remaining' ? 'Payment Complete!' : 'Booking Received!'}
        </h1>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>
          {isStripePayment
            ? 'Thank you for your payment. Check your email for confirmation details.'
            : 'Thank you for your booking. Check your email for confirmation details.'
          }
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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Total Price:</span>
                <span style={{ fontWeight: 700 }}>£{totalPrice}</span>
              </div>
              {isStripePayment && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: '#275548' }}>
                    <span>Amount Paid:</span>
                    <span style={{ fontWeight: 700 }}>£{depositPaid.toFixed(2)}</span>
                  </div>
                  {remainingBalance > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      <span style={{ opacity: 0.7 }}>Remaining:</span>
                      <span style={{ fontWeight: 700 }}>£{remainingBalance}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Payment info message */}
        <div style={{ fontSize: 13, marginBottom: 24, lineHeight: 1.6, padding: 16, background: '#f0fdf4', borderRadius: 8, textAlign: 'left' }}>
          {isStripePayment ? (
            paymentType === 'remaining' ? (
              <p style={{ margin: 0, color: '#166534' }}>
                <strong>Your booking is now fully paid.</strong> See you soon!
              </p>
            ) : remainingBalance > 0 ? (
              <p style={{ margin: 0, color: '#166534' }}>
                Please bring the remaining balance (£{remainingBalance}) in cash or card on the day.
              </p>
            ) : (
              <p style={{ margin: 0, color: '#166534' }}>
                <strong>Payment complete.</strong> See you soon!
              </p>
            )
          ) : (
            <>
              <p style={{ margin: '0 0 8px', color: '#166534' }}>
                <strong>You&apos;ll pay your driver directly</strong> (cash or card) on the day of your {booking?.type === 'tour' ? 'tour' : 'transfer'}.
              </p>
              <p style={{ margin: 0, color: '#166534', fontSize: 12 }}>
                Prefer to pay by card in advance? Reply to your confirmation email and we&apos;ll send you a secure payment link.
              </p>
            </>
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
