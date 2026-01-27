'use client'

import { useT } from '../lib/translations'

export default function NavigationClient() {
  const t = useT()

  return (
    <nav style={{ display: 'flex', gap: 14, fontWeight: 900 }}>
      <a href="/" className="btn btnGhost" style={{ width: 'auto', padding: '8px 12px' }}>
        {t('nav.home')}
      </a>
      <a href="/about" className="btn btnGhost" style={{ width: 'auto', padding: '8px 12px' }}>
        {t('nav.about')}
      </a>
      <a href="/tours" className="btn btnGhost" style={{ width: 'auto', padding: '8px 12px' }}>
        {t('nav.tours')}
      </a>
      <a href="/transfers" className="btn btnGhost" style={{ width: 'auto', padding: '8px 12px' }}>
        {t('nav.transfers')}
      </a>
    </nav>
  )
}
