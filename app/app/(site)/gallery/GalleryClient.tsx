'use client'

import { useState, useEffect, useCallback } from 'react'

type GalleryImage = {
  url: string
  alt: string | null
  caption: string | null
}

type GallerySection = {
  id: string | number
  title: string
  images: GalleryImage[]
}

type Props = {
  sections: GallerySection[]
}

export default function GalleryClient({ sections }: Props) {
  const [lightbox, setLightbox] = useState<{
    sectionIndex: number
    imageIndex: number
  } | null>(null)

  const currentSection = lightbox !== null ? sections[lightbox.sectionIndex] : null
  const currentImage = currentSection && lightbox !== null ? currentSection.images[lightbox.imageIndex] : null

  const openLightbox = (sectionIndex: number, imageIndex: number) => {
    setLightbox({ sectionIndex, imageIndex })
  }

  const closeLightbox = useCallback(() => {
    setLightbox(null)
  }, [])

  const goToPrev = useCallback(() => {
    if (!lightbox || !currentSection) return
    const newIndex = lightbox.imageIndex > 0
      ? lightbox.imageIndex - 1
      : currentSection.images.length - 1
    setLightbox({ ...lightbox, imageIndex: newIndex })
  }, [lightbox, currentSection])

  const goToNext = useCallback(() => {
    if (!lightbox || !currentSection) return
    const newIndex = lightbox.imageIndex < currentSection.images.length - 1
      ? lightbox.imageIndex + 1
      : 0
    setLightbox({ ...lightbox, imageIndex: newIndex })
  }, [lightbox, currentSection])

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightbox, closeLightbox, goToPrev, goToNext])

  if (sections.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>No gallery sections yet.</p>
      </div>
    )
  }

  return (
    <>
      {sections.map((section, sectionIndex) => (
        <section key={section.id} style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: 'var(--navy)',
              marginBottom: 20,
              paddingBottom: 12,
              borderBottom: '2px solid rgba(39,85,72,0.15)',
            }}
          >
            {section.title}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {section.images.map((img, imageIndex) => (
              <div
                key={imageIndex}
                onClick={() => openLightbox(sectionIndex, imageIndex)}
                style={{
                  cursor: 'pointer',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#f5f5f5',
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                }}
                className="galleryThumbnail"
              >
                <img
                  src={img.url}
                  alt={img.alt || section.title}
                  style={{
                    width: '100%',
                    height: 220,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {img.caption && (
                  <div
                    style={{
                      padding: '10px 14px',
                      fontSize: 13,
                      color: 'var(--navy)',
                      background: 'rgba(255,255,255,0.95)',
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Lightbox */}
      {lightbox !== null && currentImage && currentSection && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: 8,
              width: 44,
              height: 44,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24,
              transition: 'background 150ms',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Previous button */}
          {currentSection.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPrev()
              }}
              style={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: 8,
                width: 48,
                height: 48,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 28,
                transition: 'background 150ms',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              aria-label="Previous image"
            >
              ←
            </button>
          )}

          {/* Next button */}
          {currentSection.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              style={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: 8,
                width: 48,
                height: 48,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 28,
                transition: 'background 150ms',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              aria-label="Next image"
            >
              →
            </button>
          )}

          {/* Image container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              src={currentImage.url}
              alt={currentImage.alt || currentSection.title}
              style={{
                maxWidth: '100%',
                maxHeight: currentImage.caption ? '75vh' : '85vh',
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />
            {currentImage.caption && (
              <div
                style={{
                  marginTop: 16,
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 15,
                  textAlign: 'center',
                  maxWidth: 600,
                }}
              >
                {currentImage.caption}
              </div>
            )}
            {/* Image counter */}
            <div
              style={{
                marginTop: 12,
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13,
              }}
            >
              {lightbox.imageIndex + 1} / {currentSection.images.length}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .galleryThumbnail:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }
      `}</style>
    </>
  )
}
