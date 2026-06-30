'use client'

import { useEffect } from 'react'
import { useBusinessStore } from '@/stores/business-store'
import type { Business } from '@/types'

interface BusinessInitializerProps {
  businesses: Business[]
}

export function BusinessInitializer({ businesses }: BusinessInitializerProps) {
  const { setBusinesses, businesses: storedBusinesses } = useBusinessStore()

  useEffect(() => {
    if (businesses.length > 0 && storedBusinesses.length === 0) {
      setBusinesses(businesses)
    }
  }, [businesses, storedBusinesses.length, setBusinesses])

  return null
}
