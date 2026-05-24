'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type MediaDoc = {
  url?: string
  alt?: string | null
}

interface AboutDriverProps {
  content: SerializedEditorState | null | undefined
  photo?: MediaDoc | null
  title?: string
}

export default function AboutDriver({ content, photo, title = 'About Your Driver' }: AboutDriverProps) {
  if (!content) return null

  const hasValidContent = content && typeof content === 'object' && 'root' in content

  if (!hasValidContent) return null

  return (
    <div style={{ marginTop: 32 }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 800,
          marginBottom: 16,
          color: 'var(--navy)',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {photo?.url && (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '3px solid var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <img
              src={photo.url}
              alt={photo.alt || 'Your driver'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}
        <div
          className="prose"
          style={{
            flex: 1,
            minWidth: 240,
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          <RichText data={content} />
        </div>
      </div>
    </div>
  )
}
