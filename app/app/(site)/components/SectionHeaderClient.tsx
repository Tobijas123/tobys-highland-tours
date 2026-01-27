'use client'

import { useT } from '../lib/translations'

type SectionHeaderProps = {
  titleKey: 'section.ourTours' | 'section.transfers' | 'section.reviews'
  linkKey?: 'section.viewAllTours' | 'section.viewAllTransfers'
  href?: string
}

export default function SectionHeaderClient({ titleKey, linkKey, href }: SectionHeaderProps) {
  const t = useT()

  return (
    <div className="sectionHeader">
      <h2 className="sectionTitle">{t(titleKey)}</h2>
      {linkKey && href && (
        <a href={href} className="viewAllLink">
          {t(linkKey)}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </a>
      )}
    </div>
  )
}
