'use client'
import { useState, useEffect, useCallback } from 'react'

interface Slide {
  image: string
  heading?: string
  subheading?: string
}

interface HeroSliderProps {
  slides?: Slide[]
  logoUrl?: string | null
}

const FALLBACK_SLIDES: Slide[] = [
  {
    image: '/media/hero-1.jpg',
    heading: 'Explore the Scottish Highlands',
    subheading: 'Unforgettable tours through ancient landscapes',
  },
  {
    image: '/media/hero-2.jpg',
    heading: 'Discover Hidden Gems',
    subheading: 'Castles, lochs, and breathtaking scenery',
  },
  {
    image: '/media/hero-3.jpg',
    heading: 'Premium Transfer Services',
    subheading: 'Comfortable journeys across Scotland',
  },
]

export default function HeroSliderClient({ slides, logoUrl }: HeroSliderProps) {
  const activeSlides = slides && slides.length > 0 ? slides : FALLBACK_SLIDES
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % activeSlides.length)
  }, [activeSlides.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + activeSlides.length) % activeSlides.length)
  }, [activeSlides.length])

  useEffect(() => {
    if (activeSlides.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, activeSlides.length])

  const slide = activeSlides[current]

  return (
    <div className="heroSlider">
      <div
        className="heroSlide"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(7,26,52,0.3) 0%, rgba(7,26,52,0.6) 100%), url(${slide.image})`,
        }}
      >
        <div className="heroContent">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Toby's Highland Tours"
              className="heroLogo"
            />
          )}
          {slide.heading && <h1 className="heroTitle">{slide.heading}</h1>}
          {slide.subheading && <p className="heroSubtitle">{slide.subheading}</p>}
          <a href="/products" className="btn btnPrimary heroBtn">
            Book Now
          </a>
        </div>
      </div>

      {activeSlides.length > 1 && (
        <>
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
            {activeSlides.map((_, i) => (
              <button
                key={i}
                className={`heroDot ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
