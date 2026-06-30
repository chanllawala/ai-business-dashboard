'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useDataStore } from '@/stores/data-store'
import { useBusinessStore } from '@/stores/business-store'
import { Button } from '@/components/ui/button'
import { Modal, Field, inputCls } from '@/components/ui/modal'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import type { Sale } from '@/types'

const STATUS_STYLE = { completed: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', refunded: 'bg-red-100 text-red-600' }
const EMPTY = { description: '', amount: '', date: new Date().toISOString().slice(0, 10), status: 'completed' as Sale['status'] }

export default function SalesPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { get, addSale, removeSale } = useDataStore()
  const { activeBusiness } = useBusinessStore()
  const { sales } = get(businessId)
  const currency = activeBusiness?.currency ?? 'GBP'

  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const total = sales.filter((s) => s.status === 'completed').reduce((t, s) => t + s.amount, 0)

  const saveAdd = () => {
    if (!form.description.trim() || !form.amount) return
    addSale(businessId, { id: Date.now().toString(), business_id: businessId, ...form, amount: Number(form.amount), created_at: new Date().toISOString() })
    setForm(EMPTY)
    setAdding(false)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-400">{sales.length} transactions · {formatCurrency(total, currency)} total</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Add Sale</Button>
      </div>

      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <TrendingUp className="mb-3 h-8 w-8 text-gray-200" />
          <p className="font-medium text-gray-400">No sales recorded yet</p>
          <p className="mt-1 text-sm text-gray-300">Add your first sale to start tracking revenue</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {sales.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{s.description}</p>
                <p className="text-xs text-gray-400">{s.date}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[s.status]}`}>{s.status}</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(s.amount, currency)}</span>
              <button onClick={() => removeSale(businessId, s.id)} className="rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}

      <Modal title="Add Sale" open={adding} onClose={() => setAdding(false)}
        footer={<><Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button><Button size="sm" onClick={saveAdd} disabled={!form.description.trim() || !form.amount}>Add</Button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Description *"><input className={inputCls} value={form.description} onChange={f('description')} placeholder="e.g. Consulting Services June" /></Field></div>
          <Field label="Amount"><input className={inputCls} type="number" value={form.amount} onChange={f('amount')} placeholder="0.00" /></Field>
          <Field label="Date"><input className={inputCls} type="date" value={form.date} onChange={f('date')} /></Field>
          <Field label="Status"><select className={inputCls} value={form.status} onChange={f('status')}><option value="completed">Completed</option><option value="pending">Pending</option><option value="refunded">Refunded</option></select></Field>
        </div>
      </Modal>
    </div>
  )
}
