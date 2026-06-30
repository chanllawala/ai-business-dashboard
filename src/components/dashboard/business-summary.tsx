'use client'

import { useState } from 'react'
import { useBusinessStore } from '@/stores/business-store'
import { useDataStore, type BusinessData } from '@/stores/data-store'
import { Button } from '@/components/ui/button'
import { Sparkles, Copy, Download, X, CheckCheck, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Props { businessId: string }

function buildContext(bizName: string, currency: string, data: BusinessData) {
  const revenue = data.sales.filter(s => s.status === 'completed').reduce((t, s) => t + s.amount, 0)
  const expenses = data.expenses.reduce((t, e) => t + e.amount, 0)
  return `Business: ${bizName} | Currency: ${currency}
Customers: ${data.customers.length} | ${data.customers.map(c => `${c.name}${c.company ? ` (${c.company})` : ''} - spent ${formatCurrency(c.total_spent, currency)}`).join(', ')}
Employees: ${data.employees.length} | ${data.employees.map(e => `${e.name} (${e.position}, ${e.status})`).join(', ')}
Revenue: ${formatCurrency(revenue, currency)} | Expenses: ${formatCurrency(expenses, currency)} | Profit: ${formatCurrency(revenue - expenses, currency)}
Tasks: ${data.tasks.length} total, ${data.tasks.filter(t => t.status !== 'completed').length} open
Sales: ${data.sales.map(s => `${s.description} ${formatCurrency(s.amount, currency)}`).slice(0, 5).join('; ')}
Expenses breakdown: ${data.expenses.map(e => `${e.description} ${formatCurrency(e.amount, currency)}`).slice(0, 5).join('; ')}
Meetings: ${data.meetings.map(m => `${m.title} (${m.date})`).slice(0, 3).join('; ')}`
}

export function BusinessSummary({ businessId }: Props) {
  const { activeBusiness } = useBusinessStore()
  const getData = useDataStore((s) => s.get)
  const bizData = getData(businessId)
  const currency = activeBusiness?.currency ?? 'GBP'
  const bizName = activeBusiness?.name ?? 'My Business'

  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    setLoading(true)
    setSummary('')
    setOpen(true)
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: bizName, context: buildContext(bizName, currency, bizData) }),
      })
      const data = await res.json()
      setSummary(data.summary ?? data.error ?? 'Failed to generate summary.')
    } catch (err) {
      setSummary(`Error: ${err instanceof Error ? err.message : 'Could not connect to AI'}`)
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([summary], { type: 'text/plain' }))
    a.download = `${bizName}-summary-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={generate}>
        <Sparkles className="h-4 w-4 text-indigo-500" />
        Generate Summary
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Business Summary</p>
                  <p className="text-xs text-gray-400">{bizName} · Groq Llama 3</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <p className="text-sm text-gray-400">Generating your business summary...</p>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">{summary}</pre>
              )}
            </div>

            {!loading && summary && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-xs text-gray-400">Copy and share, or paste into another AI</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={download}><Download className="h-3.5 w-3.5" />Download</Button>
                  <Button size="sm" onClick={copy}>{copied ? <><CheckCheck className="h-3.5 w-3.5" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy</>}</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
