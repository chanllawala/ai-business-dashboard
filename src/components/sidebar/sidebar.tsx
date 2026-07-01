'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBusinessStore } from '@/stores/business-store'
import { cn, getInitials } from '@/lib/utils'
import {
  LayoutDashboard, Users, UserCheck, TrendingUp, Receipt,
  FileText, CalendarDays, CheckSquare, Bot, StickyNote,
  Settings, Zap, Plus, ChevronRight, Sparkles,
} from 'lucide-react'
import { useState } from 'react'

const businessNavItems = [
  { label: 'Overview',     icon: LayoutDashboard, path: 'overview' },
  { label: 'Customers',    icon: Users,            path: 'customers' },
  { label: 'Employees',    icon: UserCheck,        path: 'employees' },
  { label: 'Sales',        icon: TrendingUp,       path: 'sales' },
  { label: 'Expenses',     icon: Receipt,          path: 'expenses' },
  { label: 'Documents',    icon: FileText,         path: 'documents' },
  { label: 'Meetings',     icon: CalendarDays,     path: 'meetings' },
  { label: 'Tasks',        icon: CheckSquare,      path: 'tasks' },
  { label: 'AI Assistant', icon: Bot,              path: 'ai-assistant', accent: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { businesses, activeBusiness, setActiveBusiness } = useBusinessStore()
  const [expanded, setExpanded] = useState<string | null>(activeBusiness?.id ?? null)

  const toggle = (id: string) => setExpanded((p) => (p === id ? null : id))

  const isActive = (href: string) => pathname === href

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/50">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-800/50 bg-gradient-to-r from-slate-900 to-slate-950">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl shadow-cyan-500/30">
          <Zap className="h-6 w-6 text-white fill-white" />
        </div>
        <div>
          <span className="text-lg font-extrabold text-white tracking-tight">NovaBiz</span>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span className="text-[11px] font-semibold text-cyan-400 tracking-wide">AI-POWERED</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-5 space-y-1">
        {/* Home */}
        <div className="px-4">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
              isActive('/')
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-white hover:shadow-md'
            )}
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            Home
          </Link>
        </div>

        {/* Businesses */}
        <div className="mt-6 px-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Your Businesses
            </span>
            <Link
              href="/settings"
              className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all"
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>

          {businesses.length === 0 ? (
            <Link
              href="/settings"
              className="mx-1 flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-700/60 py-6 text-center hover:border-cyan-500/60 hover:bg-slate-800/60 transition-all duration-200"
            >
              <Plus className="mb-2 h-5 w-5 text-slate-500" />
              <span className="text-xs font-medium text-slate-500">Add your first business</span>
            </Link>
          ) : (
            <div className="space-y-1">
              {businesses.map((biz) => {
                const isThisBizActive = activeBusiness?.id === biz.id
                const isThisExpanded = expanded === biz.id

                return (
                  <div key={biz.id} className="space-y-1">
                    <button
                      onClick={() => { setActiveBusiness(biz); toggle(biz.id) }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition-all duration-200',
                        isThisBizActive
                          ? 'bg-slate-800/80 text-white shadow-md'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white hover:shadow-sm'
                      )}
                    >
                      <div className={cn(
                        'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-black text-white',
                        isThisBizActive
                          ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-700'
                      )}>
                        {getInitials(biz.name)}
                      </div>
                      <span className="flex-1 truncate text-sm">{biz.name}</span>
                      <ChevronRight className={cn(
                        'h-4 w-4 flex-shrink-0 text-slate-600 transition-transform duration-200',
                        isThisExpanded && 'rotate-90 text-cyan-400'
                      )} />
                    </button>

                    {isThisExpanded && (
                      <div className="ml-4 border-l-2 border-slate-700/50 pl-3 pb-1 space-y-0.5">
                        {businessNavItems.map((item) => {
                          const href = `/${biz.id}/${item.path}`
                          const active = isActive(href)
                          return (
                            <Link
                              key={item.path}
                              href={href}
                              className={cn(
                                'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200',
                                active
                                  ? item.accent
                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                                    : 'bg-slate-700/80 text-white'
                                  : item.accent
                                    ? 'text-cyan-400 hover:bg-slate-800/60 hover:text-cyan-300'
                                    : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-200'
                              )}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              {item.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom links */}
        <div className="mt-6 px-4 border-t border-slate-800/50 pt-5">
          {[
            { label: 'Notes & Reminders', icon: StickyNote, path: '/notifications' },
            { label: 'Settings',          icon: Settings,    path: '/settings' },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold mb-1.5 transition-all duration-200',
                isActive(item.path)
                  ? 'bg-slate-800/80 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white hover:shadow-sm'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800/50 bg-gradient-to-r from-slate-900 to-slate-950 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 shadow-md">
            <Zap className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white leading-tight">Welcome Back!</p>
            <p className="text-[11px] text-cyan-400 font-medium">NovaBiz Pro</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
        </div>
      </div>
    </aside>
  )
}
