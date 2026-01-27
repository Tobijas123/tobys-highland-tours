import type { CollectionConfig } from 'payload'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const Tours: CollectionConfig = {
  slug: 'tours',

  // żeby API i strona działały bez logowania
  access: {
    read: () => true,
  },

  admin: {
    useAsTitle: 'title',
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
      type: 'relationship',
      relationTo: 'media',
    },

    {
      name: 'priceFrom',
      type: 'number',
      min: 0,
      admin: { description: 'Legacy field – use price1to3/price4to7 instead' },
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
      name: 'durationHours',
      type: 'number',
      min: 0,
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
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'bookingCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Total bookings for this tour (auto-updated)',
      },
    },
    {
      name: 'confirmedCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Confirmed bookings for this tour (auto-updated)',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Multilingual fields (EN is default, others optional)
    // ─────────────────────────────────────────────────────────────
    {
      name: 'i18n',
      type: 'group',
      label: 'Translations',
      admin: {
        description: 'Multilingual content. English is the default fallback.',
      },
      fields: [
        // ── Title translations ──
        {
          name: 'title_en',
          type: 'text',
          label: 'Title (English)',
          admin: { description: 'Default language' },
        },
        {
          name: 'title_pl',
          type: 'text',
          label: 'Title (Polski)',
        },
        {
          name: 'title_es',
          type: 'text',
          label: 'Title (Español)',
        },
        {
          name: 'title_pt',
          type: 'text',
          label: 'Title (Português)',
        },
        {
          name: 'title_hi',
          type: 'text',
          label: 'Title (हिन्दी)',
        },
        {
          name: 'title_zh',
          type: 'text',
          label: 'Title (中文)',
        },

        // ── Short description translations ──
        {
          name: 'shortDescription_en',
          type: 'textarea',
          label: 'Short Description (English)',
          admin: { description: 'Default language' },
        },
        {
          name: 'shortDescription_pl',
          type: 'textarea',
          label: 'Short Description (Polski)',
        },
        {
          name: 'shortDescription_es',
          type: 'textarea',
          label: 'Short Description (Español)',
        },
        {
          name: 'shortDescription_pt',
          type: 'textarea',
          label: 'Short Description (Português)',
        },
        {
          name: 'shortDescription_hi',
          type: 'textarea',
          label: 'Short Description (हिन्दी)',
        },
        {
          name: 'shortDescription_zh',
          type: 'textarea',
          label: 'Short Description (中文)',
        },

        // ── Long description translations ──
        {
          name: 'longDescription_en',
          type: 'richText',
          label: 'Long Description (English)',
          admin: { description: 'Default language' },
        },
        {
          name: 'longDescription_pl',
          type: 'richText',
          label: 'Long Description (Polski)',
        },
        {
          name: 'longDescription_es',
          type: 'richText',
          label: 'Long Description (Español)',
        },
        {
          name: 'longDescription_pt',
          type: 'richText',
          label: 'Long Description (Português)',
        },
        {
          name: 'longDescription_hi',
          type: 'richText',
          label: 'Long Description (हिन्दी)',
        },
        {
          name: 'longDescription_zh',
          type: 'richText',
          label: 'Long Description (中文)',
        },
      ],
    },
  ],
}

export default Tours

