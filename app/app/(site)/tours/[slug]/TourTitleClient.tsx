'use client'

import { useLanguage } from '../../lib/LanguageContext'
import { pickI18n, pickI18nRichText } from '../../lib/pickI18n'
import { useT } from '../../lib/translations'

type I18nGroup = {
  [key: string]: string | unknown | undefined
}

// Lexical richText to plain text converter (client-side)
function lexicalToPlainText(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value

  const out: string[] = []

  const walk = (node: unknown) => {
    if (!node) return
    if (Array.isArray(node)) return node.forEach(walk)

    const n = node as { type?: string; text?: string; children?: unknown }

    if (n.type === 'text' && typeof n.text === 'string') {
      out.push(n.text)
      return
    }

    if (n.type === 'paragraph' || n.type === 'heading') {
      if (n.children) walk(n.children)
      out.push('\n\n')
      return
    }

    if (n.children) walk(n.children)
  }

  const v = value as { root?: { children?: unknown } }
  if (v?.root?.children) walk(v.root.children)
  else walk(value)

  return out.join('').replace(/\n{3,}/g, '\n\n').trim()
}

export function TourTitleClient({ tour }: { tour: { title?: string; i18n?: I18nGroup | null } }) {
  const { lang } = useLanguage()
  const title = pickI18n(tour, 'title', lang, tour.title ?? 'Tour')

  return (
    <h1 className="titlePremium" style={{ fontSize: 38, marginBottom: 20 }}>{title}</h1>
  )
}

interface TourDescriptionClientProps {
  tour: {
    title?: string
    shortDescription?: string
    longDescription?: unknown
    i18n?: I18nGroup | null
  }
}

export function TourDescriptionClient({ tour }: TourDescriptionClientProps) {
  const { lang } = useLanguage()
  const t = useT()

  const shortDescription = pickI18n(tour, 'shortDescription', lang, tour.shortDescription ?? '')

  const longDescRaw = pickI18nRichText(tour, 'longDescription', lang) ?? tour.longDescription ?? null
  const longText = lexicalToPlainText(longDescRaw)

  return (
    <div className="prose" style={{ fontSize: 15 }}>
      {longText ? (
        <p style={{ whiteSpace: 'pre-wrap' }}>{longText}</p>
      ) : shortDescription ? (
        <p>{shortDescription}</p>
      ) : (
        <p className="muted">{t('common.noDescription')}</p>
      )}
    </div>
  )
}

export function BackToToursClient() {
  const t = useT()
  return (
    <a href="/tours" style={{ textDecoration: 'underline' }}>
      {t('common.backToTours')}
    </a>
  )
}

export function HighlightsTitleClient() {
  const t = useT()
  return (
    <h2 className="titlePremium" style={{ fontSize: 16, marginBottom: 10 }}>
      {t('common.highlights')}
    </h2>
  )
}

export function NoImageClient() {
  const t = useT()
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, opacity: 0.5 }}>
      {t('common.noImage')}
    </div>
  )
}
