import type { Lang } from './LanguageContext'

type I18nGroup = {
  [key: string]: string | unknown | null | undefined
}

type DocWithI18n = {
  i18n?: I18nGroup | null
  [key: string]: unknown
}

/**
 * Pick the best translation for a field from a CMS document.
 *
 * Fallback order:
 * 1. doc.i18n[`${fieldBase}_${lang}`] - translated field for current language
 * 2. doc.i18n[`${fieldBase}_en`] - English translation
 * 3. doc[fieldBase] - legacy/original field
 * 4. fallback parameter (default: '')
 *
 * @param doc - The CMS document (tour, transfer, etc.)
 * @param fieldBase - Base field name ('title', 'shortDescription', 'longDescription')
 * @param lang - Current language code
 * @param fallback - Default value if nothing found
 */
export function pickI18n<T = string>(
  doc: DocWithI18n | null | undefined,
  fieldBase: string,
  lang: Lang,
  fallback: T = '' as T
): T {
  if (!doc) return fallback

  const i18n = doc.i18n

  // 1. Try current language in i18n group
  if (i18n) {
    const langKey = `${fieldBase}_${lang}`
    const langValue = i18n[langKey]
    if (langValue !== null && langValue !== undefined && langValue !== '') {
      return langValue as T
    }

    // 2. Try English fallback in i18n group
    if (lang !== 'en') {
      const enKey = `${fieldBase}_en`
      const enValue = i18n[enKey]
      if (enValue !== null && enValue !== undefined && enValue !== '') {
        return enValue as T
      }
    }
  }

  // 3. Try legacy field on doc root
  const legacyValue = doc[fieldBase]
  if (legacyValue !== null && legacyValue !== undefined && legacyValue !== '') {
    return legacyValue as T
  }

  // 4. Return fallback
  return fallback
}

/**
 * Same as pickI18n but for rich text fields (returns the object as-is)
 */
export function pickI18nRichText(
  doc: DocWithI18n | null | undefined,
  fieldBase: string,
  lang: Lang
): unknown {
  return pickI18n(doc, fieldBase, lang, null)
}
