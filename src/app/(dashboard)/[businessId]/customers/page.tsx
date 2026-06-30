'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useDataStore } from '@/stores/data-store'
import { Button } from '@/components/ui/button'
import { Modal, Field, inputCls } from '@/components/ui/modal'
import { formatCurrency, getInitials } from '@/lib/utils'
import { Plus, Pencil, Trash2, Users, Mail, Phone } from 'lucide-react'
import type { Customer } from '@/types'

const EMPTY = { name: '', email: '', phone: '', company: '', notes: '' }

export default function CustomersPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { get, addCustomer, updateCustomer, removeCustomer } = useDataStore()
  const { customers } = get(businessId)

  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState(EMPTY)

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const openAdd = () => { setForm(EMPTY); setAdding(true) }
  const openEdit = (c: Customer) => { setEditing(c); setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '', company: c.company ?? '', notes: c.notes ?? '' }) }

  const saveAdd = () => {
    if (!form.name.trim()) return
    addCustomer(businessId, { id: Date.now().toString(), business_id: businessId, total_spent: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...form })
    setAdding(false)
  }

  const saveEdit = () => {
    if (!editing) return
    updateCustomer(businessId, editing.id, { ...form, updated_at: new Date().toISOString() })
    setEditing(null)
  }

  const form_fields = (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Name *"><input className={inputCls} value={form.name} onChange={f('name')} placeholder="Full name" /></Field>
      <Field label="Company"><input className={inputCls} value={form.company} onChange={f('company')} placeholder="Company" /></Field>
      <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={f('email')} placeholder="email@company.com" /></Field>
      <Field label="Phone"><input className={inputCls} value={form.phone} onChange={f('phone')} placeholder="+44 7700 000000" /></Field>
      <div className="sm:col-span-2">
        <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={f('notes')} placeholder="Any notes..." /></Field>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-400">{customers.length} total</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" />Add Customer</Button>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <Users className="mb-3 h-8 w-8 text-gray-200" />
          <p className="font-medium text-gray-400">No customers yet</p>
          <p className="mt-1 text-sm text-gray-300">Click &ldquo;Add Customer&rdquo; to get started</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {customers.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {getInitials(c.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {c.company && <span>{c.company}</span>}
                  {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                  {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                </div>
                {c.notes && <p className="mt-0.5 text-xs italic text-gray-300">{c.notes}</p>}
              </div>
              <span className="text-sm font-semibold text-gray-700">{formatCurrency(c.total_spent)}</span>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="rounded p-1.5 text-gray-300 hover:bg-indigo-50 hover:text-indigo-600"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => removeCustomer(businessId, c.id)} className="rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal title="Add Customer" open={adding} onClose={() => setAdding(false)}
        footer={<><Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button><Button size="sm" onClick={saveAdd} disabled={!form.name.trim()}>Add</Button></>}>
        {form_fields}
      </Modal>

      <Modal title="Edit Customer" subtitle={editing?.name} open={!!editing} onClose={() => setEditing(null)}
        footer={<><Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button><Button size="sm" onClick={saveEdit}>Save</Button></>}>
        {form_fields}
      </Modal>
    </div>
  )
}
