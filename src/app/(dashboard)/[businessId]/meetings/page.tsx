'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useDataStore } from '@/stores/data-store'
import { Button } from '@/components/ui/button'
import { Modal, Field, inputCls } from '@/components/ui/modal'
import { Plus, Trash2, CalendarDays } from 'lucide-react'
import type { Meeting } from '@/types'

const EMPTY = { title: '', date: new Date().toISOString().slice(0, 10), attendees: '', minutes: '', decisions: '' }

export default function MeetingsPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { get, addMeeting, removeMeeting } = useDataStore()
  const { meetings } = get(businessId)

  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState<Meeting | null>(null)
  const [form, setForm] = useState(EMPTY)

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const saveAdd = () => {
    if (!form.title.trim()) return
    addMeeting(businessId, {
      id: Date.now().toString(),
      business_id: businessId,
      title: form.title,
      date: form.date,
      attendees: form.attendees.split(',').map((s) => s.trim()).filter(Boolean),
      minutes: form.minutes,
      decisions: form.decisions.split('\n').filter(Boolean),
      action_items: [],
      created_at: new Date().toISOString(),
    })
    setForm(EMPTY)
    setAdding(false)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Meetings</h1>
          <p className="text-sm text-gray-400">{meetings.length} recorded</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Record Meeting</Button>
      </div>

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <CalendarDays className="mb-3 h-8 w-8 text-gray-200" />
          <p className="font-medium text-gray-400">No meetings recorded</p>
          <p className="mt-1 text-sm text-gray-300">Record meeting minutes and decisions here</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            {meetings.map((m) => (
              <button key={m.id} onClick={() => setSelected(m === selected ? null : m)}
                className={`w-full rounded-xl border p-4 text-left transition-all hover:shadow-sm ${selected?.id === m.id ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                <p className="mt-1 text-xs text-gray-400">{m.date} · {m.attendees.length} attendees</p>
              </button>
            ))}
          </div>

          {selected && (
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">{selected.title}</h2>
                    <p className="text-xs text-gray-400">{selected.date}</p>
                  </div>
                  <button onClick={() => { removeMeeting(businessId, selected.id); setSelected(null) }} className="rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                {selected.attendees.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {selected.attendees.map((a) => <span key={a} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{a}</span>)}
                  </div>
                )}
                {selected.minutes && <p className="mt-4 text-sm text-gray-700 leading-relaxed">{selected.minutes}</p>}
                {selected.decisions && selected.decisions.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Decisions</p>
                    <ul className="space-y-1">
                      {selected.decisions.map((d, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-indigo-100 text-center text-xs font-bold text-indigo-700">{i + 1}</span>{d}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal title="Record Meeting" open={adding} onClose={() => setAdding(false)}
        footer={<><Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button><Button size="sm" onClick={saveAdd} disabled={!form.title.trim()}>Save</Button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title *"><input className={inputCls} value={form.title} onChange={f('title')} placeholder="e.g. Q2 Review" /></Field>
          <Field label="Date"><input className={inputCls} type="date" value={form.date} onChange={f('date')} /></Field>
          <div className="sm:col-span-2"><Field label="Attendees (comma-separated)"><input className={inputCls} value={form.attendees} onChange={f('attendees')} placeholder="John, Sarah, Priya" /></Field></div>
          <div className="sm:col-span-2"><Field label="Minutes / Notes"><textarea className={inputCls} rows={3} value={form.minutes} onChange={f('minutes') as never} placeholder="What was discussed..." /></Field></div>
          <div className="sm:col-span-2"><Field label="Decisions (one per line)"><textarea className={inputCls} rows={3} value={form.decisions} onChange={f('decisions') as never} placeholder="Increase marketing budget&#10;Hire 2 developers" /></Field></div>
        </div>
      </Modal>
    </div>
  )
}
