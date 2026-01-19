'use client'
import { useState, useEffect } from 'react'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
]

export default function TopBarClient() {
  const [lang, setLang] = useState('en')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('lang')
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      setLang(saved)
    }
  }, [])

  const handleSelect = (code: string) => {
    setLang(code)
    localStorage.setItem('lang', code)
    setOpen(false)
  }

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  return (
    <div className="langDropdown">
      <button
        className="langBtn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="langFlag">{current.flag}</span>
        <span className="langCode">{current.code.toUpperCase()}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      {open && (
        <ul className="langMenu" role="listbox">
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                className={`langOption ${l.code === lang ? 'active' : ''}`}
                onClick={() => handleSelect(l.code)}
                role="option"
                aria-selected={l.code === lang}
              >
                <span className="langFlag">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
