import cron from 'node-cron'
import { getPayload } from 'payload'
import config from '@payload-config'
import { makePaymentToken } from './paymentToken'

const TOBY_EMAIL = process.env.TOBY_EMAIL || 'info@tobyshighlandtours.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://tobyshighlandtours.com'

// Track if cron has been initialized (prevent double-init in dev)
let initialized = false

/**
 * Job 1: Customer Reminder (9 AM daily)
 * Sends reminder emails to customers with bookings scheduled for tomorrow
 */
export async function customerReminderJob(): Promise<void> {
  console.log('[CRON] Running customerReminderJob...')

  try {
    const payload = await getPayload({ config })

    // Calculate tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0] // YYYY-MM-DD

    // Find all bookings for tomorrow with deposit paid (exclude already-sent reminders)
    const bookings = await payload.find({
      collection: 'bookings',
      where: {
        date: { equals: tomorrowStr },
        paymentStatus: { in: ['deposit', 'paid'] },
        status: { not_equals: 'cancelled' },
        reminderSentAt: { exists: false },
      },
      depth: 1,
      limit: 100,
    })

    console.log(`[CRON] Found ${bookings.docs.length} bookings for tomorrow (${tomorrowStr})`)

    for (const booking of bookings.docs) {
      try {
        // Get item title
        const bookingType = booking.type || 'tour'
        const typeLabel = bookingType === 'tour' ? 'tour' : 'transfer'
        let itemTitle = typeLabel

        if (bookingType === 'tour' && booking.tour) {
          itemTitle = typeof booking.tour === 'object' ? booking.tour.title || 'Tour' : 'Tour'
        } else if (bookingType === 'transfer' && booking.transfer) {
          itemTitle = typeof booking.transfer === 'object' ? booking.transfer.title || 'Transfer' : 'Transfer'
        }

        // Generate payment link for transfers that still need to pay remaining balance
        let paymentLink: string | undefined
        let remainingBalance: number | undefined
        if (bookingType === 'transfer' && booking.paymentStatus === 'deposit') {
          const token = makePaymentToken(booking.id)
          paymentLink = `${SITE_URL}/api/public/bookings/pay-remaining?bookingId=${booking.id}&token=${token}`
          remainingBalance = Math.round((booking.totalPrice as number || 0) * 0.80)
        }

        const subject = `Reminder: Your ${typeLabel} is tomorrow`
        const html = generateCustomerReminderEmail({
          customerName: booking.customerName as string,
          typeLabel,
          itemTitle,
          date: booking.date as string,
          pickupTime: booking.pickupTime as string,
          pickupLocation: booking.pickupLocation as string,
          paymentLink,
          remainingBalance,
        })

        await payload.sendEmail({
          to: booking.customerEmail as string,
          subject,
          html,
        })

        // Update reminderSentAt
        await payload.update({
          collection: 'bookings',
          id: booking.id,
          data: {
            reminderSentAt: new Date().toISOString(),
          },
        })

        console.log(`[CRON] Reminder sent to ${booking.customerEmail} for booking #${booking.id}`)
      } catch (err) {
        console.error(`[CRON] Failed to send reminder for booking #${booking.id}:`, err)
      }
    }

    console.log('[CRON] customerReminderJob completed')
  } catch (err) {
    console.error('[CRON] customerReminderJob failed:', err)
  }
}

/**
 * Job 2: Driver Summary (8 AM daily)
 * Sends Toby a summary email of all bookings scheduled for today
 */
export async function driverSummaryJob(): Promise<void> {
  console.log('[CRON] Running driverSummaryJob...')

  try {
    const payload = await getPayload({ config })

    // Calculate today's date
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD

    // Find all bookings for today
    const bookings = await payload.find({
      collection: 'bookings',
      where: {
        date: { equals: todayStr },
        paymentStatus: { in: ['deposit', 'paid'] },
        status: { not_equals: 'cancelled' },
      },
      depth: 1,
      limit: 100,
      sort: 'pickupTime',
    })

    console.log(`[CRON] Found ${bookings.docs.length} bookings for today (${todayStr})`)

    if (bookings.docs.length === 0) {
      console.log('[CRON] No bookings today, skipping driver summary email')
      return
    }

    const subject = `Today's bookings - ${bookings.docs.length} ${bookings.docs.length === 1 ? 'tour/transfer' : 'tours/transfers'}`
    const html = generateDriverSummaryEmail({
      date: todayStr,
      bookings: bookings.docs,
    })

    await payload.sendEmail({
      to: TOBY_EMAIL,
      subject,
      html,
    })

    console.log(`[CRON] Driver summary sent to ${TOBY_EMAIL}`)
    console.log('[CRON] driverSummaryJob completed')
  } catch (err) {
    console.error('[CRON] driverSummaryJob failed:', err)
  }
}

/**
 * Initialize the cron scheduler
 * Call this once on app startup
 */
export function initCron(): void {
  if (initialized) {
    console.log('[CRON] Already initialized, skipping')
    return
  }

  console.log('[CRON] Initializing cron scheduler...')

  // Job 1: Customer reminder at 9 AM daily (UK time)
  // Cron syntax: minute hour day month weekday
  cron.schedule('0 9 * * *', () => {
    customerReminderJob()
  }, {
    timezone: 'Europe/London',
  })

  // Job 2: Driver summary at 8 AM daily (UK time)
  cron.schedule('0 8 * * *', () => {
    driverSummaryJob()
  }, {
    timezone: 'Europe/London',
  })

  initialized = true
  console.log('[CRON] Cron scheduler initialized - jobs scheduled:')
  console.log('[CRON]   - Customer reminder: 9 AM daily (Europe/London)')
  console.log('[CRON]   - Driver summary: 8 AM daily (Europe/London)')
}

// Email templates

function generateCustomerReminderEmail(data: {
  customerName: string
  typeLabel: string
  itemTitle: string
  date: string
  pickupTime: string
  pickupLocation: string
  paymentLink?: string
  remainingBalance?: number
}): string {
  const { customerName, typeLabel, itemTitle, date, pickupTime, pickupLocation, paymentLink, remainingBalance } = data

  // Payment button for transfers with remaining balance
  const paymentSection = paymentLink && remainingBalance ? `
        <div style="background: #fff3cd; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 12px; color: #856404;"><strong>Remaining Balance: £${remainingBalance}</strong></p>
          <p style="margin: 0 0 16px; color: #856404; font-size: 14px;">Please pay your remaining balance before your transfer.</p>
          <a href="${paymentLink}"
             style="display: inline-block; background: #275548; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Pay £${remainingBalance} Now
          </a>
        </div>
  ` : ''

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #071a34; color: #fff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Toby's Highland Tours</h1>
      </div>

      <div style="padding: 24px;">
        <h2 style="color: #071a34; margin-top: 0;">Your ${typeLabel} is tomorrow!</h2>

        <p>Hi ${customerName},</p>

        <p>Just a friendly reminder that your <strong>${itemTitle}</strong> is scheduled for tomorrow.</p>

        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #275548;">
          <p style="margin: 0 0 8px;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 0 0 8px;"><strong>Pickup Time:</strong> ${pickupTime}</p>
          <p style="margin: 0;"><strong>Pickup Location:</strong> ${pickupLocation}</p>
        </div>

        ${paymentSection}

        <p>Please be ready at your pickup location a few minutes before the scheduled time.</p>

        <p>If you have any questions or need to make changes, please contact us as soon as possible:</p>
        <p>
          <a href="mailto:info@tobyshighlandtours.com" style="color: #071a34; font-weight: 600;">info@tobyshighlandtours.com</a><br/>
          <a href="https://wa.me/447383488007" style="color: #071a34; font-weight: 600;">WhatsApp: +44 7383 488007</a>
        </p>

        <p style="margin-top: 32px;">See you tomorrow!</p>
        <p>Cheers,<br/><strong>Toby's Highland Tours</strong></p>
      </div>

      <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin: 0;">Toby's Highland Tours | Inverness, Scotland</p>
        <p style="margin: 8px 0 0;">
          <a href="https://tobyshighlandtours.com" style="color: #666;">tobyshighlandtours.com</a>
        </p>
      </div>
    </div>
  `
}

function generateDriverSummaryEmail(data: {
  date: string
  bookings: any[]
}): string {
  const { date, bookings } = data

  const bookingRows = bookings.map((booking) => {
    const bookingType = booking.type || 'tour'
    let itemTitle = bookingType === 'tour' ? 'Tour' : 'Transfer'

    if (bookingType === 'tour' && booking.tour) {
      itemTitle = typeof booking.tour === 'object' ? booking.tour.title || 'Tour' : 'Tour'
    } else if (bookingType === 'transfer' && booking.transfer) {
      itemTitle = typeof booking.transfer === 'object' ? booking.transfer.title || 'Transfer' : 'Transfer'
    }

    const phone = booking.customerPhone || 'No phone'
    const notes = booking.notes || ''

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600;">${booking.pickupTime || 'TBD'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">
          <strong>${booking.customerName}</strong><br/>
          <span style="font-size: 13px; color: #666;">${phone}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">
          ${booking.paxCount || 1} pax
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">
          <strong>${itemTitle}</strong><br/>
          <span style="font-size: 13px; color: #666;">
            Pickup: ${booking.pickupLocation || 'TBD'}<br/>
            Dropoff: ${booking.dropoffLocation || 'TBD'}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 13px; color: #666;">
          ${notes ? notes : '-'}
        </td>
      </tr>
    `
  }).join('')

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="background: #275548; color: #fff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Today's Bookings</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">${date}</p>
      </div>

      <div style="padding: 24px;">
        <p style="font-size: 18px; margin-top: 0;">
          You have <strong>${bookings.length}</strong> ${bookings.length === 1 ? 'booking' : 'bookings'} today.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Time</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Customer</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Pax</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Details</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${bookingRows}
          </tbody>
        </table>

        <p style="margin-top: 32px; text-align: center;">
          <a href="https://tobyshighlandtours.com/admin/collections/bookings"
             style="display: inline-block; background: #071a34; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View All Bookings in Admin
          </a>
        </p>
      </div>

      <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin: 0;">Have a great day!</p>
      </div>
    </div>
  `
}
