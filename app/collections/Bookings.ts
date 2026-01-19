import type { CollectionConfig } from 'payload'

const Bookings: CollectionConfig = {
  slug: 'bookings',

  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true, // public can create via API
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },

  admin: {
    useAsTitle: 'customerEmail',
    defaultColumns: ['createdAt', 'type', 'tour', 'transfer', 'date', 'pickupTime', 'paxCount', 'status', 'paymentStatus', 'vehicle', 'driver', 'customerName'],
    listSearchableFields: ['customerName', 'customerEmail', 'pickupLocation', 'dropoffLocation'],
  },

  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        // Enforce consistency: type must match relationship
        if (data.type === 'tour') {
          data.transfer = null
        } else if (data.type === 'transfer') {
          data.tour = null
        }
        return data
      },
    ],

    beforeChange: [
      // Auto-calculate totalPrice from related tour/transfer
      async ({ data, req, operation }) => {
        if (!data) return data

        // Only calculate if we have partySize and a tour/transfer
        const partySize = data.partySize
        if (!partySize) return data

        const priceField = partySize === '1-3' ? 'price1to3' : 'price4to7'
        let price: number | null = null

        if (data.type === 'tour' && data.tour) {
          const tourId = typeof data.tour === 'object' ? data.tour.id : data.tour
          if (tourId) {
            try {
              const tourDoc = await req.payload.findByID({ collection: 'tours', id: tourId })
              price = tourDoc?.[priceField] ?? null
            } catch {
              // ignore
            }
          }
        } else if (data.type === 'transfer' && data.transfer) {
          const transferId = typeof data.transfer === 'object' ? data.transfer.id : data.transfer
          if (transferId) {
            try {
              const transferDoc = await req.payload.findByID({ collection: 'transfers', id: transferId })
              price = transferDoc?.[priceField] ?? null
            } catch {
              // ignore
            }
          }
        }

        if (typeof price === 'number') {
          data.totalPrice = price
        }

        // Also set priceTier for consistency
        data.priceTier = priceField

        return data
      },

      // Guardrail: block confirming without required operational fields
      async ({ data, originalDoc }) => {
        if (!data) return data

        // Only check when status is being set to 'confirmed'
        const isConfirming = data.status === 'confirmed' && originalDoc?.status !== 'confirmed'

        if (isConfirming) {
          const missing: string[] = []

          if (!data.pickupTime && !originalDoc?.pickupTime) missing.push('Pickup time')
          if (!data.pickupLocation && !originalDoc?.pickupLocation) missing.push('Pickup location')
          if (!data.dropoffLocation && !originalDoc?.dropoffLocation) missing.push('Drop-off location')
          if (!data.paxCount && !originalDoc?.paxCount) missing.push('Passenger count')
          if (!data.vehicle && !originalDoc?.vehicle) missing.push('Vehicle')
          if (!data.driver && !originalDoc?.driver) missing.push('Driver')

          if (missing.length > 0) {
            throw new Error(`Cannot confirm booking. Missing required fields: ${missing.join(', ')}`)
          }
        }

        return data
      },
    ],

    afterChange: [
      // Counter updates for bookingCount and confirmedCount
      async ({ doc, previousDoc, req, operation }) => {
        // Skip if this is a recursive call from counter update
        if (req.context?.__skipBookingCounterHook) return doc

        const bookingType = doc.type || 'tour'
        const collection = bookingType === 'tour' ? 'tours' : 'transfers'
        const itemId = bookingType === 'tour' ? doc.tour : doc.transfer
        const resolvedItemId = typeof itemId === 'object' ? itemId?.id : itemId

        if (!resolvedItemId) return doc

        // A) On create: increment bookingCount
        if (operation === 'create') {
          try {
            const item = await req.payload.findByID({ collection, id: resolvedItemId })
            await req.payload.update({
              collection,
              id: resolvedItemId,
              data: { bookingCount: (item?.bookingCount || 0) + 1 },
              depth: 0,
            })
          } catch (err) {
            console.error('[COUNTER] Failed to increment bookingCount:', err)
          }
        }

        // B) On update: handle confirmedCount transitions
        if (operation === 'update' && previousDoc) {
          const newStatus = doc.status
          const oldStatus = previousDoc.status
          const wasCountedConfirmed = previousDoc.countedConfirmed || false

          // Confirmed and not yet counted → increment confirmedCount
          if (newStatus === 'confirmed' && !wasCountedConfirmed) {
            try {
              const item = await req.payload.findByID({ collection, id: resolvedItemId })
              await req.payload.update({
                collection,
                id: resolvedItemId,
                data: { confirmedCount: (item?.confirmedCount || 0) + 1 },
                depth: 0,
              })
              // Update booking to mark as counted
              await req.payload.update({
                collection: 'bookings',
                id: doc.id,
                data: { countedConfirmed: true },
                depth: 0,
                context: { __skipBookingCounterHook: true },
              })
            } catch (err) {
              console.error('[COUNTER] Failed to increment confirmedCount:', err)
            }
          }

          // Cancelled and was counted → decrement confirmedCount
          if (newStatus === 'cancelled' && wasCountedConfirmed) {
            try {
              const item = await req.payload.findByID({ collection, id: resolvedItemId })
              const newCount = Math.max(0, (item?.confirmedCount || 0) - 1)
              await req.payload.update({
                collection,
                id: resolvedItemId,
                data: { confirmedCount: newCount },
                depth: 0,
              })
              // Update booking to mark as not counted
              await req.payload.update({
                collection: 'bookings',
                id: doc.id,
                data: { countedConfirmed: false },
                depth: 0,
                context: { __skipBookingCounterHook: true },
              })
            } catch (err) {
              console.error('[COUNTER] Failed to decrement confirmedCount:', err)
            }
          }
        }

        return doc
      },

      // Email notifications
      async ({ doc, previousDoc, req, operation }) => {
        if (operation !== 'update') return doc
        if (!previousDoc || previousDoc.status === doc.status) return doc

        const newStatus = doc.status
        if (newStatus !== 'confirmed' && newStatus !== 'cancelled') return doc

        // Determine type and title
        const bookingType = doc.type || 'tour'
        const typeLabel = bookingType === 'tour' ? 'Tour' : 'Transfer'
        let itemTitle = typeLabel

        if (bookingType === 'tour' && doc.tour) {
          const tourDoc = typeof doc.tour === 'object' ? doc.tour : null
          if (tourDoc?.title) {
            itemTitle = tourDoc.title
          } else if (typeof doc.tour === 'number') {
            try {
              const fetched = await req.payload.findByID({ collection: 'tours', id: doc.tour })
              itemTitle = fetched?.title || 'Tour'
            } catch {
              // ignore
            }
          }
        } else if (bookingType === 'transfer' && doc.transfer) {
          const transferDoc = typeof doc.transfer === 'object' ? doc.transfer : null
          if (transferDoc?.title) {
            itemTitle = transferDoc.title
          } else if (typeof doc.transfer === 'number') {
            try {
              const fetched = await req.payload.findByID({ collection: 'transfers', id: doc.transfer })
              itemTitle = fetched?.title || 'Transfer'
            } catch {
              // ignore
            }
          }
        }

        // Get vehicle and driver info
        let vehicleInfo = '—'
        let driverInfo = '—'

        if (doc.vehicle) {
          const vehicleDoc = typeof doc.vehicle === 'object' ? doc.vehicle : null
          if (vehicleDoc?.title) {
            vehicleInfo = vehicleDoc.title
          } else if (typeof doc.vehicle === 'number') {
            try {
              const fetched = await req.payload.findByID({ collection: 'vehicles', id: doc.vehicle })
              vehicleInfo = fetched?.title || '—'
            } catch {
              // ignore
            }
          }
        }

        if (doc.driver) {
          const driverDoc = typeof doc.driver === 'object' ? doc.driver : null
          if (driverDoc) {
            driverInfo = `${driverDoc.firstName || ''} ${driverDoc.lastName || ''}`.trim() || '—'
          } else if (typeof doc.driver === 'number') {
            try {
              const fetched = await req.payload.findByID({ collection: 'drivers', id: doc.driver })
              driverInfo = `${fetched?.firstName || ''} ${fetched?.lastName || ''}`.trim() || '—'
            } catch {
              // ignore
            }
          }
        }

        const partyLabel = doc.partySize === '1-3' ? '1–3 people' : '4–7 people'
        const paymentLabel = doc.paymentStatus === 'paid' ? 'Paid' : doc.paymentStatus === 'deposit' ? 'Deposit paid' : 'Unpaid'
        const priceInfo = typeof doc.totalPrice === 'number' ? `£${doc.totalPrice}` : '—'

        if (newStatus === 'confirmed') {
          const subject = `Booking Confirmed – ${itemTitle} on ${doc.date}`
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #071a34;">Booking Confirmed!</h2>
              <p>Hi ${doc.customerName},</p>
              <p>Great news! Your booking has been <strong>confirmed</strong>:</p>
              <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Type</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${typeLabel}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${typeLabel}</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${itemTitle}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${doc.date}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Pickup time</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${doc.pickupTime || '—'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Pickup location</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${doc.pickupLocation || '—'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Drop-off location</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${doc.dropoffLocation || '—'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Passengers</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${doc.paxCount || '—'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Party size</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${partyLabel}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Total price</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${priceInfo}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${paymentLabel}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Vehicle</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${vehicleInfo}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Driver</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${driverInfo}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: #275548; font-weight: bold;">Confirmed</td></tr>
              </table>
              <p>If you have any questions, reply to this email or contact us at <a href="mailto:info@tobyshighlandtours.com">info@tobyshighlandtours.com</a>.</p>
              <p style="margin-top: 24px;">Cheers,<br/><strong>Toby's Highland Tours</strong></p>
            </div>
          `
          console.log('[EMAIL PREVIEW] To:', doc.customerEmail, '| Subject:', subject)

          try {
            await req.payload.sendEmail({ to: doc.customerEmail, subject, html })
            console.log('[EMAIL SENT] Confirmation to', doc.customerEmail)
          } catch (err) {
            console.error('[EMAIL FAILED] Confirmation:', err)
          }
        }

        if (newStatus === 'cancelled') {
          const subject = `Booking Cancelled – ${itemTitle}`
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #071a34;">Booking Cancelled</h2>
              <p>Hi ${doc.customerName},</p>
              <p>We're sorry to inform you that your booking has been <strong>cancelled</strong>:</p>
              <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Type</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${typeLabel}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${typeLabel}</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${itemTitle}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${doc.date}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Pickup time</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${doc.pickupTime || '—'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Total price</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${priceInfo}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Passengers</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${doc.paxCount || '—'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: #a33; font-weight: bold;">Cancelled</td></tr>
              </table>
              <p>We apologise for any inconvenience. If you'd like to reschedule or have questions, please contact us at <a href="mailto:info@tobyshighlandtours.com">info@tobyshighlandtours.com</a>.</p>
              <p style="margin-top: 24px;">Cheers,<br/><strong>Toby's Highland Tours</strong></p>
            </div>
          `
          console.log('[EMAIL PREVIEW] To:', doc.customerEmail, '| Subject:', subject)

          try {
            await req.payload.sendEmail({ to: doc.customerEmail, subject, html })
            console.log('[EMAIL SENT] Cancellation to', doc.customerEmail)
          } catch (err) {
            console.error('[EMAIL FAILED] Cancellation:', err)
          }
        }

        return doc
      },
    ],
  },

  fields: [
    // === BOOKING TYPE & ITEM ===
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'tour',
      options: [
        { label: 'Tour', value: 'tour' },
        { label: 'Transfer', value: 'transfer' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'tours',
      required: false,
      admin: {
        condition: (data) => data?.type === 'tour',
      },
    },
    {
      name: 'transfer',
      type: 'relationship',
      relationTo: 'transfers',
      required: false,
      admin: {
        condition: (data) => data?.type === 'transfer',
      },
    },

    // === SCHEDULE ===
    {
      name: 'date',
      type: 'text',
      required: true,
      admin: { description: 'YYYY-MM-DD' },
    },
    {
      name: 'pickupTime',
      type: 'text',
      required: false,
      admin: { description: 'HH:MM (24h format)' },
    },
    {
      name: 'pickupLocation',
      type: 'text',
      required: false,
    },
    {
      name: 'dropoffLocation',
      type: 'text',
      required: false,
    },

    // === PASSENGERS & PRICING ===
    {
      name: 'paxCount',
      type: 'number',
      required: false,
      min: 1,
      max: 50,
      admin: { description: 'Number of passengers' },
    },
    {
      name: 'partySize',
      type: 'select',
      required: true,
      options: [
        { label: '1–3 people', value: '1-3' },
        { label: '4–7 people', value: '4-7' },
      ],
    },
    {
      name: 'priceTier',
      type: 'select',
      options: [
        { label: 'Price 1–3', value: 'price1to3' },
        { label: 'Price 4–7', value: 'price4to7' },
      ],
      admin: { description: 'Auto-set from party size', readOnly: true },
    },
    {
      name: 'totalPrice',
      type: 'number',
      min: 0,
      admin: { description: 'Auto-calculated from tour/transfer price' },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'unpaid',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Deposit paid', value: 'deposit' },
        { label: 'Paid', value: 'paid' },
      ],
    },

    // === CUSTOMER ===
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'customerPhone',
      type: 'text',
    },

    // === ASSIGNMENT ===
    {
      name: 'vehicle',
      type: 'relationship',
      relationTo: 'vehicles',
      required: false,
    },
    {
      name: 'driver',
      type: 'relationship',
      relationTo: 'drivers',
      required: false,
    },

    // === STATUS & NOTES ===
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'website',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Manual', value: 'manual' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Customer notes (visible to customer)' },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: { description: 'Internal notes (NOT sent to customer)' },
    },
    {
      name: 'countedConfirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
        description: 'Internal flag: true if this booking was counted in confirmedCount',
      },
    },
  ],

  timestamps: true,
}

export default Bookings
