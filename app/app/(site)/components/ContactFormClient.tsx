'use client'

import { useState } from 'react'

export default function ContactFormClient() {
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

  const inputStyle = {
    padding: '10px 12px',
    fontSize: 13,
    background: 'rgba(0,0,0,0.03)',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: 8,
    outline: 'none',
  }

  if (submitted) {
    return (
      <div style={{ padding: 16, textAlign: 'center', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12 }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>✓</div>
        <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 4 }}>Message Sent!</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Thanks for reaching out. We'll get back to you soon.
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 14, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input
            type="text"
            placeholder="Your name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="email"
            placeholder="Your email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <input
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Your message *"
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
          <div style={{ padding: 8, background: 'rgba(200,50,50,.1)', borderRadius: 6, fontSize: 11, color: '#a33' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btnPrimary"
          disabled={!canSubmit || submitting}
          style={{ marginTop: 2, padding: '10px 16px', fontSize: 13 }}
        >
          {submitting ? 'Sending...' : 'Send message'}
        </button>
      </div>
    </form>
  )
}
