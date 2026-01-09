const path = require('path')
const { fileURLToPath } = require('url')

const { buildConfig } = require('payload')
const { postgresAdapter } = require('@payloadcms/db-postgres')
const { lexicalEditor } = require('@payloadcms/richtext-lexical')

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

module.exports = buildConfig({
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
