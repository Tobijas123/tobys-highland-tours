import crypto from 'crypto'

const SECRET =
  process.env.PAYMENT_LINK_SECRET || process.env.STRIPE_SECRET_KEY || 'dev-secret'

export function makePaymentToken(bookingId: number | string): string {
  return crypto
    .createHmac('sha256', SECRET)
    .update(`pay-remaining:${bookingId}`)
    .digest('hex')
    .slice(0, 32)
}

export function verifyPaymentToken(
  bookingId: number | string,
  token: string | null | undefined,
): boolean {
  if (!token) return false
  const expected = makePaymentToken(bookingId)
  const a = Buffer.from(expected)
  const b = Buffer.from(token)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
