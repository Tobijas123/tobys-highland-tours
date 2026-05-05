/**
 * Migration script: Convert longDescription from textarea (string) to richText (Lexical JSON)
 *
 * Run with: npm run migrate-longdesc
 */

import { getPayload } from 'payload'
import config from '../payload.config'

// Convert plain text string to Lexical JSON format
function textToLexical(text: string | null | undefined): object | null {
  if (!text || typeof text !== 'string') return null

  // Split by newlines to create paragraphs
  const lines = text.split(/\n+/).filter(line => line.trim())

  if (lines.length === 0) return null

  const children = lines.map(line => ({
    type: 'paragraph',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'text',
        version: 1,
        text: line.trim(),
        format: 0,
        style: '',
        detail: 0,
        mode: 'normal' as const,
      }
    ],
  }))

  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children,
    },
  }
}

// Check if value is already Lexical format
function isLexicalFormat(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    'root' in (value as object)
  )
}

async function migrateTours(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('\n📦 Migrating Tours...')

  const { docs: tours } = await payload.find({
    collection: 'tours',
    limit: 1000,
    depth: 0,
  })

  let migratedCount = 0

  for (const tour of tours) {
    const updates: Record<string, unknown> = {}
    let needsUpdate = false

    // Check main longDescription
    if (tour.longDescription && typeof tour.longDescription === 'string') {
      const lexical = textToLexical(tour.longDescription)
      if (lexical) {
        updates.longDescription = lexical
        needsUpdate = true
        console.log(`  → Tour "${tour.title}": converting longDescription`)
      }
    }

    // Check i18n fields
    const i18n = tour.i18n as Record<string, unknown> | null | undefined
    if (i18n) {
      const i18nUpdates: Record<string, unknown> = {}

      if (i18n.longDescription_en && typeof i18n.longDescription_en === 'string') {
        const lexical = textToLexical(i18n.longDescription_en as string)
        if (lexical) {
          i18nUpdates.longDescription_en = lexical
          needsUpdate = true
          console.log(`  → Tour "${tour.title}": converting longDescription_en`)
        }
      }

      if (i18n.longDescription_es && typeof i18n.longDescription_es === 'string') {
        const lexical = textToLexical(i18n.longDescription_es as string)
        if (lexical) {
          i18nUpdates.longDescription_es = lexical
          needsUpdate = true
          console.log(`  → Tour "${tour.title}": converting longDescription_es`)
        }
      }

      if (Object.keys(i18nUpdates).length > 0) {
        updates.i18n = { ...i18n, ...i18nUpdates }
      }
    }

    if (needsUpdate) {
      await payload.update({
        collection: 'tours',
        id: tour.id,
        data: updates,
      })
      migratedCount++
    }
  }

  console.log(`✅ Tours: ${migratedCount}/${tours.length} migrated`)
  return migratedCount
}

async function migrateTransfers(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('\n📦 Migrating Transfers...')

  const { docs: transfers } = await payload.find({
    collection: 'transfers',
    limit: 1000,
    depth: 0,
  })

  let migratedCount = 0

  for (const transfer of transfers) {
    if (transfer.longDescription && typeof transfer.longDescription === 'string') {
      const lexical = textToLexical(transfer.longDescription)
      if (lexical) {
        console.log(`  → Transfer "${transfer.title}": converting longDescription`)

        await payload.update({
          collection: 'transfers',
          id: transfer.id,
          data: {
            longDescription: lexical,
          },
        })
        migratedCount++
      }
    }
  }

  console.log(`✅ Transfers: ${migratedCount}/${transfers.length} migrated`)
  return migratedCount
}

async function main() {
  console.log('🚀 Starting longDescription migration to Lexical format...')
  console.log('─'.repeat(50))

  const payload = await getPayload({ config })

  try {
    const toursMigrated = await migrateTours(payload)
    const transfersMigrated = await migrateTransfers(payload)

    console.log('\n' + '─'.repeat(50))
    console.log(`🎉 Migration complete!`)
    console.log(`   Tours migrated: ${toursMigrated}`)
    console.log(`   Transfers migrated: ${transfersMigrated}`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

main()
