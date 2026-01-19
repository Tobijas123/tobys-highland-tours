'use client'
import { useState, useEffect, useCallback } from 'react'

interface Slide {
  image: string
  title: string
  subtitle: string
}

const SLIDES: Slide[] = [
  {
    image: '/media/hero-1.jpg',
    title: 'Explore the Scottish Highlands',
    subtitle: 'Unforgettable tours through ancient landscapes',
  },
  {
    image: '/media/hero-2.jpg',
    title: 'Discover Hidden Gems',
    subtitle: 'Castles, lochs, and breathtaking scenery',
  },
  {
    image: '/media/hero-3.jpg',
    title: 'Premium Transfer Services',
    subtitle: 'Comfortable journeys across Scotland',
  },
]

export default function HeroSliderClient() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const slide = SLIDES[current]

  return (
    <div className="heroSlider">
      <div
        className="heroSlide"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(7,26,52,0.3) 0%, rgba(7,26,52,0.6) 100%), url(${slide.image})`,
        }}
      >
        <div className="heroContent">
          <h1 className="heroTitle">{slide.title}</h1>
          <p className="heroSubtitle">{slide.subtitle}</p>
          <a href="/products" className="btn btnPrimary heroBtn">
            Explore Our Offerings
          </a>
        </div>
      </div>

      <button className="heroArrow heroArrowLeft" onClick={prev} aria-label="Previous slide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button className="heroArrow heroArrowRight" onClick={next} aria-label="Next slide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>

      <div className="heroDots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`heroDot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
