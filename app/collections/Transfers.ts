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
    defaultColumns: ['title', 'fromLocation', 'toLocation', 'price1to4', 'price5to7', 'isActive'],
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
      name: 'descriptionStyle',
      type: 'group',
      label: 'Description Section Style',
      admin: {
        description: 'Customize the appearance of the description section',
      },
      fields: [
        {
          name: 'backgroundColor',
          type: 'text',
          label: 'Background Color',
          admin: {
            description: 'CSS color value (e.g., #f5f5f5, rgb(245,245,245), transparent)',
          },
        },
        {
          name: 'textColor',
          type: 'text',
          label: 'Text Color',
          admin: {
            description: 'CSS color value (e.g., #333333, rgb(51,51,51))',
          },
        },
        {
          name: 'padding',
          type: 'text',
          label: 'Padding',
          admin: {
            description: 'CSS padding value (e.g., 20px, 1rem 2rem)',
          },
        },
        {
          name: 'borderRadius',
          type: 'text',
          label: 'Border Radius',
          admin: {
            description: 'CSS border-radius value (e.g., 8px, 1rem)',
          },
        },
      ],
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show on home page even if not yet popular. Use for new or seasonal transfers.',
      },
    },
    {
      name: 'price1to4',
      type: 'number',
      min: 0,
      admin: { description: 'Price for 1–4 people (£)' },
    },
    {
      name: 'price5to7',
      type: 'number',
      min: 0,
      admin: { description: 'Price for 5–7 people (£)' },
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
    {
      name: 'bookingCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Total bookings for this transfer (auto-updated)',
      },
    },
    {
      name: 'confirmedCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Confirmed bookings for this transfer (auto-updated)',
      },
    },
  ],
}

export default Transfers
