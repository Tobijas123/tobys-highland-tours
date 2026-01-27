import { getPayload } from 'payload'
import config from '../payload.config'

async function migrate() {
  console.log('Migrating tours i18n fields (EN → ES)...')

  const payload = await getPayload({ config })

  // Fetch all tours with high limit
  const { docs: tours } = await payload.find({
    collection: 'tours',
    limit: 1000,
    depth: 0,
  })

  console.log(`Found ${tours.length} tours`)

  let updated = 0

  for (const tour of tours) {
    const i18n = (tour.i18n as Record<string, unknown>) || {}
    const updates: Record<string, unknown> = {}

    // Check title_es
    if (!i18n.title_es) {
      const value = i18n.title_en || tour.title
      if (value) updates.title_es = value
    }

    // Check shortDescription_es
    if (!i18n.shortDescription_es) {
      const value = i18n.shortDescription_en || tour.shortDescription
      if (value) updates.shortDescription_es = value
    }

    // Check longDescription_es (rich text object)
    if (!i18n.longDescription_es) {
      const value = i18n.longDescription_en || tour.longDescription
      if (value) updates.longDescription_es = value
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      try {
        await payload.update({
          collection: 'tours',
          id: tour.id,
          data: {
            i18n: {
              ...i18n,
              ...updates,
            },
          },
        })
        console.log(`Updated: ${tour.title || tour.slug || tour.id}`)
        updated++
      } catch (err) {
        console.error(`Failed to update tour ${tour.id}:`, err)
      }
    } else {
      console.log(`Skipped (no changes): ${tour.title || tour.slug || tour.id}`)
    }
  }

  console.log(`\nDone! Updated ${updated} tours`)
  process.exit(0)
}

migrate()
