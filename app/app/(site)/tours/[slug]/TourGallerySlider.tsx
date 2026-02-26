'use client'

import { useState, useCallback } from 'react'

type Slide = {
  url: string
  alt: string
}

export default function TourGallerySlider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() =>
    setCurrent(i => (i === 0 ? slides.length - 1 : i - 1)), [slides.length])

  const next = useCallback(() =>
    setCurrent(i => (i === slides.length - 1 ? 0 : i + 1)), [slides.length])

  if (slides.length === 0) return null

  const showControls = slides.length > 1

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'rgba(11,31,58,.04)' }}>
      {/* slides */}
      <div
        style={{
          display: 'flex',
          width: `${slides.length * 100}%`,
          height: '100%',
          transform: `translateX(-${(current * 100) / slides.length}%)`,
          transition: 'transform 400ms cubic-bezier(.4,0,.2,1)',
        }}
      >
        {slides.map((slide, idx) => (
          <div key={idx} style={{ width: `${100 / slides.length}%`, flexShrink: 0, height: '100%' }}>
            <img
              src={slide.url}
              alt={slide.alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
      </div>

      {/* arrows */}
      {showControls && (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            style={{
              position: 'absolute', top: '50%', left: 10,
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,.85)', border: 'none', borderRadius: '50%',
              width: 38, height: 38, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 1px 6px rgba(0,0,0,.18)',
              transition: 'background 160ms',
            }}
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            style={{
              position: 'absolute', top: '50%', right: 10,
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,.85)', border: 'none', borderRadius: '50%',
              width: 38, height: 38, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 1px 6px rgba(0,0,0,.18)',
              transition: 'background 160ms',
            }}
          >
            ›
          </button>
        </>
      )}

      {/* dots */}
      {showControls && (
        <div
          style={{
            position: 'absolute', bottom: 10, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 7,
          }}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to image ${idx + 1}`}
              style={{
                width: idx === current ? 22 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: idx === current ? '#fff' : 'rgba(255,255,255,.55)',
                transition: 'width 250ms, background 250ms',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
