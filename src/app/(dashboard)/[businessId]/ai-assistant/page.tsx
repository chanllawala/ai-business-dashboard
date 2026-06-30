'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useBusinessStore } from '@/stores/business-store'
import { useDataStore, type BusinessData } from '@/stores/data-store'
import { Button } from '@/components/ui/button'
import { Send, Bot, User, Sparkles, CheckCircle2, XCircle, PlusCircle } from 'lucide-react'
import type { ChatMessage } from '@/types'
import type { AIAction } from '@/lib/ai'
import { cn, formatCurrency } from '@/lib/utils'

// ── Build context ─────────────────────────────────────────────────────────
function buildContext(name: string, currency: string, data: BusinessData) {
  const revenue  = data.sales.filter(s => s.status === 'completed').reduce((t, s) => t + s.amount, 0)
  const expenses = data.expenses.reduce((t, e) => t + e.amount, 0)
  return `Business: ${name} | Currency: ${currency} | Today: ${new Date().toISOString().slice(0, 10)}

CUSTOMERS (${data.customers.length}):
${data.customers.length === 0 ? 'None.' : data.customers.map(c =>
  `- ${c.name}${c.company ? ` (${c.company})` : ''} | ${c.email ?? ''} | ${c.phone ?? ''}`
).join('\n')}

EMPLOYEES (${data.employees.length}):
${data.employees.length === 0 ? 'None.' : data.employees.map(e =>
  `- ${e.name} | ${e.position} | ${formatCurrency(e.salary, currency)}/yr | ${e.status}`
).join('\n')}

SALES — Revenue: ${formatCurrency(revenue, currency)}:
${data.sales.length === 0 ? 'None.' : data.sales.slice(0, 15).map(s =>
  `- ${s.description} | ${formatCurrency(s.amount, currency)} | ${s.date} | ${s.status}`
).join('\n')}

EXPENSES — Total: ${formatCurrency(expenses, currency)}:
${data.expenses.length === 0 ? 'None.' : data.expenses.slice(0, 15).map(e =>
  `- ${e.description} | ${formatCurrency(e.amount, currency)} | ${e.category} | ${e.date}`
).join('\n')}

TASKS (${data.tasks.length}):
${data.tasks.length === 0 ? 'None.' : data.tasks.map(t =>
  `- [${t.status.toUpperCase()}] ${t.title}${t.assigned_to ? ` → ${t.assigned_to}` : ''}${t.due_date ? ` | due ${t.due_date}` : ''} | ${t.priority}`
).join('\n')}

MEETINGS (${data.meetings.length}):
${data.meetings.length === 0 ? 'None.' : data.meetings.slice(0, 5).map(m =>
  `- ${m.title} (${m.date})`
).join('\n')}

NET PROFIT: ${formatCurrency(revenue - expenses, currency)}

OWNER NOTES:
${(data.notes ?? []).length === 0 ? 'None.' : (data.notes ?? []).map(n => `- [${n.type}] ${n.content}`).join('\n')}`
}

// ── Action label ──────────────────────────────────────────────────────────
function actionLabel(action: AIAction): string {
  const d = action.data
  switch (action.type) {
    case 'add_customer':  return `Add customer: ${d.name}${d.company ? ` (${d.company})` : ''}`
    case 'add_employee':  return `Add employee: ${d.name} — ${d.position}`
    case 'add_sale':      return `Record sale: ${d.description} — £${d.amount}`
    case 'add_expense':   return `Record expense: ${d.description} — £${d.amount}`
    case 'add_task':      return `Add task: ${d.title}`
    case 'add_meeting':   return `Record meeting: ${d.title} on ${d.date}`
    default:              return action.type
  }
}

// ── Execute an action against the store ───────────────────────────────────
function useExecuteAction() {
  const store = useDataStore()
  return (businessId: string, action: AIAction) => {
    const id  = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const now = new Date().toISOString()
    const today = now.slice(0, 10)
    const d = action.data as Record<string, unknown>

    switch (action.type) {
      case 'add_customer':
        store.addCustomer(businessId, {
          id, business_id: businessId, created_at: now, updated_at: now, total_spent: 0,
          name: String(d.name ?? ''),
          email: d.email ? String(d.email) : undefined,
          phone: d.phone ? String(d.phone) : undefined,
          company: d.company ? String(d.company) : undefined,
          notes: d.notes ? String(d.notes) : undefined,
        })
        break
      case 'add_employee':
        store.addEmployee(businessId, {
          id, business_id: businessId, created_at: now,
          name: String(d.name ?? ''), position: String(d.position ?? ''),
          email: d.email ? String(d.email) : '',
          phone: d.phone ? String(d.phone) : undefined,
          department: d.department ? String(d.department) : undefined,
          salary: Number(d.salary ?? 0),
          start_date: today, leave_days_remaining: 25,
          status: (['active','on_leave','inactive'].includes(String(d.status)) ? String(d.status) : 'active') as 'active' | 'on_leave' | 'inactive',
        })
        break
      case 'add_sale':
        store.addSale(businessId, {
          id, business_id: businessId, created_at: now,
          description: String(d.description ?? ''),
          amount: Number(d.amount ?? 0),
          date: d.date ? String(d.date) : today,
          status: (['completed','pending','refunded'].includes(String(d.status)) ? String(d.status) : 'completed') as 'completed' | 'pending' | 'refunded',
        })
        break
      case 'add_expense':
        store.addExpense(businessId, {
          id, business_id: businessId, created_at: now,
          description: String(d.description ?? ''),
          amount: Number(d.amount ?? 0),
          category: (['rent','utilities','marketing','payroll','suppliers','other'].includes(String(d.category)) ? String(d.category) : 'other') as 'rent' | 'utilities' | 'marketing' | 'payroll' | 'suppliers' | 'other',
          date: d.date ? String(d.date) : today,
        })
        break
      case 'add_task':
        store.addTask(businessId, {
          id, business_id: businessId, created_at: now, updated_at: now,
          title: String(d.title ?? ''),
          description: d.description ? String(d.description) : undefined,
          assigned_to: d.assigned_to ? String(d.assigned_to) : undefined,
          due_date: d.due_date ? String(d.due_date) : undefined,
          priority: (['low','medium','high'].includes(String(d.priority)) ? String(d.priority) : 'medium') as 'low' | 'medium' | 'high',
          status: (['todo','doing','completed'].includes(String(d.status)) ? String(d.status) : 'todo') as 'todo' | 'doing' | 'completed',
        })
        break
      case 'add_meeting':
        store.addMeeting(businessId, {
          id, business_id: businessId, created_at: now,
          title: String(d.title ?? ''),
          date: d.date ? String(d.date) : today,
          attendees: Array.isArray(d.attendees) ? d.attendees.map(String) : [],
          minutes: d.minutes ? String(d.minutes) : undefined,
          decisions: Array.isArray(d.decisions) ? d.decisions.map(String) : [],
          action_items: [],
        })
        break
    }
  }
}

// ── Message type ─────────────────────────────────────────────────────────
type MsgStatus = 'idle' | 'pending' | 'confirmed' | 'cancelled'
type Message = ChatMessage & {
  pendingActions?: AIAction[]   // waiting for user confirm
  confirmedActions?: AIAction[] // user said yes
  status?: MsgStatus
}

// ── Suggestion chips ──────────────────────────────────────────────────────
const EXAMPLES = [
  { text: 'Add Kirtan as a customer',                    add: true },
  { text: 'Record a £1,000 sale for design work today',  add: true },
  { text: 'Add expense: rent £800 this month',           add: true },
  { text: 'Create a task: send invoice by Friday',       add: true },
  { text: 'How is the business doing?',                  add: false },
  { text: 'What should I focus on this week?',           add: false },
  { text: 'Give me advice on growing revenue',           add: false },
]

// ── Main component ────────────────────────────────────────────────────────
export default function AIAssistantPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { activeBusiness } = useBusinessStore()
  const bizData   = useDataStore((s) => s.get(businessId))
  const execute   = useExecuteAction()
  const currency  = activeBusiness?.currency ?? 'GBP'
  const bizName   = activeBusiness?.name ?? 'My Business'
  const bottomRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([{
    id: '0', role: 'assistant', timestamp: new Date().toISOString(),
    content: `Hi! I'm your AI business advisor for **${bizName}**.\n\nI can answer questions, give advice, and add data to your dashboard. When I want to add something I'll ask you to confirm first — you stay in control.\n\nTry: "Add Sarah as a customer" or "How is the business doing?"`,
  }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Confirm pending actions for a message
  // NOTE: execute() must NOT be called inside the setMessages updater — React 18 Strict Mode
  // invokes state updater functions twice in development to detect side effects, which would
  // cause every store write to happen twice. Execute first, then update state separately.
  const confirm = (msgId: string) => {
    const pending = messages.find((m) => m.id === msgId)?.pendingActions
    if (!pending?.length) return

    pending.forEach((a) => execute(businessId, a))

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, status: 'confirmed', confirmedActions: pending, pendingActions: undefined }
          : m
      )
    )
  }

  // Cancel pending actions for a message
  const cancel = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, status: 'cancelled', pendingActions: undefined } : m
      )
    )
  }

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')

    const userMsg: Message = {
      id: Date.now().toString(), role: 'user',
      content: msg, timestamp: new Date().toISOString(),
    }
    setMessages((p) => [...p, userMsg])
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const res  = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context: buildContext(bizName, currency, bizData) }),
      })
      const data = await res.json()

      const actions: AIAction[] = data.actions ?? []
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message ?? data.error ?? 'No response.',
        timestamp: new Date().toISOString(),
        ...(actions.length > 0 ? { pendingActions: actions, status: 'pending' } : {}),
      }
      setMessages((p) => [...p, aiMsg])
    } catch (err) {
      setMessages((p) => [...p, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        timestamp: new Date().toISOString(),
        content: `Error: ${err instanceof Error ? err.message : 'Network error'}`,
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/25">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">AI Business Advisor</p>
            <p className="text-xs text-slate-400">
              Answers · Advice · Adds data with your confirmation · {bizName}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 ring-1 ring-emerald-200/80">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">Groq · Llama 3</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 p-5">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
            {/* Avatar */}
            <div className={cn(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs shadow-sm',
              m.role === 'assistant'
                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600'
            )}>
              {m.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>

            <div className={cn('flex flex-col gap-2', m.role === 'user' ? 'items-end' : 'items-start', 'max-w-[82%]')}>
              {/* Bubble */}
              <div className={cn(
                'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                m.role === 'assistant'
                  ? 'bg-white border border-slate-200/80 text-slate-800 shadow-sm'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25'
              )}>
                {m.content}
              </div>

              {/* Pending confirmation UI */}
              {m.pendingActions && m.status === 'pending' && (
                <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <p className="mb-2.5 text-xs font-bold text-amber-800 uppercase tracking-wide">AI wants to add:</p>
                  <ul className="mb-3.5 space-y-2">
                    {m.pendingActions.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-amber-200/80 text-xs text-amber-900 font-medium">
                        <PlusCircle className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                        {actionLabel(a)}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirm(m.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-2 text-xs font-bold text-white hover:from-emerald-500 hover:to-green-500 shadow-sm transition-all active:scale-[0.98]"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Yes, add it
                    </button>
                    <button
                      onClick={() => cancel(m.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      No, cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmed */}
              {m.confirmedActions && m.status === 'confirmed' && (
                <div className="w-full space-y-1.5">
                  {m.confirmedActions.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-800">{actionLabel(a)}</span>
                      <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600">Added ✓</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cancelled */}
              {m.status === 'cancelled' && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <XCircle className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400">Cancelled — nothing was added</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 150, 300].map((d) => (
                  <div key={d} className="h-2 w-2 animate-bounce rounded-full bg-indigo-300" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Example prompts */}
      {messages.length === 1 && (
        <div className="border-t border-slate-100 bg-white px-5 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>Try these — <span className="text-emerald-600 font-medium">green = add data</span>, white = ask/advise:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map(({ text, add }) => (
              <button key={text} onClick={() => send(text)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-all hover:scale-[1.02]',
                  add
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm shadow-emerald-100'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm'
                )}>
                {add ? '＋ ' : ''}{text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder='Ask anything, or "Add [name] as a customer"...'
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <Button onClick={() => send()} isLoading={loading} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-center text-xs text-slate-300">
          AI asks for confirmation before adding anything · Data saves to your dashboard instantly
        </p>
      </div>
    </div>
  )
}
