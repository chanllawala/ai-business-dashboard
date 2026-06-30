import { NextRequest, NextResponse } from 'next/server'
import { chatWithBusinessContext, parseActions } from '@/lib/ai'
import { checkRateLimit, validateChatRequest, validateActions } from '@/lib/security'

export async function POST(req: NextRequest) {
  // ── Rate limiting ────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'

  const rate = checkRateLimit(ip)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please wait ${rate.retryAfter}s before trying again.` },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } }
    )
  }

  // ── Input validation ─────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = validateChatRequest(body)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  // ── API key check ─────────────────────────────────────────────────────
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY is not set in .env.local' }, { status: 500 })
  }

  const { messages, context } = body as { messages: { role: string; content: string }[]; context?: string }

  try {
    const raw = await chatWithBusinessContext(
      messages as { role: 'user' | 'assistant' | 'system'; content: string }[],
      context ?? 'No business data yet.'
    )

    // Parse and sanitize any actions the AI wants to perform
    const { message, actions: rawActions } = parseActions(raw)
    const actions = validateActions(rawActions)

    return NextResponse.json({ message, actions })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('AI chat error:', msg)
    return NextResponse.json({ error: `AI error: ${msg}` }, { status: 500 })
  }
}
