'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBusinessStore } from '@/stores/business-store'
import { cn, getInitials } from '@/lib/utils'
import {
  LayoutDashboard, Users, UserCheck, TrendingUp, Receipt,
  FileText, CalendarDays, CheckSquare, Bot, StickyNote,
  Settings, Building2, Plus, ChevronRight, Sparkles,
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
    <aside className="flex h-screen w-60 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 px-4 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-white">Business Hub</span>
          <div className="flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
            <span className="text-xs text-indigo-400">AI Powered</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5">
        {/* Home */}
        <div className="px-3">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium',
              isActive('/')
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            Home
          </Link>
        </div>

        {/* Businesses */}
        <div className="mt-4 px-3">
          <div className="mb-1.5 flex items-center justify-between px-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Businesses
            </span>
            <Link
              href="/settings"
              className="rounded-md p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>

          {businesses.length === 0 ? (
            <Link
              href="/settings"
              className="mx-1 flex flex-col items-center rounded-lg border border-dashed border-slate-700 py-4 text-center hover:border-indigo-500 hover:bg-slate-800"
            >
              <Plus className="mb-1 h-4 w-4 text-slate-600" />
              <span className="text-xs text-slate-500">Add first business</span>
            </Link>
          ) : (
            <div className="space-y-0.5">
              {businesses.map((biz) => {
                const isThisBizActive = activeBusiness?.id === biz.id
                const isThisExpanded = expanded === biz.id

                return (
                  <div key={biz.id}>
                    <button
                      onClick={() => { setActiveBusiness(biz); toggle(biz.id) }}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all',
                        isThisBizActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <div className={cn(
                        'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold text-white',
                        isThisBizActive
                          ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
                          : 'bg-slate-700'
                      )}>
                        {getInitials(biz.name)}
                      </div>
                      <span className="flex-1 truncate text-xs">{biz.name}</span>
                      <ChevronRight className={cn(
                        'h-3 w-3 flex-shrink-0 text-slate-600 transition-transform duration-200',
                        isThisExpanded && 'rotate-90 text-slate-400'
                      )} />
                    </button>

                    {isThisExpanded && (
                      <div className="ml-3 mt-0.5 border-l border-slate-800 pl-2 pb-1">
                        {businessNavItems.map((item) => {
                          const href = `/${biz.id}/${item.path}`
                          const active = isActive(href)
                          return (
                            <Link
                              key={item.path}
                              href={href}
                              className={cn(
                                'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                                active
                                  ? item.accent
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                                    : 'bg-indigo-600 text-white'
                                  : item.accent
                                    ? 'text-indigo-400 hover:bg-slate-800 hover:text-indigo-300'
                                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
                              )}
                            >
                              <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
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
        <div className="mt-4 px-3 border-t border-slate-800 pt-4">
          {[
            { label: 'Notes & Reminders', icon: StickyNote, path: '/notifications' },
            { label: 'Settings',          icon: Settings,    path: '/settings' },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium',
                isActive(item.path)
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-4 py-3">
        <p className="text-xs text-slate-600">AI Business Hub v1.0</p>
      </div>
    </aside>
  )
}
