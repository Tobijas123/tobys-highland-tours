import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isRateLimited, getClientIP } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const MODEL = 'claude-haiku-4-5'

const KNOWN_PLACES: Record<string, [number, number]> = {
  inverness: [-4.2247, 57.4778],
  'inverness airport': [-4.0475, 57.5425],
  'loch ness': [-4.479, 57.334],
  drumnadrochit: [-4.479, 57.334],
  'urquhart castle': [-4.4426, 57.3242],
  'fort augustus': [-4.68, 57.144],
  'fort william': [-5.1052, 56.8198],
  glencoe: [-5.1019, 56.6863],
  'isle of skye': [-6.1956, 57.4125],
  portree: [-6.1956, 57.4125],
  'eilean donan': [-5.5163, 57.274],
  aviemore: [-3.8255, 57.1944],
  cairngorms: [-3.8255, 57.1944],
  ullapool: [-5.1614, 57.8957],
  'john o groats': [-3.0689, 58.6373],
  'loch lomond': [-4.58, 56.0021],
  edinburgh: [-3.1883, 55.9533],
  glasgow: [-4.2518, 55.8642],
}

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string | Array<{ type: string; [key: string]: unknown }>
}

export async function POST(request: Request) {
  // Check env vars
  if (!process.env.ANTHROPIC_API_KEY || !process.env.ORS_API_KEY) {
    console.error('[CHAT] missing env: ANTHROPIC_API_KEY or ORS_API_KEY')
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 })
  }

  // Type-safe keys (guaranteed non-empty after check above)
  const ANTHROPIC_KEY: string = process.env.ANTHROPIC_API_KEY ?? ''
  const ORS_KEY: string = process.env.ORS_API_KEY ?? ''

  try {
    // Parse body
    let body: { messages?: ChatMessage[] }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    // Rate limit: 20 req / 5 min / IP
    const ip = getClientIP(request)
    if (isRateLimited('chat', ip, { maxRequests: 20, windowMs: 5 * 60 * 1000 })) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Get Payload and check if chatbot is enabled
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'chatbot-settings' })

    if (settings.enabled === false) {
      return NextResponse.json({ error: 'disabled' }, { status: 503 })
    }

    // Trim messages to last 12
    const trimmedMessages = body.messages.slice(-12)

    // Fetch tours and transfers for grounding
    const [toursData, transfersData] = await Promise.all([
      payload.find({ collection: 'tours', limit: 100, where: { isActive: { equals: true } } }),
      payload.find({ collection: 'transfers', limit: 100, where: { isActive: { equals: true } } }),
    ])

    // Build tour lines
    const tourLines = toursData.docs
      .map((t: any) => {
        const price =
          t.price1to4 && t.price5to7
            ? `£${t.price1to4} (1-4) / £${t.price5to7} (5-7)`
            : t.price1to4
              ? `£${t.price1to4}`
              : 'price on request'
        const duration = t.durationHours ? `${t.durationHours}h` : ''
        const highlights =
          t.highlights?.map((h: any) => h.text).join(', ') || t.shortDescription || ''
        return `- ${t.title} — ${price} — ${duration} — ${highlights}`.slice(0, 200)
      })
      .join('\n')

    // Build transfer lines
    const transferLines = transfersData.docs
      .map((t: any) => {
        const price =
          t.price1to4 && t.price5to7
            ? `£${t.price1to4} (1-4) / £${t.price5to7} (5-7)`
            : t.price1to4
              ? `£${t.price1to4}`
              : 'price on request'
        const route = t.fromLocation && t.toLocation ? `${t.fromLocation} → ${t.toLocation}` : ''
        const duration = t.durationText || ''
        return `- ${t.title} — ${price} — ${duration} — ${route}`.slice(0, 200)
      })
      .join('\n')

    // System prompt
    const systemPrompt = `PERSONA: You are Hamish, an information assistant for a Highland tours and transfers company.

ROLE:
- You give short, factual answers. You are informational, NOT a salesperson.

RESPONSE RULES:
- Keep answers to 1–3 sentences. No marketing language, no fluff, no emojis, no asterisks.
- Answer ONLY what was asked.
- NEVER recommend, list, or suggest tours or transfers unless the customer explicitly asks "what tours/transfers do you have" or asks about a specific one. The lists below are reference data for answering factual questions — they are NOT an offer to push.
- Ask AT MOST ONE follow-up question, and only if you truly cannot answer without it. Prefer to just answer.
- Do not push bookings. Explain how to book only if asked.
- If unsure, say so plainly and suggest contacting the office. Never invent details.
- When asked for contact details, give them directly from the CONTACT section below. If the customer wants to chat or book quickly, share the WhatsApp link.

EXAMPLE:
Q: "Can you make a tour up north to Dornoch and Dunrobin Castle?"
Good: "Yes. Dornoch is about 67 km from Inverness (around 55 minutes), and Dunrobin Castle is a short drive further near Golspie, so both can be combined in one trip."
Bad: pitching a named excursion, offering transfers, or asking several questions.

TONE: Polite, concrete, helpful — like a consultant at a serious company, not an advertisement.

CONTACT:
- Email: info@dingwall-taxis.co.uk
- Phone: 07383488007
- WhatsApp: https://wa.me/447383488007

AVAILABLE TOURS:
${tourLines || '(none currently listed)'}

AVAILABLE TRANSFERS:
${transferLines || '(none currently listed)'}`

    // Tools
    const tools = [
      {
        name: 'get_travel',
        description:
          'Driving distance (km) and time (minutes) between two places in/around the Scottish Highlands. Use whenever planning a route or asked about travel time or distance.',
        input_schema: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
          },
          required: ['from', 'to'],
        },
      },
    ]

    // Helper: resolve coordinates
    async function resolveCoords(name: string): Promise<[number, number] | null> {
      const lower = name.toLowerCase().trim()

      // Check known places (partial match)
      for (const [key, coords] of Object.entries(KNOWN_PLACES)) {
        if (lower.includes(key) || key.includes(lower)) {
          return coords
        }
      }

      // Geocode via ORS
      try {
        const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(name)}&boundary.country=GB&size=1`
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
        if (!res.ok) return null
        const data = await res.json()
        const coords = data?.features?.[0]?.geometry?.coordinates
        if (Array.isArray(coords) && coords.length >= 2) {
          return [coords[0], coords[1]]
        }
      } catch {
        // geocoding failed
      }
      return null
    }

    // Helper: get travel info
    async function getTravel(
      from: string,
      to: string,
    ): Promise<{ distance_km: number; duration_min: number } | { error: string }> {
      const fromCoord = await resolveCoords(from)
      const toCoord = await resolveCoords(to)

      if (!fromCoord || !toCoord) {
        return { error: "Couldn't locate one of the places" }
      }

      try {
        const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
          method: 'POST',
          headers: {
            Authorization: ORS_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ coordinates: [fromCoord, toCoord] }),
          signal: AbortSignal.timeout(10000),
        })

        if (!res.ok) {
          return { error: 'Travel lookup unavailable right now' }
        }

        const data = await res.json()
        const summary = data?.routes?.[0]?.summary
        if (!summary) {
          return { error: 'Travel lookup unavailable right now' }
        }

        return {
          distance_km: Math.round(summary.distance / 1000),
          duration_min: Math.round(summary.duration / 60),
        }
      } catch {
        return { error: 'Travel lookup unavailable right now' }
      }
    }

    // Agentic loop (max 4 iterations)
    let conversation: any[] = trimmedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }))
    let lastResponse: any = null

    for (let i = 0; i < 4; i++) {
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 900,
          system: systemPrompt,
          tools,
          messages: conversation,
        }),
      })

      if (!anthropicRes.ok) {
        const errText = await anthropicRes.text()
        console.error('[CHAT] Anthropic error:', anthropicRes.status, errText)
        return NextResponse.json({ error: 'chat_failed' }, { status: 500 })
      }

      const data = await anthropicRes.json()
      lastResponse = data

      if (data.stop_reason !== 'tool_use') {
        break
      }

      // Process tool calls
      const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = []

      for (const block of data.content || []) {
        if (block.type === 'tool_use' && block.name === 'get_travel') {
          const result = await getTravel(block.input.from, block.input.to)
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          })
        }
      }

      // Add assistant response and tool results to conversation
      conversation.push({ role: 'assistant', content: data.content })
      conversation.push({ role: 'user', content: toolResults })
    }

    // Extract text reply from last response
    const textBlocks =
      lastResponse?.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text) || []
    const reply = textBlocks.join('\n') || "I'm sorry, I couldn't process that request."

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[CHAT]', err)
    return NextResponse.json({ error: 'chat_failed' }, { status: 500 })
  }
}
