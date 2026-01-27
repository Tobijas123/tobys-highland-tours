'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

// All supported language codes (translations only for en/pl, others fallback to en)
export type Lang = 'en' | 'pl' | 'es' | 'pt' | 'hi' | 'zh'

const VALID_LANGS: Lang[] = ['en', 'pl', 'es', 'pt', 'hi', 'zh']

type LanguageContextType = {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

function isValidLang(value: string): value is Lang {
  return VALID_LANGS.includes(value as Lang)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = getCookie('site_lang')
    if (saved && isValidLang(saved)) {
      setLangState(saved)
    }
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    setCookie('site_lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    // Return default if outside provider (SSR fallback)
    return { lang: 'en' as Lang, setLang: () => {} }
  }
  return ctx
}
