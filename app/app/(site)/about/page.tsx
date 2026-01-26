import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const siteUrl = (process.env.SITE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://tobyshighlandtours.com').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "About Toby's Highland Tours | Private Driver in Scotland",
  description: 'Meet your local driver-guide for private Highland tours, transfers and chauffeur services. Friendly, flexible, and focused on a smooth, memorable trip.',
  openGraph: {
    title: "About Toby's Highland Tours | Private Driver in Scotland",
    description: 'Meet your local driver-guide for private Highland tours, transfers and chauffeur services. Friendly, flexible, and focused on a smooth, memorable trip.',
    url: '/about',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: "Toby's Highland Tours - Private tours & transfers from Inverness" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "About Toby's Highland Tours | Private Driver in Scotland",
    description: 'Meet your local driver-guide for private Highland tours, transfers and chauffeur services. Friendly, flexible, and focused on a smooth, memorable trip.',
    images: [{ url: '/twitter-image', width: 1200, height: 630, alt: "Toby's Highland Tours - Private tours & transfers from Inverness" }],
  },
}

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section style={{ marginBottom: 48 }}>
        <div
          className="card"
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(7,26,52,0.03), rgba(255,255,255,0.95))',
          }}
        >
          <h1
            style={{
              fontSize: 42,
              fontWeight: 950,
              letterSpacing: '-0.02em',
              margin: '0 0 16px',
              color: 'var(--navy)',
            }}
          >
            About Toby's Highland Tours
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: 'var(--muted)',
              maxWidth: 600,
              margin: '0 auto 32px',
            }}
          >
            We offer authentic, private tours through the Scottish Highlands.
            No crowds, no rush — just you, your guide, and the open road.
          </p>

          {/* 3 Bullet Points */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 16,
              maxWidth: 700,
              margin: '0 auto',
            }}
          >
            <div className="aboutBullet">
              <div className="aboutBulletIcon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="aboutBulletText">Private tours</div>
            </div>

            <div className="aboutBullet">
              <div className="aboutBulletIcon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="aboutBulletText">Door-to-door pickup</div>
            </div>

            <div className="aboutBullet">
              <div className="aboutBulletIcon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="aboutBulletText">Flexible stops</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Book With Us */}
      <section style={{ marginBottom: 48 }}>
        <h2 className="sectionTitle" style={{ marginBottom: 24, textAlign: 'center' }}>
          Why book with us
        </h2>

        <div className="whyGrid">
          <div className="whyTile">
            <div className="whyIcon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h3 className="whyTitle">Small groups</h3>
            <p className="whyDesc">
              Maximum 7 passengers per tour. Personal attention guaranteed.
            </p>
          </div>

          <div className="whyTile">
            <div className="whyIcon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="10" r="3" />
                <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
              </svg>
            </div>
            <h3 className="whyTitle">Local knowledge</h3>
            <p className="whyDesc">
              Your guide knows every hidden gem and local story worth sharing.
            </p>
          </div>

          <div className="whyTile">
            <div className="whyIcon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <h3 className="whyTitle">Photo stops</h3>
            <p className="whyDesc">
              We stop whenever you see something worth capturing. Your pace, your photos.
            </p>
          </div>

          <div className="whyTile">
            <div className="whyIcon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="whyTitle">Stress-free logistics</h3>
            <p className="whyDesc">
              We handle everything — pickup, route, stops. You just enjoy the journey.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div
          className="card"
          style={{
            padding: '40px 32px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(39,85,72,0.06), rgba(255,255,255,0.95))',
          }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 950,
              margin: '0 0 12px',
              color: 'var(--navy)',
            }}
          >
            Ready to explore the Highlands?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'var(--muted)',
              margin: '0 0 24px',
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Browse our tours or get in touch — we're happy to help plan your perfect trip.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <a
              href="/tours"
              className="btn btnPrimary"
              style={{ width: 'auto', padding: '14px 32px' }}
            >
              View tours
            </a>
            <a
              href="/#contact"
              className="btn btnSecondary"
              style={{ width: 'auto', padding: '14px 32px' }}
            >
              Contact us
            </a>
          </div>
        </div>
      </section>

      <style>{`
        .aboutBullet {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: rgba(39,85,72,0.06);
          border: 1px solid rgba(39,85,72,0.18);
          border-radius: 12px;
        }
        .aboutBulletIcon {
          color: var(--moss);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .aboutBulletText {
          font-size: 14px;
          font-weight: 700;
          color: var(--navy);
        }

        .whyGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .whyGrid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 540px) {
          .whyGrid { grid-template-columns: 1fr; }
        }

        .whyTile {
          background: linear-gradient(180deg, rgba(255,255,255,.99), rgba(255,255,255,.94));
          border: 1px solid rgba(11,31,58,.16);
          border-radius: 16px;
          padding: 24px 20px;
          text-align: center;
          transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
        }
        .whyTile:hover {
          transform: translateY(-4px);
          border-color: rgba(39,85,72,.32);
          box-shadow: 0 16px 48px rgba(11,31,58,.12);
        }

        .whyIcon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(39,85,72,0.12), rgba(39,85,72,0.06));
          color: var(--moss);
          margin-bottom: 14px;
        }

        .whyTitle {
          font-size: 16px;
          font-weight: 800;
          margin: 0 0 8px;
          color: var(--navy);
        }

        .whyDesc {
          font-size: 13px;
          line-height: 1.5;
          color: var(--muted);
          margin: 0;
        }

        @media (max-width: 640px) {
          .aboutBullet {
            flex: 1 1 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}
