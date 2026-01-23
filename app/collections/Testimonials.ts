import type { CollectionConfig } from 'payload'

const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: 'Testimonial',
    plural: 'Testimonials',
  },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'source', 'rating', 'featured', 'order'],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'source',
      type: 'select',
      label: 'Source',
      defaultValue: 'facebook',
      options: [
        { label: 'Facebook', value: 'facebook' },
        { label: 'Google', value: 'google' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'authorName',
      type: 'text',
      label: 'Author Name',
      required: true,
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Review Text',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      label: 'Rating (1-5)',
      defaultValue: 5,
      min: 1,
      max: 5,
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Source URL (optional)',
      admin: {
        description: 'Link to the original review (e.g. Facebook post)',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured',
      defaultValue: true,
      admin: {
        description: 'Show this testimonial on the homepage',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first',
      },
    },
    {
      name: 'seedKey',
      type: 'text',
      label: 'Seed Key',
      unique: true,
      admin: {
        description: 'Internal key for idempotent seeding (do not edit)',
        position: 'sidebar',
      },
    },
  ],
}

export default Testimonials
