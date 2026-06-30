'use client'

import { useParams } from 'next/navigation'
import { useBusinessStore } from '@/stores/business-store'
import { useDataStore } from '@/stores/data-store'
import { BusinessSummary } from '@/components/dashboard/business-summary'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, UserCheck, CheckSquare, TrendingUp, Receipt, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
}

function StatCard({ label, value, sub, icon: Icon, color, bg, border }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${border} ${bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg === 'bg-white' ? 'bg-slate-50' : 'bg-white/60'}`}>
          <Icon className={`h-4.5 w-4.5 ${color}`} />
        </div>
      </div>
    </div>
  )
}

export default function OverviewPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { activeBusiness } = useBusinessStore()
  const biz = useDataStore((s) => s.get(businessId))
  const currency = activeBusiness?.currency ?? 'GBP'

  const revenue   = biz.sales.filter((s) => s.status === 'completed').reduce((t, s) => t + s.amount, 0)
  const expenses  = biz.expenses.reduce((t, e) => t + e.amount, 0)
  const profit    = revenue - expenses
  const openTasks = biz.tasks.filter((t) => t.status !== 'completed').length
  const isEmpty   = biz.customers.length === 0 && biz.employees.length === 0 && biz.sales.length === 0

  const stats: StatCardProps[] = [
    { label: 'Revenue',    value: formatCurrency(revenue, currency),  icon: TrendingUp,  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Expenses',   value: formatCurrency(expenses, currency), icon: Receipt,     color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100' },
    { label: 'Net Profit', value: formatCurrency(profit, currency),   icon: profit >= 0 ? TrendingUp : Minus, color: profit >= 0 ? 'text-indigo-700' : 'text-red-600', bg: profit >= 0 ? 'bg-indigo-50' : 'bg-red-50', border: profit >= 0 ? 'border-indigo-100' : 'border-red-100' },
    { label: 'Customers',  value: String(biz.customers.length),       icon: Users,       color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100' },
    { label: 'Employees',  value: String(biz.employees.length),       icon: UserCheck,   color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-100' },
    { label: 'Open Tasks', value: String(openTasks),                  icon: CheckSquare, color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  ]

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {activeBusiness?.name ?? 'Overview'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">Business snapshot</p>
        </div>
        <BusinessSummary businessId={businessId} />
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <TrendingUp className="h-7 w-7 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-400">Nothing here yet</p>
          <p className="mt-1 max-w-xs text-sm text-slate-300">
            Add customers, employees, sales or expenses using the sidebar — or ask the AI to do it for you
          </p>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          {/* Recent sales */}
          {biz.sales.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent Sales</h2>
              <div className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100 shadow-sm overflow-hidden">
                {biz.sales.slice(0, 6).map((sale) => (
                  <div key={sale.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className={`h-2 w-2 flex-shrink-0 rounded-full ${sale.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{sale.description}</p>
                      <p className="text-xs text-slate-400">{formatDate(sale.date)}</p>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${sale.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatCurrency(sale.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent tasks */}
          {biz.tasks.filter(t => t.status !== 'completed').length > 0 && (
            <div className="mt-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Open Tasks</h2>
              <div className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100 shadow-sm overflow-hidden">
                {biz.tasks.filter(t => t.status !== 'completed').slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-50 text-red-600' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {task.priority}
                    </div>
                    <p className="flex-1 text-sm text-slate-800 truncate">{task.title}</p>
                    {task.assigned_to && <p className="text-xs text-slate-400">{task.assigned_to}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
