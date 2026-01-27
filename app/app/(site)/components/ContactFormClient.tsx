'use client'

import { useState } from 'react'
import { useT } from '../lib/translations'

export default function ContactFormClient() {
  const t = useT()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [company, setCompany] = useState('') // honeypot
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name.trim().length >= 2 && email.includes('@') && message.trim().length >= 10

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim(),
          company: company.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const panelStyle: React.CSSProperties = {
    maxWidth: 520,
    margin: '0 auto',
    padding: 18,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.03)',
    border: '1px solid rgba(0,0,0,0.08)',
    overflow: 'hidden',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 13,
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: 8,
    color: '#111',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  if (submitted) {
    return (
      <div style={panelStyle}>
        <div style={{ textAlign: 'center', padding: 12 }}>
          <div style={{ fontSize: 28, marginBottom: 8, color: '#22c55e' }}>✓</div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: '#111' }}>Message Sent!</div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>
            Thanks for reaching out. We'll get back to you soon.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={panelStyle}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111' }}>{t('contact.title')}</h3>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(0,0,0,0.55)', lineHeight: 1.4 }}>
          {t('contact.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: 10 }}>
          <input
            type="text"
            placeholder={t('contact.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="email"
            placeholder={t('contact.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="tel"
            placeholder={t('contact.phone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder={t('contact.message')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
            rows={3}
            required
          />

          {/* Honeypot field - hidden from users */}
          <input
            type="text"
            name="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            tabIndex={-1}
            autoComplete="off"
          />

          {error && (
            <div style={{ padding: 8, background: 'rgba(220,38,38,0.08)', borderRadius: 8, fontSize: 11, color: '#b91c1c', border: '1px solid rgba(220,38,38,0.2)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btnPrimary"
            disabled={!canSubmit || submitting}
            style={{ marginTop: 4, padding: '11px 18px', fontSize: 13 }}
          >
            {submitting ? 'Sending...' : t('contact.send')}
          </button>
        </div>
      </form>
    </div>
  )
}
