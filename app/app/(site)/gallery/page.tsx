import type { Metadata } from 'next'
import GalleryClient from './GalleryClient'

export const dynamic = 'force-dynamic'

const siteUrl = (process.env.SITE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://tobyshighlandtours.com').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Gallery | Scottish Highlands Photos',
  description: 'Browse photos from our Highland tours — Isle of Skye, Loch Ness, Glencoe, and more. See the stunning landscapes you can explore with us.',
  openGraph: {
    title: 'Gallery | Scottish Highlands Photos',
    description: 'Browse photos from our Highland tours — Isle of Skye, Loch Ness, Glencoe, and more.',
    url: '/gallery',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: "Toby's Highland Tours - Gallery" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery | Scottish Highlands Photos',
    description: 'Browse photos from our Highland tours — Isle of Skye, Loch Ness, Glencoe, and more.',
    images: [{ url: '/twitter-image', width: 1200, height: 630, alt: "Toby's Highland Tours - Gallery" }],
  },
}

type MediaDoc = {
  url?: string
  alt?: string | null
  sizes?: {
    thumbnail?: { url?: string }
    card?: { url?: string }
    hero?: { url?: string }
  }
}

type GalleryImageRaw = {
  image?: MediaDoc | string | null
  caption?: string | null
}

type GalleryDoc = {
  id: string | number
  title: string
  sortOrder?: number
  isActive?: boolean
  images?: GalleryImageRaw[]
}

function toPublicURL(url: string) {
  const base = process.env.PAYLOAD_PUBLIC_SERVER_URL
  if (!base) return url
  return url.replace(/^http:\/\/localhost:3000/, base)
}

async function getGallerySections(): Promise<GalleryDoc[]> {
  const res = await fetch(
    `${process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/api/gallery?where[isActive][equals]=true&sort=sortOrder&depth=2&limit=100`,
    { cache: 'no-store' }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data?.docs ?? []) as GalleryDoc[]
}

export default async function GalleryPage() {
  const gallerySections = await getGallerySections()

  // Transform data for client component
  const sectionsForClient = gallerySections.map((section) => ({
    id: section.id,
    title: section.title,
    images: (section.images ?? [])
      .filter((item): item is GalleryImageRaw & { image: MediaDoc } => {
        return item.image !== null && typeof item.image === 'object' && 'url' in item.image
      })
      .map((item) => {
        const media = item.image as MediaDoc
        const url = media.sizes?.hero?.url || media.sizes?.card?.url || media.url || ''
        return {
          url: toPublicURL(url),
          alt: media.alt ?? null,
          caption: item.caption ?? null,
        }
      }),
  }))

  return (
    <main style={{ padding: '28px 24px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div
          className="card"
          style={{
            padding: '40px 32px',
            textAlign: 'center',
            marginBottom: 32,
            background: 'linear-gradient(180deg, rgba(7,26,52,0.03), rgba(255,255,255,0.95))',
          }}
        >
          <h1
            style={{
              fontSize: 42,
              fontWeight: 950,
              letterSpacing: '-0.02em',
              margin: '0 0 12px',
              color: 'var(--navy)',
            }}
          >
            Gallery
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: 'var(--muted)',
              maxWidth: 550,
              margin: '0 auto',
            }}
          >
            Photos from our Highland adventures — the landscapes, the light, the moments that make Scotland unforgettable.
          </p>
        </div>

        {/* Gallery sections */}
        <GalleryClient sections={sectionsForClient} />
      </div>
    </main>
  )
}
