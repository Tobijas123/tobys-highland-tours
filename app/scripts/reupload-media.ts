import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

async function main() {
  const payload = await getPayload({ config })
  
  const { docs } = await payload.find({
    collection: 'media',
    limit: 200,
    depth: 0,
  })

  console.log("Znaleziono " + docs.length + " plikow media do przetworzenia.")

  let processed = 0
  let skipped = 0

  for (const doc of docs) {
    const filename = doc.filename as string | undefined
    if (!filename) {
      console.log("  Pomijam ID " + doc.id + " - brak nazwy pliku")
      skipped++
      continue
    }

    const filePath = path.join(process.cwd(), "media", filename)
    
    if (!fs.existsSync(filePath)) {
      console.log("  Pomijam " + filename + " - plik nie istnieje na dysku")
      skipped++
      continue
    }

    const sizeBefore = fs.statSync(filePath).size
    
    try {
      const fileBuffer = fs.readFileSync(filePath)
      const mimeType = filename.match(/\.png$/i) ? "image/png" 
        : filename.match(/\.gif$/i) ? "image/gif"
        : filename.match(/\.webp$/i) ? "image/webp"
        : "image/jpeg"

      await payload.update({
        collection: "media",
        id: doc.id,
        data: {},
        file: {
          data: fileBuffer,
          mimetype: mimeType,
          name: filename,
          size: fileBuffer.length,
        },
      })

      processed++
      const kb = Math.round(sizeBefore / 1024)
      console.log("  [" + processed + "/" + docs.length + "] " + filename + " (" + kb + " KB) - warianty wygenerowane")
    } catch (err) {
      console.error("  BLAD przy " + filename + ":", (err as Error).message)
      skipped++
    }
  }

  console.log("Gotowe! Przetworzono: " + processed + ", pominieto: " + skipped)
  process.exit(0)
}

main().catch((err) => {
  console.error("Blad:", err)
  process.exit(1)
})
