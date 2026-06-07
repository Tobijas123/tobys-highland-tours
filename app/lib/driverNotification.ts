import type { Payload } from 'payload'

/**
 * Send assignment notification email to driver
 * @returns true if email sent successfully, false otherwise
 */
export async function sendDriverAssignmentEmail(
  payload: Payload,
  booking: any,
): Promise<boolean> {
  // Get driver ID from booking (can be object or number)
  const driverId = typeof booking.driver === 'object' ? booking.driver?.id : booking.driver
  if (!driverId) {
    console.error('[DRIVER] No driver ID in booking:', booking.id)
    return false
  }

  try {
    // Fetch driver details
    const driver = await payload.findByID({
      collection: 'drivers',
      id: driverId,
    })

    if (!driver?.email) {
      console.error('[DRIVER] No email found for driver:', driverId)
      return false
    }

    // Get item title
    const bookingType = booking.type || 'tour'
    const typeLabel = bookingType === 'tour' ? 'Tour' : 'Transfer'
    let itemTitle = typeLabel

    if (bookingType === 'tour' && booking.tour) {
      const tourDoc = typeof booking.tour === 'object' ? booking.tour : null
      if (tourDoc?.title) {
        itemTitle = tourDoc.title
      } else if (typeof booking.tour === 'number') {
        try {
          const fetched = await payload.findByID({ collection: 'tours', id: booking.tour })
          itemTitle = fetched?.title || 'Tour'
        } catch {
          // ignore
        }
      }
    } else if (bookingType === 'transfer' && booking.transfer) {
      const transferDoc = typeof booking.transfer === 'object' ? booking.transfer : null
      if (transferDoc?.title) {
        itemTitle = transferDoc.title
      } else if (typeof booking.transfer === 'number') {
        try {
          const fetched = await payload.findByID({ collection: 'transfers', id: booking.transfer })
          itemTitle = fetched?.title || 'Transfer'
        } catch {
          // ignore
        }
      }
    }

    // Get vehicle info
    let vehicleInfo = '—'
    if (booking.vehicle) {
      const vehicleDoc = typeof booking.vehicle === 'object' ? booking.vehicle : null
      if (vehicleDoc?.title) {
        vehicleInfo = vehicleDoc.title
      } else if (typeof booking.vehicle === 'number') {
        try {
          const fetched = await payload.findByID({ collection: 'vehicles', id: booking.vehicle })
          vehicleInfo = fetched?.title || '—'
        } catch {
          // ignore
        }
      }
    }

    const driverName = driver.firstName || 'Driver'
    const subject = `New tour assigned — ${booking.date} — ${itemTitle}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #071a34; color: #fff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Toby's Highland Tours</h1>
        </div>

        <div style="padding: 24px;">
          <h2 style="color: #071a34; margin-top: 0;">New ${typeLabel} Assigned</h2>

          <p>Hi ${driverName},</p>
          <p>You have been assigned to a new ${typeLabel.toLowerCase()}:</p>

          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${typeLabel}</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${itemTitle}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.date}</td></tr>
            ${booking.pickupTime ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Pickup Time</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.pickupTime}</td></tr>` : ''}
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Vehicle</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${vehicleInfo}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.customerName}${booking.customerPhone ? ` — ${booking.customerPhone}` : ''}</td></tr>
            ${booking.pickupLocation ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Pickup</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.pickupLocation}</td></tr>` : ''}
            ${booking.dropoffLocation ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Drop-off</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.dropoffLocation}</td></tr>` : ''}
            ${booking.paxCount ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Passengers</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.paxCount}</td></tr>` : ''}
            ${booking.notes ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Notes</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.notes}</td></tr>` : ''}
          </table>

          <p>Please check the admin panel for full details or contact us if you have any questions.</p>

          <p style="margin-top: 24px;">Cheers,<br/><strong>Toby's Highland Tours</strong></p>
        </div>
      </div>
    `

    await payload.sendEmail({
      to: driver.email,
      subject,
      html,
    })

    console.log('[DRIVER] notification email sent to:', driver.email)
    return true
  } catch (err) {
    console.error('[DRIVER] email failed', err)
    return false
  }
}
