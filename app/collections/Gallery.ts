import type { CollectionConfig } from 'payload'

const Gallery: CollectionConfig = {
  slug: 'gallery',

  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sortOrder', 'isActive'],
  },

  defaultSort: 'sortOrder',

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Section title, e.g. "Isle of Skye"' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Order of this section (lower = first)' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          admin: { description: 'Optional caption for this image' },
        },
      ],
    },
  ],
}

export default Gallery
