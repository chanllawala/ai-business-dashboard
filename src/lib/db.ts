import { createServerSupabase } from './supabase'
import type { Business, Customer, Employee, Task, Sale, Expense, Meeting } from '@/types'

function db() {
  const client = createServerSupabase()
  if (!client) throw new Error('Supabase is not configured. Add SUPABASE keys to .env.local')
  return client
}

// ── Businesses ────────────────────────────────────────────────────────────
export async function getBusinesses(userId: string) {
  const { data } = await db().from('businesses').select('*').eq('owner_id', userId).order('created_at')
  return (data ?? []) as Business[]
}

export async function createBusiness(userId: string, biz: Omit<Business, 'id' | 'owner_id' | 'created_at' | 'updated_at'>) {
  const { data } = await db().from('businesses').insert({ ...biz, owner_id: userId }).select().single()
  return data as Business
}

export async function deleteBusiness(userId: string, id: string) {
  await db().from('businesses').delete().eq('id', id).eq('owner_id', userId)
}

// ── Customers ─────────────────────────────────────────────────────────────
export async function getCustomers(businessId: string, userId: string) {
  const { data } = await db().from('customers').select('*').eq('business_id', businessId).eq('user_id', userId).order('created_at', { ascending: false })
  return (data ?? []) as Customer[]
}

export async function upsertCustomer(userId: string, customer: Partial<Customer> & { business_id: string }) {
  const { data } = await db().from('customers').upsert({ ...customer, user_id: userId }).select().single()
  return data as Customer
}

export async function deleteCustomer(userId: string, id: string) {
  await db().from('customers').delete().eq('id', id).eq('user_id', userId)
}

// ── Employees ─────────────────────────────────────────────────────────────
export async function getEmployees(businessId: string, userId: string) {
  const { data } = await db().from('employees').select('*').eq('business_id', businessId).eq('user_id', userId).order('created_at', { ascending: false })
  return (data ?? []) as Employee[]
}

export async function upsertEmployee(userId: string, employee: Partial<Employee> & { business_id: string }) {
  const { data } = await db().from('employees').upsert({ ...employee, user_id: userId }).select().single()
  return data as Employee
}

export async function deleteEmployee(userId: string, id: string) {
  await db().from('employees').delete().eq('id', id).eq('user_id', userId)
}

// ── Sales ─────────────────────────────────────────────────────────────────
export async function getSales(businessId: string, userId: string) {
  const { data } = await db().from('sales').select('*').eq('business_id', businessId).eq('user_id', userId).order('date', { ascending: false })
  return (data ?? []) as Sale[]
}

export async function createSale(userId: string, sale: Partial<Sale> & { business_id: string }) {
  const { data } = await db().from('sales').insert({ ...sale, user_id: userId }).select().single()
  return data as Sale
}

export async function deleteSale(userId: string, id: string) {
  await db().from('sales').delete().eq('id', id).eq('user_id', userId)
}

// ── Expenses ──────────────────────────────────────────────────────────────
export async function getExpenses(businessId: string, userId: string) {
  const { data } = await db().from('expenses').select('*').eq('business_id', businessId).eq('user_id', userId).order('date', { ascending: false })
  return (data ?? []) as Expense[]
}

export async function createExpense(userId: string, expense: Partial<Expense> & { business_id: string }) {
  const { data } = await db().from('expenses').insert({ ...expense, user_id: userId }).select().single()
  return data as Expense
}

export async function deleteExpense(userId: string, id: string) {
  await db().from('expenses').delete().eq('id', id).eq('user_id', userId)
}

// ── Tasks ─────────────────────────────────────────────────────────────────
export async function getTasks(businessId: string, userId: string) {
  const { data } = await db().from('tasks').select('*').eq('business_id', businessId).eq('user_id', userId).order('created_at', { ascending: false })
  return (data ?? []) as Task[]
}

export async function upsertTask(userId: string, task: Partial<Task> & { business_id: string }) {
  const { data } = await db().from('tasks').upsert({ ...task, user_id: userId }).select().single()
  return data as Task
}

export async function deleteTask(userId: string, id: string) {
  await db().from('tasks').delete().eq('id', id).eq('user_id', userId)
}

// ── Meetings ──────────────────────────────────────────────────────────────
export async function getMeetings(businessId: string, userId: string) {
  const { data } = await db().from('meetings').select('*').eq('business_id', businessId).eq('user_id', userId).order('date', { ascending: false })
  return (data ?? []) as Meeting[]
}

export async function createMeeting(userId: string, meeting: Partial<Meeting> & { business_id: string }) {
  const { data } = await db().from('meetings').insert({ ...meeting, user_id: userId }).select().single()
  return data as Meeting
}

export async function deleteMeeting(userId: string, id: string) {
  await db().from('meetings').delete().eq('id', id).eq('user_id', userId)
}
