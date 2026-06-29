'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

type Props = {
  value: number
  transactionId: string
}

export default function GoogleAdsConversion({ value, transactionId }: Props) {
  const hasFired = useRef(false)

  useEffect(() => {
    // Fire only once per mount (prevents double-firing on React strict mode)
    if (hasFired.current) return
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'conversion', {
      send_to: 'AW-18167302692/nujgCPG54rwcEKSU7NZD',
      value: value,
      currency: 'GBP',
      transaction_id: transactionId,
    })

    hasFired.current = true
  }, [value, transactionId])

  return null
}
