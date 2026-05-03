import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const MEDIA_DIR = path.join(process.cwd(), 'media')

const SIZES = {
  hero: { width: 1920, quality: 78 },
  card: { width: 800, quality: 78 },
  thumbnail: { width: 400, quality: 75 },
} as const

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.avif']

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getBaseName(filename: string): string {
  const ext = path.extname(filename)
  return path.basename(filename, ext)
}

function isOriginalImage(filename: string): boolean {
  const baseName = getBaseName(filename)
  // Skip if it's already a variant (ends with -hero, -card, -thumbnail)
  if (baseName.endsWith('-hero') || baseName.endsWith('-card') || baseName.endsWith('-thumbnail')) {
    return false
  }
  const ext = path.extname(filename).toLowerCase()
  return IMAGE_EXTENSIONS.includes(ext)
}

function hasAllVariants(baseName: string): boolean {
  return (
    fs.existsSync(path.join(MEDIA_DIR, `${baseName}-hero.webp`)) &&
    fs.existsSync(path.join(MEDIA_DIR, `${baseName}-card.webp`)) &&
    fs.existsSync(path.join(MEDIA_DIR, `${baseName}-thumbnail.webp`))
  )
}

async function processImage(filename: string, index: number, total: number): Promise<void> {
  const baseName = getBaseName(filename)
  const inputPath = path.join(MEDIA_DIR, filename)

  const originalStats = fs.statSync(inputPath)
  const originalSize = originalStats.size

  // Read image metadata
  const metadata = await sharp(inputPath).metadata()
  const originalWidth = metadata.width || 0
  const originalHeight = metadata.height || 0

  let totalVariantSize = 0

  // Generate variants ONLY - do NOT modify the original file
  for (const [sizeName, config] of Object.entries(SIZES)) {
    const variantPath = path.join(MEDIA_DIR, `${baseName}-${sizeName}.webp`)

    const variantBuffer = await sharp(inputPath)
      .resize({ width: config.width, withoutEnlargement: true })
      .webp({ quality: config.quality })
      .toBuffer()

    fs.writeFileSync(variantPath, variantBuffer)
    totalVariantSize += variantBuffer.length
  }

  const savings = ((1 - totalVariantSize / originalSize) * 100).toFixed(0)

  console.log(
    `Przetwarzam ${index}/${total}: ${filename} → ${originalWidth}×${originalHeight}, warianty: ${formatBytes(totalVariantSize)} (oryginał ${formatBytes(originalSize)}, oszczędność ${savings}%)`
  )
}

async function main(): Promise<void> {
  console.log('Generowanie wariantów obrazków w katalogu media/\n')

  if (!fs.existsSync(MEDIA_DIR)) {
    console.log('Katalog media/ nie istnieje.')
    return
  }

  const files = fs.readdirSync(MEDIA_DIR).filter((f) => {
    const fullPath = path.join(MEDIA_DIR, f)
    return fs.statSync(fullPath).isFile() && isOriginalImage(f)
  })

  if (files.length === 0) {
    console.log('Brak obrazków do przetworzenia.')
    return
  }

  console.log(`Znaleziono ${files.length} obrazków.\n`)

  let processed = 0
  let skipped = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const baseName = getBaseName(file)

    if (hasAllVariants(baseName)) {
      console.log(`Pomijam ${i + 1}/${files.length}: ${file} (już ma warianty)`)
      skipped++
      continue
    }

    try {
      await processImage(file, i + 1, files.length)
      processed++
    } catch (err) {
      console.error(`Błąd przy przetwarzaniu ${file}:`, err)
    }
  }

  console.log(`\nZakończono. Przetworzono: ${processed}, pominięto: ${skipped}`)
}

main().catch(console.error)
