import BookingSidebarClient from '../../components/BookingSidebarClient'

export const dynamic = 'force-dynamic'

function toPublicURL(url: string) {
  const base = process.env.PAYLOAD_PUBLIC_SERVER_URL
  if (!base) return url
  return url.replace(/^http:\/\/localhost:3000/, base)
}

function lexicalToPlainText(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') return value

  const out: string[] = []

  const walk = (node: any) => {
    if (!node) return
    if (Array.isArray(node)) return node.forEach(walk)

    if (node.type === 'text' && typeof node.text === 'string') {
      out.push(node.text)
      return
    }

    if (node.type === 'paragraph' || node.type === 'heading') {
      if (node.children) walk(node.children)
      out.push('\n\n')
      return
    }

    if (node.children) walk(node.children)
  }

  if (value?.root?.children) walk(value.root.children)
  else walk(value)

  return out.join('').replace(/\n{3,}/g, '\n\n').trim()
}

type MediaDoc = {
  url?: string
  alt?: string | null
}

type Transfer = {
  id: string | number
  title?: string
  slug?: string
  longDescription?: any
  heroImage?: MediaDoc | null
  price1to3?: number
  price4to7?: number
  durationText?: string
  fromLocation?: string
  toLocation?: string
  highlights?: { text: string }[]
}

async function getTransferBySlug(slug: string): Promise<Transfer | null> {
  const url = `http://127.0.0.1:3000/api/transfers?where[slug][equals]=${encodeURIComponent(
    slug,
  )}&limit=1&depth=2`

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null

  const data = await res.json()
  const transfer: Transfer | undefined = data?.docs?.[0]
  return transfer ?? null
}

export default async function TransferPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const transfer = await getTransferBySlug(slug)

  if (!transfer) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Transfer not found</h1>
        <p style={{ marginTop: 12 }}>
          <a href="/transfers" style={{ textDecoration: 'underline' }}>
            ← Back to Transfers
          </a>
        </p>
      </main>
    )
  }

  const imgUrl = typeof transfer.heroImage?.url === 'string' ? toPublicURL(transfer.heroImage.url) : null
  const longText = lexicalToPlainText(transfer.longDescription)
  const routeInfo = transfer.fromLocation && transfer.toLocation
    ? `${transfer.fromLocation} → ${transfer.toLocation}`
    : null

  return (
    <main style={{ padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          <p style={{ marginBottom: 16 }}>
            <a href="/transfers" style={{ textDecoration: 'underline' }}>
              ← Back to Transfers
            </a>
          </p>

          <h1 className="titlePremium" style={{ fontSize: 38, marginBottom: 8 }}>{transfer.title}</h1>
          {routeInfo && (
            <div className="muted" style={{ fontSize: 15, marginBottom: 20 }}>
              {routeInfo}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4 md:gap-6">
          {/* LEFT: image + description */}
          <div className="card" style={{ padding: 0 }}>
            <div
              className="tourMedia"
              style={{
                width: '100%',
                aspectRatio: '16/9',
                background: 'rgba(11,31,58,.04)',
              }}
            >
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={transfer.heroImage?.alt || transfer.title || 'Transfer image'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, opacity: 0.5 }}>
                  No image
                </div>
              )}
            </div>

            <div style={{ padding: 20 }}>
              <div className="prose" style={{ fontSize: 15 }}>
                {longText ? (
                  <p style={{ whiteSpace: 'pre-wrap' }}>{longText}</p>
                ) : (
                  <p className="muted">No description yet.</p>
                )}
              </div>

              {transfer.highlights && transfer.highlights.length > 0 ? (
                <div style={{ marginTop: 20 }}>
                  <h2 className="titlePremium" style={{ fontSize: 16, marginBottom: 10 }}>Included</h2>
                  <ul className="prose" style={{ display: 'grid', gap: 6 }}>
                    {transfer.highlights.map((h, idx) => (
                      <li key={idx}>{h.text}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          {/* RIGHT: booking sidebar */}
          <aside
            className="card w-full max-w-full overflow-x-hidden md:sticky md:top-[18px]"
            style={{
              padding: 18,
              boxSizing: 'border-box',
              height: 'fit-content',
            }}
          >
            <BookingSidebarClient
              itemType="transfer"
              itemId={typeof transfer.id === 'number' ? transfer.id : Number(transfer.id)}
              itemTitle={transfer.title ?? 'Transfer'}
              price1to3={typeof transfer.price1to3 === 'number' ? transfer.price1to3 : null}
              price4to7={typeof transfer.price4to7 === 'number' ? transfer.price4to7 : null}
              durationText={transfer.durationText ?? '—'}
            />
          </aside>
          </div>
        </div>
      </div>
    </main>
  )
}
