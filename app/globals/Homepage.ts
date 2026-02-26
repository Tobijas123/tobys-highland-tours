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
    {
      name: 'promoSection',
      type: 'group',
      label: 'Promo Section (between Hero and Tours)',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false, label: 'Enable promo section' },
        {
          name: 'heightPx',
          type: 'number',
          label: 'Height (px)',
          defaultValue: 260,
          admin: { description: 'Recommended 220–520' },
        },
        {
          name: 'backgroundImages',
          type: 'array',
          label: 'Background Images',
          minRows: 0,
          maxRows: 6,
          labels: { singular: 'Image', plural: 'Images' },
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Image' },
            {
              name: 'focus',
              type: 'select',
              label: 'Image focus',
              defaultValue: 'center',
              options: [
                { label: 'Center', value: 'center' },
                { label: 'Top', value: 'top' },
                { label: 'Bottom', value: 'bottom' },
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
                { label: 'Top Left', value: 'top left' },
                { label: 'Top Right', value: 'top right' },
                { label: 'Bottom Left', value: 'bottom left' },
                { label: 'Bottom Right', value: 'bottom right' },
              ],
            },
          ],
        },
        {
          name: 'overlayOpacity',
          type: 'number',
          label: 'Overlay opacity (0–0.7)',
          defaultValue: 0.35,
        },
        { name: 'heading', type: 'text', label: 'Heading' },
        {
          name: 'headingEffect',
          type: 'select',
          label: 'Heading effect',
          defaultValue: 'shadow',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Shadow', value: 'shadow' },
            { label: 'Glow', value: 'glow' },
            { label: 'Outline', value: 'outline' },
          ],
        },
        { name: 'content', type: 'textarea', label: 'Content' },
        { name: 'ctaLabel', type: 'text', label: 'CTA label (optional)' },
        { name: 'ctaHref', type: 'text', label: 'CTA link (optional, e.g. /products or https://...)' },
      ],
    },
    {
      name: 'footerLogo',
      type: 'upload',
      relationTo: 'media',
      label: 'Footer logo',
      admin: {
        description: 'Transparent PNG recommended.',
      },
    },
  ],
}

export default Homepage
