'use client'

import { useBusinessStore } from '@/stores/business-store'
import { useDataStore } from '@/stores/data-store'
import { formatCurrency, getInitials } from '@/lib/utils'
import { TrendingUp, CheckSquare, Users, Plus, Bot, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Business } from '@/types'

function BusinessCard({ business }: { business: Business }) {
  const biz = useDataStore((s) => s.get(business.id))
  const { setActiveBusiness } = useBusinessStore()
  const revenue  = biz.sales.filter((s) => s.status === 'completed').reduce((t, s) => t + s.amount, 0)
  const expenses = biz.expenses.reduce((t, e) => t + e.amount, 0)
  const profit   = revenue - expenses
  const openTasks = biz.tasks.filter((t) => t.status !== 'completed').length

  return (
    <div className="group flex flex-col rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-xl shadow-slate-900/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5">
      {/* Card top accent */}
      <div className="h-2 w-full rounded-t-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600" />

      <div className="flex-1 p-6">
        {/* Business header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-base font-black text-white shadow-lg shadow-cyan-500/30">
              {getInitials(business.name)}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">{business.name}</p>
              {business.industry && (
                <p className="text-xs text-slate-500 mt-1 font-medium">{business.industry}</p>
              )}
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {business.currency}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 text-center border border-emerald-100">
            <TrendingUp className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
            <p className="text-xs text-emerald-700 font-bold mb-1">Revenue</p>
            <p className="text-sm font-black text-emerald-800 tabular-nums">
              {formatCurrency(revenue, business.currency)}
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 text-center border border-blue-100">
            <Users className="mx-auto mb-2 h-5 w-5 text-blue-600" />
            <p className="text-xs text-blue-700 font-bold mb-1">Customers</p>
            <p className="text-sm font-black text-blue-800">{biz.customers.length}</p>
          </div>
          <div className={`rounded-2xl p-4 text-center border ${openTasks > 0 ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-100' : 'bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-100'}`}>
            <CheckSquare className={`mx-auto mb-2 h-5 w-5 ${openTasks > 0 ? 'text-amber-600' : 'text-slate-500'}`} />
            <p className={`text-xs font-bold mb-1 ${openTasks > 0 ? 'text-amber-700' : 'text-slate-600'}`}>Tasks</p>
            <p className={`text-sm font-black ${openTasks > 0 ? 'text-amber-800' : 'text-slate-700'}`}>{openTasks} open</p>
          </div>
        </div>

        {/* Profit indicator */}
        {(revenue > 0 || expenses > 0) && (
          <div className={`mb-5 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black ${profit >= 0 ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-800 border border-emerald-100' : 'bg-gradient-to-r from-red-50 to-red-100/50 text-red-800 border border-red-100'}`}>
            <span>Net Profit</span>
            <span className="tabular-nums text-lg">
              {profit >= 0 ? '+' : ''}{formatCurrency(profit, business.currency)}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 border-t border-slate-100 p-5">
        <Link
          href={`/${business.id}/overview`}
          onClick={() => setActiveBusiness(business)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-200"
        >
          Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={`/${business.id}/ai-assistant`}
          onClick={() => setActiveBusiness(business)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-bold text-white hover:from-cyan-500 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all duration-200"
        >
          <Bot className="h-4 w-4" />
          Ask AI
        </Link>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { businesses } = useBusinessStore()

  if (businesses.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-8 p-10 text-center">
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-2xl shadow-cyan-500/40">
            <Zap className="h-14 w-14 text-white fill-white" />
          </div>
          <div className="absolute -right-2 -top-2 h-7 w-7 animate-pulse rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Welcome to NovaBiz</h1>
          <p className="mt-3 text-base text-slate-600 max-w-md leading-relaxed">
            Add your first business to get started. Then manage customers, sales, employees — and let your AI advisor handle the rest!
          </p>
        </div>
        <Link href="/settings">
          <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-xl shadow-cyan-500/25">
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Business
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Your Businesses</h1>
        <p className="mt-2 text-sm text-slate-600 font-medium">
          {businesses.length} business{businesses.length !== 1 ? 'es' : ''} — Select one or use the sidebar
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {businesses.map((biz) => (
          <BusinessCard key={biz.id} business={biz} />
        ))}

        {/* Add new card */}
        <Link
          href="/settings"
          className="flex min-h-[250px] flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-slate-300 bg-white/50 p-8 text-center transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-50/60 group"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 group-hover:border-cyan-400 transition-colors duration-300">
            <Plus className="h-7 w-7 text-slate-400 group-hover:text-cyan-500 transition-colors duration-300" />
          </div>
          <p className="text-base font-bold text-slate-500 group-hover:text-cyan-600 transition-colors duration-300">
            Add another business
          </p>
        </Link>
      </div>
    </div>
  )
}
