import type { CollectionConfig } from 'payload'

const Vehicles: CollectionConfig = {
  slug: 'vehicles',

  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'seats', 'regPlate', 'isActive'],
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Mercedes V-Class"' },
    },
    {
      name: 'seats',
      type: 'number',
      required: true,
      min: 1,
      max: 50,
    },
    {
      name: 'regPlate',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Registration plate (unique)' },
    },
    {
      name: 'make',
      type: 'text',
    },
    {
      name: 'model',
      type: 'text',
    },
    {
      name: 'year',
      type: 'number',
      min: 1990,
      max: 2030,
    },
    {
      name: 'color',
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
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

export default Vehicles
