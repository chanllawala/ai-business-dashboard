'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useDataStore } from '@/stores/data-store'
import { Button } from '@/components/ui/button'
import { Modal, Field, inputCls } from '@/components/ui/modal'
import { Plus, Pencil, Trash2, CheckSquare } from 'lucide-react'
import type { Task, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'

const COLS: { id: TaskStatus; label: string; bg: string }[] = [
  { id: 'todo',      label: 'To Do',       bg: 'bg-gray-50' },
  { id: 'doing',     label: 'In Progress', bg: 'bg-blue-50' },
  { id: 'completed', label: 'Completed',   bg: 'bg-green-50' },
]

const PRIORITY = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-gray-100 text-gray-500' }

const EMPTY_FORM = { title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' as Task['priority'], status: 'todo' as TaskStatus }

export default function TasksPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { get, addTask, updateTask, removeTask } = useDataStore()
  const { tasks } = get(businessId)

  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const f = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const openAdd = () => { setForm(EMPTY_FORM); setAdding(true) }
  const openEdit = (t: Task) => { setEditing(t); setForm({ title: t.title, description: t.description ?? '', assigned_to: t.assigned_to ?? '', due_date: t.due_date ?? '', priority: t.priority, status: t.status }) }

  const saveAdd = () => {
    if (!form.title.trim()) return
    addTask(businessId, { id: Date.now().toString(), business_id: businessId, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...form })
    setAdding(false)
  }

  const saveEdit = () => {
    if (!editing) return
    updateTask(businessId, editing.id, form)
    setEditing(null)
  }

  const task_form = (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2"><Field label="Title *"><input className={inputCls} value={form.title} onChange={f('title')} placeholder="What needs to be done?" /></Field></div>
      <div className="sm:col-span-2"><Field label="Description"><textarea className={inputCls} rows={2} value={form.description} onChange={f('description') as never} placeholder="More details..." /></Field></div>
      <Field label="Assigned To"><input className={inputCls} value={form.assigned_to} onChange={f('assigned_to')} placeholder="Name" /></Field>
      <Field label="Due Date"><input className={inputCls} type="date" value={form.due_date} onChange={f('due_date')} /></Field>
      <Field label="Priority"><select className={inputCls} value={form.priority} onChange={f('priority')}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></Field>
      <Field label="Status"><select className={inputCls} value={form.status} onChange={f('status')}><option value="todo">To Do</option><option value="doing">In Progress</option><option value="completed">Completed</option></select></Field>
    </div>
  )

  if (tasks.length === 0 && !adding) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" />Add Task</Button>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <CheckSquare className="mb-3 h-8 w-8 text-gray-200" />
          <p className="font-medium text-gray-400">No tasks yet</p>
          <p className="mt-1 text-sm text-gray-300">Add your first task to get started</p>
        </div>
        <Modal title="New Task" open={adding} onClose={() => setAdding(false)}
          footer={<><Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button><Button size="sm" onClick={saveAdd} disabled={!form.title.trim()}>Add</Button></>}>
          {task_form}
        </Modal>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-400">{tasks.filter((t) => t.status !== 'completed').length} open</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" />Add Task</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {COLS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          return (
            <div key={col.id}>
              <div className={cn('mb-2 flex items-center gap-2 rounded-lg px-3 py-2', col.bg)}>
                <span className="text-xs font-semibold text-gray-600">{col.label}</span>
                <span className="ml-auto text-xs text-gray-400">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((t) => (
                  <div key={t.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-1">
                      <p className="flex-1 text-xs font-medium text-gray-900">{t.title}</p>
                      <div className="flex gap-0.5">
                        <button onClick={() => openEdit(t)} className="rounded p-1 text-gray-300 hover:text-indigo-500"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => removeTask(businessId, t.id)} className="rounded p-1 text-gray-300 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={cn('rounded-full px-1.5 py-0.5 text-xs', PRIORITY[t.priority])}>{t.priority}</span>
                      {t.assigned_to && <span className="text-xs text-gray-400">{t.assigned_to}</span>}
                    </div>
                    <div className="mt-2 flex gap-1">
                      {COLS.filter((c) => c.id !== col.id).map((target) => (
                        <button key={target.id} onClick={() => updateTask(businessId, t.id, { status: target.id })}
                          className="flex-1 rounded border border-gray-100 py-0.5 text-xs text-gray-400 hover:bg-gray-50">
                          → {target.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-100 py-6 text-center text-xs text-gray-200">Empty</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Modal title="New Task" open={adding} onClose={() => setAdding(false)}
        footer={<><Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button><Button size="sm" onClick={saveAdd} disabled={!form.title.trim()}>Add</Button></>}>
        {task_form}
      </Modal>
      <Modal title="Edit Task" subtitle={editing?.title} open={!!editing} onClose={() => setEditing(null)}
        footer={<><Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button><Button size="sm" onClick={saveEdit}>Save</Button></>}>
        {task_form}
      </Modal>
    </div>
  )
}
