import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Business } from '@/types'

interface BusinessStore {
  businesses: Business[]
  activeBusiness: Business | null
  setBusinesses: (businesses: Business[]) => void
  setActiveBusiness: (business: Business | null) => void
  addBusiness: (business: Business) => void
  updateBusiness: (id: string, updates: Partial<Business>) => void
  removeBusiness: (id: string) => void
}

export const useBusinessStore = create<BusinessStore>()(
  persist(
    (set) => ({
      businesses: [],
      activeBusiness: null,
      setBusinesses: (businesses) =>
        set({ businesses, activeBusiness: businesses[0] ?? null }),
      setActiveBusiness: (activeBusiness) => set({ activeBusiness }),
      addBusiness: (business) =>
        set((state) => ({ businesses: [...state.businesses, business] })),
      updateBusiness: (id, updates) =>
        set((state) => ({
          businesses: state.businesses.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
          activeBusiness:
            state.activeBusiness?.id === id
              ? { ...state.activeBusiness, ...updates }
              : state.activeBusiness,
        })),
      removeBusiness: (id) =>
        set((state) => ({
          businesses: state.businesses.filter((b) => b.id !== id),
          activeBusiness:
            state.activeBusiness?.id === id ? null : state.activeBusiness,
        })),
    }),
    { name: 'business-store' }
  )
)
