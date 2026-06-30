import { NextRequest, NextResponse } from 'next/server'
import { generateBusinessSummary } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { businessName, context } = await req.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not set in .env.local' }, { status: 500 })
    }

    const summary = await generateBusinessSummary(context ?? 'No data available yet.', businessName ?? 'My Business')
    return NextResponse.json({ summary })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Summary error:', msg)
    return NextResponse.json({ error: `Groq error: ${msg}` }, { status: 500 })
  }
}
