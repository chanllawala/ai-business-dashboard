'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useBusinessStore } from '@/stores/business-store'
import { useDataStore, type Note } from '@/stores/data-store'
import { Button } from '@/components/ui/button'
import { Modal, Field, inputCls } from '@/components/ui/modal'
import { StickyNote, Bell, Plus, Pencil, Trash2 } from 'lucide-react'

// If accessed outside a business context, use the active business
function useBusinessId() {
  const pathname = usePathname()
  const { activeBusiness } = useBusinessStore()
  // extract [businessId] from path if present, else fall back to active
  const match = pathname.match(/^\/([^/]+)\//)
  return match?.[1] ?? activeBusiness?.id ?? ''
}

const EMPTY = { content: '', type: 'note' as Note['type'] }

const TYPE_STYLE = {
  note:     { label: 'Note',     bg: 'bg-blue-50',   text: 'text-blue-700',  icon: StickyNote },
  reminder: { label: 'Reminder', bg: 'bg-amber-50', text: 'text-amber-700', icon: Bell },
}

export default function NotesPage() {
  const businessId = useBusinessId()
  const { get, addNote, updateNote, removeNote } = useDataStore()
  const notes = get(businessId).notes ?? []

  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [form, setForm] = useState(EMPTY)

  const openAdd = () => { setForm(EMPTY); setAdding(true) }
  const openEdit = (n: Note) => { setEditing(n); setForm({ content: n.content, type: n.type }) }

  const saveAdd = () => {
    if (!form.content.trim()) return
    addNote(businessId, { id: Date.now().toString(), created_at: new Date().toISOString(), ...form })
    setAdding(false)
  }

  const saveEdit = () => {
    if (!editing || !form.content.trim()) return
    updateNote(businessId, editing.id, form)
    setEditing(null)
  }

  const noteForm = (
    <div className="space-y-3">
      <Field label="Type">
        <div className="flex gap-2">
          {(['note', 'reminder'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setForm((p) => ({ ...p, type: t }))}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                form.type === t
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {t === 'note' ? '📝 Note' : '🔔 Reminder'}
            </button>
          ))}
        </div>
      </Field>
      <Field label={form.type === 'reminder' ? 'What should the AI remind you about?' : 'Note'}>
        <textarea
          className={inputCls}
          rows={4}
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          placeholder={
            form.type === 'reminder'
              ? 'e.g. Remind me to call the supplier about the price increase next week'
              : 'e.g. We agreed to review the marketing budget in Q3'
          }
        />
      </Field>
      {form.type === 'reminder' && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          The AI will see this reminder and bring it up when relevant — ask &ldquo;What should I be doing?&rdquo; or &ldquo;What are my reminders?&rdquo;
        </p>
      )}
    </div>
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notes & Reminders</h1>
          <p className="text-sm text-gray-400">
            {notes.length === 0 ? 'Nothing saved yet' : `${notes.length} item${notes.length !== 1 ? 's' : ''}`}
            {' · '}The AI reads these and factors them into its answers
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <StickyNote className="mb-3 h-8 w-8 text-gray-200" />
          <p className="font-medium text-gray-400">No notes yet</p>
          <p className="mt-1 max-w-sm text-sm text-gray-300">
            Add notes for things you want to remember, or reminders for the AI to bring up — like &ldquo;remind me to chase invoice #42&rdquo;
          </p>
          <Button size="sm" variant="secondary" className="mt-4" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add your first note
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const style = TYPE_STYLE[note.type]
            const Icon = style.icon
            return (
              <div key={note.id} className={`flex gap-3 rounded-xl border border-gray-200 bg-white p-4`}>
                <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                  <Icon className={`h-4 w-4 ${style.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                    <span className="text-xs text-gray-300">
                      {new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">{note.content}</p>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <button onClick={() => openEdit(note)} className="rounded p-1.5 text-gray-300 hover:bg-indigo-50 hover:text-indigo-600">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => removeNote(businessId, note.id)} className="rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal title="Add Note or Reminder" open={adding} onClose={() => setAdding(false)}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" onClick={saveAdd} disabled={!form.content.trim()}>Save</Button>
          </>
        }>
        {noteForm}
      </Modal>

      <Modal title="Edit" subtitle={editing?.type} open={!!editing} onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button size="sm" onClick={saveEdit} disabled={!form.content.trim()}>Save</Button>
          </>
        }>
        {noteForm}
      </Modal>
    </div>
  )
}
