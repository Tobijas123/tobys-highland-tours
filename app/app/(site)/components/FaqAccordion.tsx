'use client'

import { useState } from 'react'

type FaqItem = {
  question: string
  answer: string
}

interface FaqAccordionProps {
  faqs: FaqItem[]
  title?: string
}

export default function FaqAccordion({ faqs, title = 'Frequently Asked Questions' }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (!faqs || faqs.length === 0) return null

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={index}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
                background: 'var(--surface)',
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--ink)',
                }}
              >
                <span>{faq.question}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    flexShrink: 0,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms ease',
                  }}
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div
                style={{
                  maxHeight: isOpen ? 500 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 250ms ease',
                }}
              >
                <div
                  style={{
                    padding: '0 16px 14px',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'var(--muted)',
                  }}
                >
                  {faq.answer}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
