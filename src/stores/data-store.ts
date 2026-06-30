import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Customer, Employee, Task, Sale, Expense, Meeting, Document } from '@/types'

export interface Note {
  id: string
  content: string
  type: 'note' | 'reminder'
  created_at: string
}

export interface BusinessData {
  customers: Customer[]
  employees: Employee[]
  tasks: Task[]
  sales: Sale[]
  expenses: Expense[]
  meetings: Meeting[]
  documents: Document[]
  notes: Note[]
}

const empty = (): BusinessData => ({
  customers: [],
  employees: [],
  tasks: [],
  sales: [],
  expenses: [],
  meetings: [],
  documents: [],
  notes: [],
})

interface DataStore {
  data: Record<string, BusinessData>
  get: (businessId: string) => BusinessData
  addCustomer: (businessId: string, c: Customer) => void
  updateCustomer: (businessId: string, id: string, patch: Partial<Customer>) => void
  removeCustomer: (businessId: string, id: string) => void
  addEmployee: (businessId: string, e: Employee) => void
  updateEmployee: (businessId: string, id: string, patch: Partial<Employee>) => void
  removeEmployee: (businessId: string, id: string) => void
  addTask: (businessId: string, t: Task) => void
  updateTask: (businessId: string, id: string, patch: Partial<Task>) => void
  removeTask: (businessId: string, id: string) => void
  addSale: (businessId: string, s: Sale) => void
  removeSale: (businessId: string, id: string) => void
  addExpense: (businessId: string, e: Expense) => void
  removeExpense: (businessId: string, id: string) => void
  addMeeting: (businessId: string, m: Meeting) => void
  removeMeeting: (businessId: string, id: string) => void
  addDocument: (businessId: string, d: Document) => void
  removeDocument: (businessId: string, id: string) => void
  addNote: (businessId: string, n: Note) => void
  updateNote: (businessId: string, id: string, patch: Partial<Note>) => void
  removeNote: (businessId: string, id: string) => void
}

const patch = <T extends { id: string }>(arr: T[], id: string, update: Partial<T>): T[] =>
  arr.map((x) => (x.id === id ? { ...x, ...update } : x))

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      data: {},
      get: (businessId) => get().data[businessId] ?? empty(),

      addCustomer: (bid, c) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), customers: [c, ...(s.data[bid]?.customers ?? [])] } } })),
      updateCustomer: (bid, id, p) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), customers: patch(s.data[bid]?.customers ?? [], id, p) } } })),
      removeCustomer: (bid, id) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), customers: (s.data[bid]?.customers ?? []).filter((x) => x.id !== id) } } })),

      addEmployee: (bid, e) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), employees: [e, ...(s.data[bid]?.employees ?? [])] } } })),
      updateEmployee: (bid, id, p) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), employees: patch(s.data[bid]?.employees ?? [], id, p) } } })),
      removeEmployee: (bid, id) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), employees: (s.data[bid]?.employees ?? []).filter((x) => x.id !== id) } } })),

      addTask: (bid, t) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), tasks: [...(s.data[bid]?.tasks ?? []), t] } } })),
      updateTask: (bid, id, p) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), tasks: patch(s.data[bid]?.tasks ?? [], id, p) } } })),
      removeTask: (bid, id) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), tasks: (s.data[bid]?.tasks ?? []).filter((x) => x.id !== id) } } })),

      addSale: (bid, x) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), sales: [x, ...(s.data[bid]?.sales ?? [])] } } })),
      removeSale: (bid, id) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), sales: (s.data[bid]?.sales ?? []).filter((x) => x.id !== id) } } })),

      addExpense: (bid, x) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), expenses: [x, ...(s.data[bid]?.expenses ?? [])] } } })),
      removeExpense: (bid, id) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), expenses: (s.data[bid]?.expenses ?? []).filter((x) => x.id !== id) } } })),

      addMeeting: (bid, m) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), meetings: [m, ...(s.data[bid]?.meetings ?? [])] } } })),
      removeMeeting: (bid, id) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), meetings: (s.data[bid]?.meetings ?? []).filter((x) => x.id !== id) } } })),

      addDocument: (bid, d) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), documents: [d, ...(s.data[bid]?.documents ?? [])] } } })),

      addNote: (bid, n) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), notes: [n, ...(s.data[bid]?.notes ?? [])] } } })),
      updateNote: (bid, id, p) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), notes: patch(s.data[bid]?.notes ?? [], id, p) } } })),
      removeNote: (bid, id) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), notes: (s.data[bid]?.notes ?? []).filter((x) => x.id !== id) } } })),
      removeDocument: (bid, id) => set((s) => ({ data: { ...s.data, [bid]: { ...s.data[bid] ?? empty(), documents: (s.data[bid]?.documents ?? []).filter((x) => x.id !== id) } } })),
    }),
    { name: 'business-data' }
  )
)
