import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
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
  ],

  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
})
