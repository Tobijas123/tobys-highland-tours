'use client'

import { useState, useEffect } from 'react'

interface Testimonial {
  id: string
  authorName: string
  text: string
  rating: number
  source: 'facebook' | 'google' | 'manual'
  sourceUrl?: string
  featured?: boolean
}

interface ReviewsRotatorProps {
  testimonials: Testimonial[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: star <= rating ? '#fbbf24' : '#d1d5db',
            fontSize: 16,
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function SourceBadge({ source }: { source: string }) {
  if (source === 'facebook') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 10,
          fontWeight: 600,
          color: '#1877f2',
          background: 'rgba(24,119,242,0.1)',
          padding: '3px 8px',
          borderRadius: 10,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </span>
    )
  }
  if (source === 'google') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 10,
          fontWeight: 600,
          color: '#ea4335',
          background: 'rgba(234,67,53,0.1)',
          padding: '3px 8px',
          borderRadius: 10,
        }}
      >
        Google
      </span>
    )
  }
  return null
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div
      style={{
        height: '100%',
        padding: 16,
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <StarRating rating={testimonial.rating} />
        <SourceBadge source={testimonial.source} />
      </div>

      <p
        style={{
          fontSize: 13,
          lineHeight: 1.5,
          color: '#374151',
          margin: '0 0 12px',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        "{testimonial.text}"
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
          — {testimonial.authorName}
        </span>
        {testimonial.sourceUrl && (
          <a
            href={testimonial.sourceUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 11,
              color: '#1877f2',
              textDecoration: 'none',
            }}
          >
            View on {testimonial.source === 'google' ? 'Google' : 'Facebook'}
          </a>
        )}
      </div>
    </div>
  )
}

export default function ReviewsRotatorClient({ testimonials }: ReviewsRotatorProps) {
  const [pairIndex, setPairIndex] = useState(0)
  const [fade, setFade] = useState(true)

  // Filter: if any featured exist, use only those; otherwise use all
  const featuredOnly = testimonials.filter((t) => t.featured === true)
  const filtered = featuredOnly.length > 0 ? featuredOnly : testimonials

  // Create pairs of testimonials
  const pairs: Testimonial[][] = []
  for (let i = 0; i < filtered.length; i += 2) {
    const pair = filtered.slice(i, i + 2)
    if (pair.length > 0) pairs.push(pair)
  }

  const shouldAnimate = pairs.length > 1

  useEffect(() => {
    if (!shouldAnimate) return

    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setPairIndex((prev) => (prev + 1) % pairs.length)
        setFade(true)
      }, 300)
    }, 7000)

    return () => clearInterval(interval)
  }, [pairs.length, shouldAnimate])

  if (filtered.length === 0) return null

  const currentPair = pairs[pairIndex] || pairs[0]

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        opacity: fade ? 1 : 0,
        transition: 'opacity 300ms ease',
      }}
    >
      {currentPair.map((t) => (
        <div key={t.id} style={{ flex: '1 1 280px', minWidth: 0, maxWidth: '100%' }}>
          <TestimonialCard testimonial={t} />
        </div>
      ))}
    </div>
  )
}
