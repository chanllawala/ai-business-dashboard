'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const EVENTS = [
  { date: '2025-06-26', title: 'Invoice #1038 overdue', type: 'danger' },
  { date: '2025-06-27', title: 'Sarah Johnson on leave', type: 'warning' },
  { date: '2025-06-30', title: 'VAT return due', type: 'warning' },
  { date: '2025-07-01', title: 'Q3 starts', type: 'info' },
  { date: '2025-07-05', title: 'Q2 report due (James)', type: 'warning' },
]

type BadgeVariant = 'danger' | 'warning' | 'info' | 'default'

export default function CalendarPage() {
  const today = new Date()
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = current.getFullYear()
  const month = current.getMonth()
  const monthName = current.toLocaleString('default', { month: 'long', year: 'numeric' })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    if (i < firstDay) return null
    return i - firstDay + 1
  })

  const getEvents = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return EVENTS.filter((e) => e.date === dateStr)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="mt-1 text-sm text-gray-500">View tasks, meetings, and deadlines</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {/* Month Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setCurrent(new Date(year, month - 1, 1))}
              className="rounded-lg p-1.5 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-semibold text-gray-900">{monthName}</h2>
            <button
              onClick={() => setCurrent(new Date(year, month + 1, 1))}
              className="rounded-lg p-1.5 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="mb-2 grid grid-cols-7 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs font-medium text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
            {cells.map((day, i) => {
              const events = day ? getEvents(day) : []
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()

              return (
                <div
                  key={i}
                  className={`min-h-[70px] bg-white p-1.5 ${!day ? 'opacity-0' : ''}`}
                >
                  {day && (
                    <>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          isToday
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {events.map((e, j) => (
                          <div
                            key={j}
                            className={`truncate rounded px-1 py-0.5 text-xs ${
                              e.type === 'danger'
                                ? 'bg-red-100 text-red-700'
                                : e.type === 'warning'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {e.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Upcoming Events</h3>
          <div className="space-y-3">
            {EVENTS.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className={`w-1 flex-shrink-0 rounded-full ${
                    event.type === 'danger'
                      ? 'bg-red-400'
                      : event.type === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-blue-400'
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(event.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
