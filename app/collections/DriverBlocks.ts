import type { CollectionConfig } from 'payload'

const DriverBlocks: CollectionConfig = {
  slug: 'driver-blocks',

  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },

  admin: {
    hidden: true,
    useAsTitle: 'reason',
    defaultColumns: ['driver', 'startDate', 'endDate', 'reason'],
  },

  fields: [
    {
      name: 'driver',
      type: 'relationship',
      relationTo: 'drivers',
      required: true,
    },
    {
      name: 'startDate',
      type: 'text',
      required: true,
      admin: { description: 'YYYY-MM-DD' },
    },
    {
      name: 'endDate',
      type: 'text',
      required: true,
      admin: { description: 'YYYY-MM-DD, ostatni dzień włącznie' },
    },
    {
      name: 'reason',
      type: 'text',
      admin: { description: 'np. Holiday, Service' },
    },
  ],
}

export default DriverBlocks
