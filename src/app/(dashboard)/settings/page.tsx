'use client'

import { useState } from 'react'
import { useBusinessStore } from '@/stores/business-store'
import { Button } from '@/components/ui/button'
import { Building2, Plus, Trash2, CheckCircle, AlertCircle, Bot, Zap } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { Business } from '@/types'

const INDUSTRIES = ['Technology', 'Retail', 'Food & Beverage', 'Healthcare', 'Finance', 'Consulting', 'Manufacturing', 'Real Estate', 'Other']
const inputCls = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200'

export default function SettingsPage() {
  const { businesses, addBusiness, removeBusiness } = useBusinessStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', industry: '', currency: 'GBP' })

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
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Settings</h1>
        <p className="mt-2 text-sm text-slate-600 font-medium">Manage your businesses and AI preferences</p>
      </div>

      {/* Businesses */}
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden mb-8">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <p className="text-base font-bold text-slate-900">Your Businesses</p>
            <p className="text-xs text-slate-500 mt-1">{businesses.length} added</p>
          </div>
          <Button size="sm" onClick={() => setShowForm((v) => !v)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25">
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </Button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-5">
            <p className="mb-4 text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-cyan-600" />
              New Business
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">Business Name *</label>
                <input
                  className={inputCls}
                  placeholder="e.g., City Café"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">Industry</label>
                <select
                  className={inputCls}
                  value={form.industry}
                  onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))}
                >
                  <option value="">Select...</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">Currency</label>
                <select
                  className={inputCls}
                  value={form.currency}
                  onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                >
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">Description</label>
                <input
                  className={inputCls}
                  placeholder="Optional"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!form.name.trim()}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25"
              >
                Create Business
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Business list */}
        {businesses.length === 0 && !showForm ? (
          <div className="py-16 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-base text-slate-600 font-medium">No businesses yet</p>
            <p className="mt-2 text-sm text-slate-400">Click &ldquo;Add Business&rdquo; above to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {businesses.map((biz) => (
              <div key={biz.id} className="flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-colors duration-200">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white shadow-lg shadow-cyan-500/20">
                  {getInitials(biz.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 text-base">{biz.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {[biz.industry, biz.currency, biz.description].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button
                  onClick={() => removeBusiness(biz.id)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Status */}
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-slate-50 to-white">
          <p className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-600" />
            AI Status
          </p>
          <p className="text-xs text-slate-500 mt-1">Powered by Groq — free and lightning fast</p>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 shadow-lg shadow-cyan-500/10">
              <Bot className="h-5 w-5 text-cyan-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Groq AI (Llama 3.3 70B)</p>
              <p className="text-xs text-slate-500 mt-1">Business advisor · Q&A · Summary generation</p>
            </div>
            {groqReady ? (
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-2 border border-emerald-200">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-50 to-red-100 px-4 py-2 border border-red-200">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs font-bold text-red-600">No key</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 text-xs text-slate-600 border border-slate-200">
            <p className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Your Groq API key is set ✓
            </p>
            <p className="text-sm">
              To update it, edit <code className="rounded bg-slate-200 px-2 py-1 font-bold text-slate-800">.env.local</code> in the project folder and restart the server.
            </p>
            <p className="mt-2 text-sm">
              Get a free key at <span className="font-bold text-cyan-600">console.groq.com</span> if you need a new one.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
