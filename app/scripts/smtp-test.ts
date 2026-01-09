import payload from 'payload'
import config from '../payload.config'

async function main() {
  await payload.init({ config })

  await payload.sendEmail({
    to: 'info@tobyshighlandtours.com',
    subject: 'SMTP test',
    text: 'If you got this, SMTP works ✅',
  })

  console.log('EMAIL SENT ✅')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
