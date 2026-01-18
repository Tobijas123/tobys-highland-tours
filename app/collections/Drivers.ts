import type { CollectionConfig } from 'payload'

const Drivers: CollectionConfig = {
  slug: 'drivers',

  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },

  admin: {
    useAsTitle: 'firstName',
    defaultColumns: ['firstName', 'lastName', 'email', 'isActive'],
  },

  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'assignedVehicles',
      type: 'relationship',
      relationTo: 'vehicles',
      hasMany: true,
    },
  ],
}

export default Drivers
