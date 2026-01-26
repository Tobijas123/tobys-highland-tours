import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawUrl = process.env.SITE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://tobyshighlandtours.com'
  const baseUrl = rawUrl.replace(/\/$/, '')

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tours`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/transfers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Dynamic tour pages
  let tourPages: MetadataRoute.Sitemap = []
  let transferPages: MetadataRoute.Sitemap = []

  try {
    const payload = await getPayload({ config })

    // Fetch active tours
    const tours = await payload.find({
      collection: 'tours',
      where: {
        isActive: { equals: true },
      },
      limit: 100,
      depth: 0,
    })

    tourPages = tours.docs
      .filter((tour) => tour.slug)
      .map((tour) => ({
        url: `${baseUrl}/tours/${tour.slug}`,
        lastModified: new Date(tour.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

    // Fetch active transfers
    const transfers = await payload.find({
      collection: 'transfers',
      where: {
        isActive: { equals: true },
      },
      limit: 100,
      depth: 0,
    })

    transferPages = transfers.docs
      .filter((transfer) => transfer.slug)
      .map((transfer) => ({
        url: `${baseUrl}/transfers/${transfer.slug}`,
        lastModified: new Date(transfer.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
  } catch (error) {
    console.error('[SITEMAP] Error fetching dynamic pages:', error)
  }

  return [...staticPages, ...tourPages, ...transferPages]
}
