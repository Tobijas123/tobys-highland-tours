import type { NextConfig } from 'next'
import withPayload from '@payloadcms/next/withPayload'

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: blob: https: http:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https: http: ws: wss:; frame-ancestors 'none'",
  },
]

// Add HSTS only in production
if (process.env.NODE_ENV === 'production') {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  })
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Żeby Next dev nie blokował requestów z IP (telefon / inne urządzenia)
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '[::1]',
    '192.168.4.40',
    '172.24.182.159',
    '10.255.255.254',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default withPayload(nextConfig)
