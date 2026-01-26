import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = "Toby's Highland Tours - Private tours & transfers from Inverness"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #071a34 0%, #0b1f3a 25%, #1a3a5c 50%, #275548 75%, #1e4038 100%)',
          position: 'relative',
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(39,85,72,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(11,31,58,0.4) 0%, transparent 50%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          {/* Main title */}
          <h1
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              marginBottom: 16,
              textAlign: 'center',
              textShadow: '0 4px 24px rgba(0,0,0,0.4)',
              letterSpacing: '-0.02em',
            }}
          >
            Toby&apos;s Highland Tours
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
              textAlign: 'center',
              letterSpacing: '0.05em',
            }}
          >
            Private tours &bull; Transfers &bull; Inverness
          </p>

          {/* Decorative line */}
          <div
            style={{
              width: 120,
              height: 4,
              background: 'linear-gradient(90deg, transparent, #c9a227, transparent)',
              marginTop: 32,
              borderRadius: 2,
            }}
          />
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #275548, #c9a227, #275548)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
