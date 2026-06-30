'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useDataStore } from '@/stores/data-store'
import { useBusinessStore } from '@/stores/business-store'
import { Button } from '@/components/ui/button'
import { Modal, Field, inputCls } from '@/components/ui/modal'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, Receipt } from 'lucide-react'
import type { Expense } from '@/types'

const CATS = ['rent', 'utilities', 'marketing', 'payroll', 'suppliers', 'other'] as const
const EMPTY = { description: '', amount: '', category: 'other' as Expense['category'], date: new Date().toISOString().slice(0, 10) }

export default function ExpensesPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { get, addExpense, removeExpense } = useDataStore()
  const { activeBusiness } = useBusinessStore()
  const { expenses } = get(businessId)
  const currency = activeBusiness?.currency ?? 'GBP'

  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const total = expenses.reduce((t, e) => t + e.amount, 0)

  const saveAdd = () => {
    if (!form.description.trim() || !form.amount) return
    addExpense(businessId, { id: Date.now().toString(), business_id: businessId, ...form, amount: Number(form.amount), created_at: new Date().toISOString() })
    setForm(EMPTY)
    setAdding(false)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-400">{expenses.length} entries · {formatCurrency(total, currency)} total</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Add Expense</Button>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <Receipt className="mb-3 h-8 w-8 text-gray-200" />
          <p className="font-medium text-gray-400">No expenses yet</p>
          <p className="mt-1 text-sm text-gray-300">Add your first expense to start tracking</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{e.description}</p>
                <p className="text-xs text-gray-400">{e.date} · <span className="capitalize">{e.category}</span></p>
              </div>
              <span className="text-sm font-bold text-red-600">−{formatCurrency(e.amount, currency)}</span>
              <button onClick={() => removeExpense(businessId, e.id)} className="rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}

      <Modal title="Add Expense" open={adding} onClose={() => setAdding(false)}
        footer={<><Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button><Button size="sm" onClick={saveAdd} disabled={!form.description.trim() || !form.amount}>Add</Button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Description *"><input className={inputCls} value={form.description} onChange={f('description')} placeholder="e.g. Office rent June" /></Field></div>
          <Field label="Amount"><input className={inputCls} type="number" value={form.amount} onChange={f('amount')} placeholder="0.00" /></Field>
          <Field label="Date"><input className={inputCls} type="date" value={form.date} onChange={f('date')} /></Field>
          <Field label="Category">
            <select className={inputCls} value={form.category} onChange={f('category')}>
              {CATS.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
