import type { GlobalConfig } from 'payload'

const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Site Settings',
  },
  fields: [
    {
      name: 'heroLogo',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Logo (centered overlay)',
      admin: {
        description: 'Optional logo displayed centered on top of the hero slider',
      },
    },
    {
      name: 'heroSlides',
      type: 'array',
      label: 'Hero Slides',
      minRows: 0,
      maxRows: 10,
      labels: {
        singular: 'Slide',
        plural: 'Slides',
      },
      admin: {
        description: 'Images for the homepage hero slider. Drag to reorder.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Slide Image',
        },
        {
          name: 'heading',
          type: 'text',
          label: 'Heading (optional)',
          admin: {
            description: 'Large text displayed on the slide',
          },
        },
        {
          name: 'subheading',
          type: 'text',
          label: 'Subheading (optional)',
          admin: {
            description: 'Smaller text below the heading',
          },
        },
      ],
    },
  ],
}

export default Homepage
