import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// Client-side (browser) — limited by RLS
export const supabase = url ? createClient(url, anon) : null

// Server-side (API routes) — full access, scoped by user_id in queries
export function createServerSupabase() {
  if (!url || !svc) return null
  return createClient(url, svc, { auth: { persistSession: false } })
}

export const supabaseConfigured = !!(url && svc)
