import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isRateLimited, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

const ADMIN_EMAIL = 'info@tobyshighlandtours.com'

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (isRateLimited('contact', ip, RATE_LIMITS.contact)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, phone, message, company } = body

    // Honeypot check - silently accept but don't send email
    if (company) {
      return NextResponse.json({ ok: true })
    }

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'name is required (min 2 chars)' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'valid email is required' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'message is required (min 10 chars)' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const timestamp = new Date().toISOString()
    const phoneInfo = phone?.trim() ? `<tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${phone.trim()}</td></tr>` : ''

    const html = `
      <h2>New Contact Form Message</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${name.trim()}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${email.trim()}</td></tr>
        ${phoneInfo}
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Message</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${message.trim().replace(/\n/g, '<br/>')}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>Timestamp</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${timestamp}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>IP</strong></td><td style="padding: 6px; border: 1px solid #ddd;">${ip}</td></tr>
        <tr><td style="padding: 6px; border: 1px solid #ddd;"><strong>User-Agent</strong></td><td style="padding: 6px; border: 1px solid #ddd; font-size: 11px;">${userAgent}</td></tr>
      </table>
      <p style="margin-top: 16px;"><a href="mailto:${email.trim()}">Reply to ${name.trim()}</a></p>
    `

    // Fire-and-forget email
    void payload.sendEmail({
      to: ADMIN_EMAIL,
      subject: `New contact form message from ${name.trim()}`,
      html,
    }).then(() => {
      console.log('[CONTACT API] Email sent successfully')
    }).catch((err) => {
      console.error('[CONTACT API] Failed to send email:', err)
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[CONTACT API] Error:', err)
    return NextResponse.json({ error: 'Failed to process contact form' }, { status: 500 })
  }
}
