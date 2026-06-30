import type { AIAction } from './ai'

// ── Rate Limiter ─────────────────────────────────────────────────────────
// Simple in-memory rate limiter: max N requests per window per IP
const WINDOW_MS = 60_000   // 1 minute
const MAX_REQUESTS = 30    // 30 AI requests per minute per IP

const requestLog = new Map<string, number[]>()

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const hits = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  requestLog.set(ip, hits)

  // Clean up old IPs every 5 minutes
  if (Math.random() < 0.01) {
    for (const [key, times] of requestLog) {
      if (times.every((t) => now - t > WINDOW_MS)) requestLog.delete(key)
    }
  }

  if (hits.length > MAX_REQUESTS) {
    const oldest = hits[hits.length - MAX_REQUESTS]
    return { allowed: false, retryAfter: Math.ceil((WINDOW_MS - (now - oldest)) / 1000) }
  }
  return { allowed: true }
}

// ── Input Sanitization ───────────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 2000
const MAX_CONTEXT_LENGTH = 8000
const MAX_MESSAGES_IN_HISTORY = 20

// Strip any HTML / script tags from a string
function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim()
}

// Only allow printable characters + common unicode — blocks control chars
function sanitizeString(value: unknown, maxLen = 500): string {
  if (typeof value !== 'string') return ''
  return stripTags(value).slice(0, maxLen)
}

export interface ValidationResult {
  ok: boolean
  error?: string
}

export function validateChatRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request body' }

  const b = body as Record<string, unknown>

  // messages
  if (!Array.isArray(b.messages)) return { ok: false, error: 'messages must be an array' }
  if (b.messages.length > MAX_MESSAGES_IN_HISTORY) return { ok: false, error: 'Too many messages in history' }

  for (const msg of b.messages) {
    if (!msg || typeof msg !== 'object') return { ok: false, error: 'Invalid message format' }
    const m = msg as Record<string, unknown>
    if (!['user', 'assistant', 'system'].includes(String(m.role ?? ''))) return { ok: false, error: 'Invalid message role' }
    if (typeof m.content !== 'string') return { ok: false, error: 'Message content must be a string' }
    if (m.content.length > MAX_MESSAGE_LENGTH) return { ok: false, error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` }
  }

  // context (optional)
  if (b.context !== undefined) {
    if (typeof b.context !== 'string') return { ok: false, error: 'context must be a string' }
    if (b.context.length > MAX_CONTEXT_LENGTH) return { ok: false, error: 'Context too large' }
  }

  return { ok: true }
}

// ── Action Validation ────────────────────────────────────────────────────
const ALLOWED_TYPES = new Set([
  'add_customer', 'add_employee', 'add_sale',
  'add_expense', 'add_task', 'add_meeting',
])

const ALLOWED_STATUSES = {
  employee: new Set(['active', 'on_leave', 'inactive']),
  sale:     new Set(['completed', 'pending', 'refunded']),
  task:     new Set(['todo', 'doing', 'completed']),
}

const ALLOWED_CATEGORIES = new Set(['rent', 'utilities', 'marketing', 'payroll', 'suppliers', 'other'])
const ALLOWED_PRIORITIES  = new Set(['low', 'medium', 'high'])
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function validateDate(d: unknown): string | undefined {
  if (!d) return undefined
  const s = String(d)
  return DATE_RE.test(s) ? s : undefined
}

export function validateActions(raw: unknown): AIAction[] {
  if (!Array.isArray(raw)) return []

  return raw
    .filter((item): item is AIAction => {
      if (!item || typeof item !== 'object') return false
      const a = item as Record<string, unknown>
      return ALLOWED_TYPES.has(String(a.type ?? '')) && typeof a.data === 'object' && a.data !== null
    })
    .map((action) => {
      const d = action.data as Record<string, unknown>

      // Sanitize every string field in data
      const clean: Record<string, unknown> = {}

      switch (action.type) {
        case 'add_customer':
          clean.name    = sanitizeString(d.name, 100)
          clean.email   = sanitizeString(d.email, 200)
          clean.phone   = sanitizeString(d.phone, 30)
          clean.company = sanitizeString(d.company, 100)
          clean.notes   = sanitizeString(d.notes, 500)
          if (!clean.name) return null
          break

        case 'add_employee':
          clean.name       = sanitizeString(d.name, 100)
          clean.position   = sanitizeString(d.position, 100)
          clean.email      = sanitizeString(d.email, 200)
          clean.department = sanitizeString(d.department, 100)
          clean.salary     = Math.max(0, Math.min(Number(d.salary ?? 0), 10_000_000))
          clean.status     = ALLOWED_STATUSES.employee.has(String(d.status ?? '')) ? String(d.status) : 'active'
          if (!clean.name || !clean.position) return null
          break

        case 'add_sale':
          clean.description = sanitizeString(d.description, 300)
          clean.amount      = Math.max(0, Math.min(Number(d.amount ?? 0), 100_000_000))
          clean.date        = validateDate(d.date)
          clean.status      = ALLOWED_STATUSES.sale.has(String(d.status ?? '')) ? String(d.status) : 'completed'
          if (!clean.description || !clean.amount) return null
          break

        case 'add_expense':
          clean.description = sanitizeString(d.description, 300)
          clean.amount      = Math.max(0, Math.min(Number(d.amount ?? 0), 100_000_000))
          clean.category    = ALLOWED_CATEGORIES.has(String(d.category ?? '')) ? String(d.category) : 'other'
          clean.date        = validateDate(d.date)
          if (!clean.description || !clean.amount) return null
          break

        case 'add_task':
          clean.title       = sanitizeString(d.title, 200)
          clean.description = sanitizeString(d.description, 500)
          clean.assigned_to = sanitizeString(d.assigned_to, 100)
          clean.due_date    = validateDate(d.due_date)
          clean.priority    = ALLOWED_PRIORITIES.has(String(d.priority ?? '')) ? String(d.priority) : 'medium'
          clean.status      = ALLOWED_STATUSES.task.has(String(d.status ?? '')) ? String(d.status) : 'todo'
          if (!clean.title) return null
          break

        case 'add_meeting':
          clean.title     = sanitizeString(d.title, 200)
          clean.date      = validateDate(d.date) ?? new Date().toISOString().slice(0, 10)
          clean.minutes   = sanitizeString(d.minutes, 2000)
          clean.attendees = Array.isArray(d.attendees)
            ? d.attendees.map((a) => sanitizeString(a, 100)).filter(Boolean).slice(0, 20)
            : []
          clean.decisions = Array.isArray(d.decisions)
            ? d.decisions.map((dec) => sanitizeString(dec, 300)).filter(Boolean).slice(0, 20)
            : []
          if (!clean.title) return null
          break
      }

      return { type: action.type, data: clean } as AIAction
    })
    .filter((a): a is AIAction => a !== null)
}
