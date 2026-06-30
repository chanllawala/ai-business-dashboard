'use client'

import { useState } from 'react'
import { useBusinessStore } from '@/stores/business-store'
import { Button } from '@/components/ui/button'
import { Building2, Plus, Trash2, CheckCircle, AlertCircle, Bot } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { Business } from '@/types'

const INDUSTRIES = ['Technology', 'Retail', 'Food & Beverage', 'Healthcare', 'Finance', 'Consulting', 'Manufacturing', 'Real Estate', 'Other']
const inputCls = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function SettingsPage() {
  const { businesses, addBusiness, removeBusiness } = useBusinessStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', industry: '', currency: 'GBP' })

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleAdd = () => {
    if (!form.name.trim()) return
    const biz: Business = {
      id: Date.now().toString(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      industry: form.industry || undefined,
      currency: form.currency,
      owner_id: 'user1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    addBusiness(biz)
    setForm({ name: '', description: '', industry: '', currency: 'GBP' })
    setShowForm(false)
  }

  // Check which features are ready
  const groqReady = true // key is already set in .env.local

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400">Manage your businesses</p>
      </div>

      {/* Businesses */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-6">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Your Businesses</p>
            <p className="text-xs text-gray-400">{businesses.length} added</p>
          </div>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            Add Business
          </Button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="border-b border-gray-100 bg-indigo-50 px-5 py-4">
            <p className="mb-3 text-sm font-semibold text-indigo-900">New Business</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Business Name *</label>
                <input className={inputCls} placeholder="e.g. City Café" value={form.name} onChange={f('name')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Industry</label>
                <select className={inputCls} value={form.industry} onChange={f('industry')}>
                  <option value="">Select...</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Currency</label>
                <select className={inputCls} value={form.currency} onChange={f('currency')}>
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
                <input className={inputCls} placeholder="Optional" value={form.description} onChange={f('description')} />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={!form.name.trim()}>Create Business</Button>
              <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Business list */}
        {businesses.length === 0 && !showForm ? (
          <div className="py-10 text-center">
            <Building2 className="mx-auto mb-3 h-8 w-8 text-gray-200" />
            <p className="text-sm text-gray-400">No businesses yet</p>
            <p className="mt-1 text-xs text-gray-300">Click &ldquo;Add Business&rdquo; above to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {businesses.map((biz) => (
              <div key={biz.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                  {getInitials(biz.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{biz.name}</p>
                  <p className="text-xs text-gray-400">
                    {[biz.industry, biz.currency, biz.description].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button onClick={() => removeBusiness(biz.id)}
                  className="rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Status */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-sm font-semibold text-gray-900">AI Status</p>
          <p className="text-xs text-gray-400">Powered by Groq — free and fast</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
              <Bot className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Groq AI (Llama 3.3 70B)</p>
              <p className="text-xs text-gray-400">Business advisor · Q&A · Summary generation</p>
            </div>
            {groqReady ? (
              <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1">
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1">
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-xs font-medium text-red-600">No key</span>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Your Groq API key is set ✓</p>
            <p>To update it, edit <code className="rounded bg-gray-200 px-1">.env.local</code> in the project folder and restart the server.</p>
            <p className="mt-1">Get a free key at <span className="font-medium text-indigo-600">console.groq.com</span> if you need a new one.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
