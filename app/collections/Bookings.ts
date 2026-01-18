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
    defaultColumns: ['createdAt', 'tour', 'date', 'partySize', 'status', 'customerEmail'],
  },

  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (operation !== 'update') return doc
        if (!previousDoc || previousDoc.status === doc.status) return doc

        const newStatus = doc.status
        if (newStatus !== 'confirmed' && newStatus !== 'cancelled') return doc

        let tourTitle = 'Tour'
        if (doc.tour) {
          const tourDoc = typeof doc.tour === 'object' ? doc.tour : null
          if (tourDoc?.title) {
            tourTitle = tourDoc.title
          } else if (typeof doc.tour === 'number') {
            try {
              const fetched = await req.payload.findByID({ collection: 'tours', id: doc.tour })
              tourTitle = fetched?.title || 'Tour'
            } catch {
              // ignore
            }
          }
        }

        const partyLabel = doc.partySize === '1-3' ? '1–3 people' : '4–7 people'
        const phoneInfo = doc.customerPhone ? `<li><strong>Phone:</strong> ${doc.customerPhone}</li>` : ''

        if (newStatus === 'confirmed') {
          const subject = `Booking Confirmed – ${tourTitle} on ${doc.date}`
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #071a34;">Booking Confirmed!</h2>
              <p>Hi ${doc.customerName},</p>
              <p>Great news! Your booking has been <strong>confirmed</strong>:</p>
              <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Tour</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${tourTitle}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${doc.date}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Party size</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${partyLabel}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: #275548; font-weight: bold;">Confirmed</td></tr>
              </table>
              <p><strong>Meeting point:</strong> We will send you meeting details closer to the date.</p>
              <p>If you have any questions, reply to this email or contact us at <a href="mailto:info@tobyshighlandtours.com">info@tobyshighlandtours.com</a>.</p>
              <p style="margin-top: 24px;">Cheers,<br/><strong>Toby's Highland Tours</strong></p>
            </div>
          `
          // Preview log
          console.log('[EMAIL PREVIEW] To:', doc.customerEmail, '| Subject:', subject)

          try {
            await req.payload.sendEmail({ to: doc.customerEmail, subject, html })
            console.log('[EMAIL SENT] Confirmation to', doc.customerEmail)
          } catch (err) {
            console.error('[EMAIL FAILED] Confirmation:', err)
          }
        }

        if (newStatus === 'cancelled') {
          const subject = `Booking Cancelled – ${tourTitle}`
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #071a34;">Booking Cancelled</h2>
              <p>Hi ${doc.customerName},</p>
              <p>We're sorry to inform you that your booking has been <strong>cancelled</strong>:</p>
              <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Tour</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${tourTitle}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${doc.date}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Party size</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${partyLabel}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: #a33; font-weight: bold;">Cancelled</td></tr>
              </table>
              <p>If you'd like to reschedule or have questions, contact us at <a href="mailto:info@tobyshighlandtours.com">info@tobyshighlandtours.com</a>.</p>
              <p style="margin-top: 24px;">Cheers,<br/><strong>Toby's Highland Tours</strong></p>
            </div>
          `
          // Preview log
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
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'tours',
      required: true,
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      admin: { description: 'YYYY-MM-DD' },
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
    {
      name: 'priceTier',
      type: 'select',
      options: [
        { label: 'Price 1–3', value: 'price1to3' },
        { label: 'Price 4–7', value: 'price4to7' },
      ],
      admin: { description: 'Auto-set from party size' },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
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
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'website',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Manual', value: 'manual' },
      ],
    },
  ],

  timestamps: true,
}

export default Bookings
