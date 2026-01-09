import { createPayloadRequestHandler } from '@payloadcms/next/handlers'
import config from '../../../../payload.config'

const handler = createPayloadRequestHandler({
  config,
})

export const GET = handler
export const POST = handler
export const PATCH = handler
export const PUT = handler
export const DELETE = handler
