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

const DEFAULT_HEADING = 'Private Highland tours from Inverness'
const DEFAULT_SUBHEADING = 'Door-to-door pickup • Your pace • Small groups'

const FALLBACK_SLIDES: Slide[] = [
  {
    image: '/media/hero-1.jpg',
    heading: DEFAULT_HEADING,
    subheading: DEFAULT_SUBHEADING,
  },
  {
    image: '/media/hero-2.jpg',
    heading: DEFAULT_HEADING,
    subheading: DEFAULT_SUBHEADING,
  },
  {
    image: '/media/hero-3.jpg',
    heading: DEFAULT_HEADING,
    subheading: DEFAULT_SUBHEADING,
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
          <h1 className="heroTitle" style={{ maxWidth: 700, lineHeight: 1.15 }}>
            {slide.heading || DEFAULT_HEADING}
            <span style={{ display: 'block', fontSize: '0.6em', fontWeight: 600, marginTop: 8, opacity: 0.9 }}>
              — flexible stops, local stories, no crowds.
            </span>
          </h1>
          <p className="heroSubtitle" style={{ maxWidth: 500 }}>
            {slide.subheading || DEFAULT_SUBHEADING}
          </p>

          <div className="heroTrust">
            <a href="#" className="heroTrustReviews">
              <span className="heroStars">★★★★★</span>
              <span>5.0 Google Reviews</span>
            </a>
            <div className="heroTrustChips">
              <span className="heroChip">Local guide</span>
              <span className="heroChip">Private tours</span>
              <span className="heroChip">Flexible stops</span>
              <span className="heroChip">1–7 people</span>
            </div>
          </div>

          <div className="heroCtaRow">
            <a href="/tours" className="btn btnPrimary heroBtn heroCta">
              Check availability
            </a>
            <a
              href="https://wa.me/447383488007"
              target="_blank"
              rel="noreferrer"
              className="btn btnWhatsApp heroBtn heroWhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp us
            </a>
          </div>
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
