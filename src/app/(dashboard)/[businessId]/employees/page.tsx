'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useDataStore } from '@/stores/data-store'
import { Button } from '@/components/ui/button'
import { Modal, Field, inputCls } from '@/components/ui/modal'
import { formatCurrency, getInitials } from '@/lib/utils'
import { Plus, Pencil, Trash2, UserCheck } from 'lucide-react'
import type { Employee } from '@/types'

const EMPTY = { name: '', email: '', phone: '', position: '', department: '', salary: '', status: 'active' as Employee['status'] }

export default function EmployeesPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { get, addEmployee, updateEmployee, removeEmployee } = useDataStore()
  const { employees } = get(businessId)

  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState(EMPTY)

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const openAdd = () => { setForm(EMPTY); setAdding(true) }
  const openEdit = (e: Employee) => { setEditing(e); setForm({ name: e.name, email: e.email, phone: e.phone ?? '', position: e.position, department: e.department ?? '', salary: String(e.salary), status: e.status }) }

  const saveAdd = () => {
    if (!form.name.trim()) return
    addEmployee(businessId, { id: Date.now().toString(), business_id: businessId, ...form, salary: Number(form.salary) || 0, start_date: new Date().toISOString().slice(0, 10), leave_days_remaining: 25, created_at: new Date().toISOString() })
    setAdding(false)
  }

  const saveEdit = () => {
    if (!editing) return
    updateEmployee(businessId, editing.id, { ...form, salary: Number(form.salary) || 0 })
    setEditing(null)
  }

  const STATUS_COLORS = { active: 'bg-green-100 text-green-700', on_leave: 'bg-amber-100 text-amber-700', inactive: 'bg-gray-100 text-gray-500' }

  const form_fields = (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Name *"><input className={inputCls} value={form.name} onChange={f('name')} placeholder="Full name" /></Field>
      <Field label="Position *"><input className={inputCls} value={form.position} onChange={f('position')} placeholder="e.g. Sales Manager" /></Field>
      <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={f('email')} placeholder="email@company.com" /></Field>
      <Field label="Department"><input className={inputCls} value={form.department} onChange={f('department')} placeholder="e.g. Sales" /></Field>
      <Field label="Annual Salary"><input className={inputCls} type="number" value={form.salary} onChange={f('salary')} placeholder="0" /></Field>
      <Field label="Status">
        <select className={inputCls} value={form.status} onChange={f('status')}>
          <option value="active">Active</option>
          <option value="on_leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </select>
      </Field>
    </div>
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-400">{employees.length} team members</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" />Add Employee</Button>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <UserCheck className="mb-3 h-8 w-8 text-gray-200" />
          <p className="font-medium text-gray-400">No employees yet</p>
          <p className="mt-1 text-sm text-gray-300">Add your team members to get started</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {employees.map((e) => (
            <div key={e.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700">
                {getInitials(e.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{e.name}</p>
                <p className="text-xs text-gray-400">{e.position}{e.department ? ` · ${e.department}` : ''}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[e.status]}`}>
                {e.status === 'on_leave' ? 'On Leave' : e.status}
              </span>
              {e.salary > 0 && <span className="text-sm font-semibold text-gray-600">{formatCurrency(e.salary)}/yr</span>}
              <div className="flex gap-1">
                <button onClick={() => openEdit(e)} className="rounded p-1.5 text-gray-300 hover:bg-indigo-50 hover:text-indigo-600"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => removeEmployee(businessId, e.id)} className="rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal title="Add Employee" open={adding} onClose={() => setAdding(false)}
        footer={<><Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button><Button size="sm" onClick={saveAdd} disabled={!form.name.trim()}>Add</Button></>}>
        {form_fields}
      </Modal>

      <Modal title="Edit Employee" subtitle={editing?.name} open={!!editing} onClose={() => setEditing(null)}
        footer={<><Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button><Button size="sm" onClick={saveEdit}>Save</Button></>}>
        {form_fields}
      </Modal>
    </div>
  )
}
