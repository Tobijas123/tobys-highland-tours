import type { CollectionConfig } from 'payload'

const Media: CollectionConfig = {
  slug: 'media',

  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },

  upload: {
    staticDir: 'media',
    staticURL: '/media',
    mimeTypes: ['image/*'],
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}

export default Media
