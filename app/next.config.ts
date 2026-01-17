import type { NextConfig } from 'next'
import withPayload from '@payloadcms/next/withPayload'

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


}

export default withPayload(nextConfig)

