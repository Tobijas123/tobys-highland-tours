'use client'

import { useLanguage } from '../lib/LanguageContext'
import { t } from '../lib/translations'

export default function NavigationClient() {
  const { lang } = useLanguage()

  return (
    <nav style={{ display: 'flex', gap: 14, fontWeight: 900 }}>
      <a href="/" className="btn btnGhost" style={{ width: 'auto', padding: '8px 12px' }}>
        {t('nav.home', lang)}
      </a>
      <a href="/about" className="btn btnGhost" style={{ width: 'auto', padding: '8px 12px' }}>
        {t('nav.about', lang)}
      </a>
      <a href="/tours" className="btn btnGhost" style={{ width: 'auto', padding: '8px 12px' }}>
        {t('nav.tours', lang)}
      </a>
      <a href="/transfers" className="btn btnGhost" style={{ width: 'auto', padding: '8px 12px' }}>
        {t('nav.transfers', lang)}
      </a>
    </nav>
  )
}
