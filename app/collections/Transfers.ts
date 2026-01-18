import type { CollectionConfig } from 'payload'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const Transfers: CollectionConfig = {
  slug: 'transfers',

  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'fromLocation', 'toLocation', 'price1to3', 'price4to7', 'isActive'],
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            const raw =
              typeof value === 'string' && value.trim()
                ? value
                : typeof data?.title === 'string'
                  ? data.title
                  : ''
            return slugify(raw)
          },
        ],
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
    },
    {
      name: 'longDescription',
      type: 'richText',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'price1to3',
      type: 'number',
      min: 0,
      admin: { description: 'Price for 1–3 people (£)' },
    },
    {
      name: 'price4to7',
      type: 'number',
      min: 0,
      admin: { description: 'Price for 4–7 people (£)' },
    },
    {
      name: 'durationText',
      type: 'text',
      admin: { description: 'e.g. "Approx. 3h"' },
    },
    {
      name: 'fromLocation',
      type: 'text',
    },
    {
      name: 'toLocation',
      type: 'text',
    },
    {
      name: 'highlights',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}

export default Transfers
