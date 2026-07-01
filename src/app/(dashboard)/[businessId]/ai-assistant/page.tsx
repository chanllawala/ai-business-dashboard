'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useBusinessStore } from '@/stores/business-store'
import { useDataStore, type BusinessData } from '@/stores/data-store'
import { Button } from '@/components/ui/button'
import { Send, Bot, User, Sparkles, CheckCircle2, XCircle, PlusCircle, Zap } from 'lucide-react'
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
    case 'add_sale':      return `Record sale: ${d.description} — ${formatCurrency(Number(d.amount), 'GBP')}`
    case 'add_expense':   return `Record expense: ${d.description} — ${formatCurrency(Number(d.amount), 'GBP')}`
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
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl px-7 py-5 shadow-lg shadow-slate-900/5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl shadow-cyan-500/30">
            <Zap className="h-6 w-6 text-white fill-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">NovaBiz AI Advisor</p>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Answers · Advice · Adds data with your confirmation · {bizName}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-2 ring-1 ring-emerald-200 shadow-md shadow-emerald-500/10">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">Groq · Llama 3</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 p-7">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex gap-4', m.role === 'user' && 'flex-row-reverse')}>
            {/* Avatar */}
            <div className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-xs shadow-lg',
              m.role === 'assistant'
                ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-500/20'
                : 'bg-white border border-slate-200 text-slate-700 shadow-slate-200/50'
            )}>
              {m.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>

            <div className={cn('flex flex-col gap-3', m.role === 'user' ? 'items-end' : 'items-start', 'max-w-[80%]')}>
              {/* Bubble */}
              <div className={cn(
                'rounded-3xl px-5 py-4 text-base leading-relaxed whitespace-pre-wrap shadow-xl',
                m.role === 'assistant'
                  ? 'bg-white/90 border border-slate-200/70 text-slate-800 backdrop-blur-sm'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/25'
              )}>
                {m.content}
              </div>

              {/* Pending confirmation UI */}
              {m.pendingActions && m.status === 'pending' && (
                <div className="w-full rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/80 p-5 shadow-xl backdrop-blur-sm">
                  <p className="mb-4 text-xs font-black text-amber-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI wants to add:
                  </p>
                  <ul className="mb-5 space-y-3">
                    {m.pendingActions.map((a, i) => (
                      <li key={i} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-2 ring-amber-200/70 text-xs font-bold text-amber-900 shadow-md">
                        <PlusCircle className="h-4 w-4 flex-shrink-0 text-amber-500" />
                        {actionLabel(a)}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    <button
                      onClick={() => confirm(m.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 text-xs font-black text-white hover:from-emerald-500 hover:to-green-500 shadow-xl shadow-emerald-500/25 transition-all active:scale-[0.98]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Yes, add it
                    </button>
                    <button
                      onClick={() => cancel(m.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <XCircle className="h-4 w-4" />
                      No, cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmed */}
              {m.confirmedActions && m.status === 'confirmed' && (
                <div className="w-full space-y-2">
                  {m.confirmedActions.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-3 shadow-xl">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-900">{actionLabel(a)}</span>
                      <span className="ml-auto rounded-full bg-emerald-200 px-3 py-1 text-xs font-black text-emerald-700">Added ✓</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cancelled */}
              {m.status === 'cancelled' && (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-sm">
                  <XCircle className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-600">Cancelled — nothing was added</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl shadow-cyan-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 px-5 py-4 shadow-xl backdrop-blur-sm">
              <div className="flex gap-2">
                {[0, 150, 300].map((d) => (
                  <div key={d} className="h-3 w-3 animate-bounce rounded-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Example prompts */}
      {messages.length === 1 && (
        <div className="border-t border-slate-200/70 bg-white/90 backdrop-blur-xl px-7 py-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-600">
            <Sparkles className="h-4 w-4 text-cyan-500" />
            <span>Try these — <span className="text-emerald-600">green = add data</span>, white = ask/advise:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(({ text, add }) => (
              <button key={text} onClick={() => send(text)}
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-bold transition-all hover:scale-[1.03] shadow-md',
                  add
                    ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 hover:from-emerald-100 hover:to-emerald-200 shadow-emerald-100'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 shadow-slate-100'
                )}>
                {add ? '＋ ' : ''}{text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-lg shadow-slate-900/5">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder='Ask anything, or "Add [name] as a customer"...'
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-base text-slate-900 placeholder-slate-400 shadow-md transition-all focus:bg-white focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
          />
          <Button onClick={() => send()} isLoading={loading} disabled={!input.trim()} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-xl shadow-cyan-500/25 rounded-2xl px-6 py-3.5">
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="mt-2.5 text-center text-xs font-medium text-slate-400">
          AI asks for confirmation before adding anything · Data saves to your dashboard instantly
        </p>
      </div>
    </div>
  )
}
