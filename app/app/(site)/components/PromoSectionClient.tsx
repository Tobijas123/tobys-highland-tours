'use client'

import { useState, useEffect } from 'react'

interface BackgroundImage {
  url: string
  focus?: string
}

interface PromoSectionProps {
  enabled: boolean
  heightPx?: number
  backgroundImages?: BackgroundImage[]
  overlayOpacity?: number
  heading?: string
  headingEffect?: 'none' | 'shadow' | 'glow' | 'outline'
  content?: unknown // Lexical JSON
  ctaLabel?: string
  ctaHref?: string
}

// Simple text extractor from Lexical JSON
function extractTextFromLexical(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as Record<string, unknown>

  if (n.text && typeof n.text === 'string') {
    return n.text
  }

  if (n.children && Array.isArray(n.children)) {
    return n.children.map(extractTextFromLexical).join('')
  }

  if (n.root && typeof n.root === 'object') {
    return extractTextFromLexical(n.root)
  }

  return ''
}

function getHeadingStyle(effect: string): React.CSSProperties {
  switch (effect) {
    case 'glow':
      return { textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.5), 0 4px 20px rgba(0,0,0,0.4)' }
    case 'outline':
      return { textShadow: '-1px -1px 0 rgba(0,0,0,0.7), 1px -1px 0 rgba(0,0,0,0.7), -1px 1px 0 rgba(0,0,0,0.7), 1px 1px 0 rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.5)' }
    case 'shadow':
    default:
      return { textShadow: '0 4px 20px rgba(0,0,0,0.4)' }
  }
}

export default function PromoSectionClient({
  enabled,
  heightPx = 260,
  backgroundImages = [],
  overlayOpacity = 0.35,
  heading,
  headingEffect = 'shadow',
  content,
  ctaLabel,
  ctaHref,
}: PromoSectionProps) {
  const [currentBg, setCurrentBg] = useState(0)

  // Clamp height for safety
  const height = Math.min(700, Math.max(180, heightPx))

  // Rotate background images
  useEffect(() => {
    if (backgroundImages.length <= 1) return
    const timer = setInterval(() => {
      setCurrentBg((c) => (c + 1) % backgroundImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [backgroundImages.length])

  if (!enabled) return null

  const currentImage = backgroundImages[currentBg]
  const bgUrl = currentImage?.url || ''
  const bgFocus = currentImage?.focus || 'center'
  const contentText = content ? extractTextFromLexical(content) : ''
  const showCta = ctaLabel && ctaHref

  return (
    <section
      style={{
        position: 'relative',
        height,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
          backgroundColor: bgUrl ? undefined : 'var(--navy)',
          backgroundSize: 'cover',
          backgroundPosition: bgFocus,
          transition: 'background-image 600ms ease',
        }}
      />

      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(7,26,52,${Math.min(0.7, Math.max(0, overlayOpacity))})`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          color: '#fff',
          padding: 24,
          maxWidth: 800,
        }}
      >
        {heading && (
          <h2
            style={{
              fontSize: 32,
              fontWeight: 900,
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
              ...getHeadingStyle(headingEffect || 'shadow'),
            }}
          >
            {heading}
          </h2>
        )}

        {contentText && (
          <p
            style={{
              fontSize: 16,
              fontWeight: 500,
              margin: showCta ? '0 0 20px' : 0,
              opacity: 0.92,
              lineHeight: 1.5,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            {contentText}
          </p>
        )}

        {showCta && (
          <a
            href={ctaHref}
            className="btn btnPrimary"
            style={{ padding: '12px 24px', fontSize: 14 }}
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </section>
  )
}
