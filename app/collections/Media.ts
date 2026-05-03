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
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: undefined,
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      {
        name: 'card',
        width: 800,
        height: undefined,
        formatOptions: { format: 'webp', options: { quality: 78 } },
      },
      {
        name: 'hero',
        width: 1920,
        height: undefined,
        formatOptions: { format: 'webp', options: { quality: 78 } },
      },
    ],
    resizeOptions: {
      width: 1920,
      withoutEnlargement: true,
    },
    formatOptions: {
      format: 'webp',
      options: { quality: 80 },
    },
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}

export default Media
