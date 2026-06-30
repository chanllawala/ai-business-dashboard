'use client'

import { useBusinessStore } from '@/stores/business-store'
import { useDataStore } from '@/stores/data-store'
import { formatCurrency, getInitials } from '@/lib/utils'
import { TrendingUp, CheckSquare, Users, Plus, Bot, ArrowRight } from 'lucide-react'
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
    <div className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Card top accent */}
      <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-indigo-500 to-violet-500" />

      <div className="flex-1 p-5">
        {/* Business header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm shadow-indigo-500/25">
              {getInitials(business.name)}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{business.name}</p>
              {business.industry && (
                <p className="text-xs text-slate-400">{business.industry}</p>
              )}
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {business.currency}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <TrendingUp className="mx-auto mb-1 h-3.5 w-3.5 text-emerald-600" />
            <p className="text-xs text-emerald-600 font-medium mb-0.5">Revenue</p>
            <p className="text-xs font-bold text-emerald-800 tabular-nums">
              {formatCurrency(revenue, business.currency)}
            </p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-center">
            <Users className="mx-auto mb-1 h-3.5 w-3.5 text-blue-600" />
            <p className="text-xs text-blue-600 font-medium mb-0.5">Customers</p>
            <p className="text-xs font-bold text-blue-800">{biz.customers.length}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${openTasks > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
            <CheckSquare className={`mx-auto mb-1 h-3.5 w-3.5 ${openTasks > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            <p className={`text-xs font-medium mb-0.5 ${openTasks > 0 ? 'text-amber-600' : 'text-slate-400'}`}>Tasks</p>
            <p className={`text-xs font-bold ${openTasks > 0 ? 'text-amber-800' : 'text-slate-500'}`}>{openTasks} open</p>
          </div>
        </div>

        {/* Profit indicator */}
        {(revenue > 0 || expenses > 0) && (
          <div className={`mb-4 flex items-center justify-between rounded-xl px-3 py-2 text-xs ${profit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <span className={profit >= 0 ? 'text-emerald-700' : 'text-red-700'}>Net profit</span>
            <span className={`font-bold tabular-nums ${profit >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
              {profit >= 0 ? '+' : ''}{formatCurrency(profit, business.currency)}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 border-t border-slate-100 p-4">
        <Link
          href={`/${business.id}/overview`}
          onClick={() => setActiveBusiness(business)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          Dashboard
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href={`/${business.id}/ai-assistant`}
          onClick={() => setActiveBusiness(business)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2 text-xs font-medium text-white hover:from-indigo-500 hover:to-violet-500 shadow-sm shadow-indigo-500/25 transition-all"
        >
          <Bot className="h-3.5 w-3.5" />
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
      <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/30">
            <Bot className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -right-1 -top-1 h-5 w-5 animate-pulse rounded-full bg-emerald-400 shadow-sm" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to AI Business Hub</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
            Add your first business to get started. Then add customers, sales, and expenses — your AI advisor will answer questions and give you real advice.
          </p>
        </div>
        <Link href="/settings">
          <Button size="lg">
            <Plus className="h-4 w-4" />
            Add Your First Business
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Your Businesses</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          {businesses.length} business{businesses.length !== 1 ? 'es' : ''} · Select one or use the sidebar
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {businesses.map((biz) => (
          <BusinessCard key={biz.id} business={biz} />
        ))}

        {/* Add new card */}
        <Link
          href="/settings"
          className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition-all hover:border-indigo-300 hover:bg-indigo-50/50 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 group-hover:border-indigo-400 transition-colors">
            <Plus className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <p className="text-sm font-medium text-slate-400 group-hover:text-indigo-600 transition-colors">
            Add another business
          </p>
        </Link>
      </div>
    </div>
  )
}
