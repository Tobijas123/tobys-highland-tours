import path from 'path'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import Tours from './collections/Tours'
import Media from './collections/Media'
import Bookings from './collections/Bookings'
import Vehicles from './collections/Vehicles'
import Drivers from './collections/Drivers'
import Transfers from './collections/Transfers'
import Testimonials from './collections/Testimonials'
import Homepage from './globals/Homepage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Production env validation - fail fast if critical vars are missing or insecure
if (process.env.NODE_ENV === 'production') {
  const errors: string[] = []

  if (!process.env.DATABASE_URI) {
    errors.push('DATABASE_URI is required in production')
  }

  if (!process.env.PAYLOAD_SECRET) {
    errors.push('PAYLOAD_SECRET is required in production')
  } else if (process.env.PAYLOAD_SECRET === 'dev_secret_change_later') {
    errors.push('PAYLOAD_SECRET must be changed from default value in production')
  } else if (process.env.PAYLOAD_SECRET.length < 32) {
    errors.push('PAYLOAD_SECRET should be at least 32 characters in production')
  }

  if (errors.length > 0) {
    console.error('\n❌ Production environment validation failed:')
    errors.forEach((e) => console.error(`   - ${e}`))
    console.error('\n')
    process.exit(1)
  }
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  
  email: nodemailerAdapter({
    skipVerify: true,
    defaultFromAddress: process.env.MAIL_FROM_ADDRESS as string,
    defaultFromName: process.env.MAIL_FROM_NAME as string,
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    },
  }),
secret: process.env.PAYLOAD_SECRET || 'dev_secret_change_later',

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),

  editor: lexicalEditor(),

  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
    Media,
    Tours,
    Bookings,
    Vehicles,
    Drivers,
    Transfers,
    Testimonials,
  ],

  globals: [Homepage],

  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // @ts-expect-error -- css exists at runtime in Payload 3.x but missing from type defs
    css: path.resolve(dirname, 'app/admin.css'),
  },
})
