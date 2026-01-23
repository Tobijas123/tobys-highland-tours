import { getPayload } from 'payload'
import config from '../payload.config'

const testimonials = [
  {
    seedKey: 'marion-french-family',
    authorName: 'Marion',
    text: 'super driver! he saved our holidays! Very professional, nice and available! thank you! Marion, the French girl with her family! 😁',
    rating: 5,
    source: 'facebook' as const,
    featured: true,
    order: 1,
  },
  {
    seedKey: 'guest-cawdor-castle',
    authorName: 'Guest',
    text: 'Had a wonderful day exploring Cawdor Castle, Cairns and Tomatin Distillery. Thanks Tony for a wonderful afternoon. Excellent all around.',
    rating: 5,
    source: 'facebook' as const,
    featured: true,
    order: 2,
  },
  {
    seedKey: 'guest-fully-recommend',
    authorName: 'Guest',
    text: "Fully recommend Toby's Highland Tours excellent service",
    rating: 5,
    source: 'facebook' as const,
    featured: true,
    order: 3,
  },
  {
    seedKey: 'guest-5-star-luxury',
    authorName: 'Guest',
    text: '5 star luxury service, efficient, polite, highly recommended',
    rating: 5,
    source: 'facebook' as const,
    featured: true,
    order: 4,
  },
]

async function seed() {
  console.log('Seeding testimonials...')

  const payload = await getPayload({ config })

  let created = 0
  let skipped = 0

  for (const t of testimonials) {
    try {
      // Check if testimonial with this seedKey already exists
      const existing = await payload.find({
        collection: 'testimonials',
        where: { seedKey: { equals: t.seedKey } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        console.log(`Skipped (exists): ${t.seedKey}`)
        skipped++
        continue
      }

      await payload.create({
        collection: 'testimonials',
        data: t,
      })
      console.log(`Created: ${t.seedKey}`)
      created++
    } catch (err) {
      console.error(`Failed: ${t.seedKey}`, err)
    }
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`)
  process.exit(0)
}

seed()
