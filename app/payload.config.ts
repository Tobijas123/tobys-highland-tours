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
    css: path.resolve(dirname, 'app/admin.css'),
  },
})
