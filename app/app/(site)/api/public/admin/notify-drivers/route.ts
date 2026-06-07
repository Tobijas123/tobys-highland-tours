import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendDriverAssignmentEmail } from '@/lib/driverNotification'

export const dynamic = 'force-dynamic'

/**
 * One-off endpoint to send driver notification emails for existing confirmed bookings.
 * GET /api/public/admin/notify-drivers?secret=CRON_SECRET
 *
 * Only sends emails to drivers, NOT to customers.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  // Verify secret
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[DRIVER-BACKFILL] Starting driver notification backfill...')

  try {
    const payload = await getPayload({ config })

    // Get today's date in Europe/London timezone as YYYY-MM-DD
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' })

    // Find all confirmed bookings with driver assigned and date >= today
    const bookings = await payload.find({
      collection: 'bookings',
      where: {
        status: { equals: 'confirmed' },
        driver: { exists: true },
        date: { greater_than_equal: today },
      },
      depth: 1,
      limit: 500,
    })

    const total = bookings.docs.length
    let sent = 0
    let failed = 0

    console.log(`[DRIVER-BACKFILL] Found ${total} confirmed bookings with drivers (date >= ${today})`)

    for (const booking of bookings.docs) {
      const success = await sendDriverAssignmentEmail(payload, booking)
      if (success) {
        sent++
      } else {
        failed++
      }
    }

    console.log(`[DRIVER-BACKFILL] Completed: total=${total}, sent=${sent}, failed=${failed}`)

    return NextResponse.json({ total, sent, failed })
  } catch (err) {
    console.error('[DRIVER-BACKFILL] Error:', err)
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 })
  }
}
