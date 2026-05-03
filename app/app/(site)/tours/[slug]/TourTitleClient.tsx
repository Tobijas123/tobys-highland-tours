'use client'

import { useLanguage } from '../../lib/LanguageContext'
import { pickI18n, pickI18nRichText } from '../../lib/pickI18n'
import { useT } from '../../lib/translations'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type I18nGroup = {
  [key: string]: string | unknown | undefined
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

  // Check if we have valid richText data
  const hasRichText = longDescRaw && typeof longDescRaw === 'object' && 'root' in (longDescRaw as object)

  return (
    <div className="prose" style={{ fontSize: 15 }}>
      {hasRichText ? (
        <RichText data={longDescRaw as SerializedEditorState} />
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
