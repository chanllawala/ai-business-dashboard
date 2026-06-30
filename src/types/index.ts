export type UserRole = 'owner' | 'manager' | 'employee' | 'accountant'

export interface Business {
  id: string
  name: string
  description?: string
  industry?: string
  logo_url?: string
  currency: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface BusinessMember {
  id: string
  business_id: string
  user_id: string
  role: UserRole
  joined_at: string
}

export interface Customer {
  id: string
  business_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
  total_spent: number
  last_purchase?: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  business_id: string
  name: string
  email: string
  phone?: string
  position: string
  department?: string
  salary: number
  start_date: string
  leave_days_remaining: number
  performance_score?: number
  status: 'active' | 'inactive' | 'on_leave'
  created_at: string
}

export interface Document {
  id: string
  business_id: string
  name: string
  file_url: string
  file_type: string
  file_size: number
  category: 'invoice' | 'contract' | 'report' | 'other'
  embedding_id?: string
  uploaded_by: string
  created_at: string
}

export interface Meeting {
  id: string
  business_id: string
  title: string
  date: string
  attendees: string[]
  minutes?: string
  decisions?: string[]
  action_items?: ActionItem[]
  created_at: string
}

export interface ActionItem {
  id: string
  description: string
  assigned_to: string
  due_date?: string
  completed: boolean
}

export type TaskStatus = 'todo' | 'doing' | 'completed'

export interface Task {
  id: string
  business_id: string
  title: string
  description?: string
  status: TaskStatus
  assigned_to?: string
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  business_id: string
  category: 'rent' | 'utilities' | 'marketing' | 'payroll' | 'suppliers' | 'other'
  amount: number
  description: string
  date: string
  receipt_url?: string
  created_at: string
}

export interface Sale {
  id: string
  business_id: string
  customer_id?: string
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending' | 'refunded'
  invoice_url?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  business_id?: string
  type: 'invoice_overdue' | 'low_stock' | 'employee_leave' | 'tax_due' | 'task_due' | 'info'
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface DashboardStats {
  revenue: number
  profit: number
  pending_invoices: number
  employee_count: number
  task_count: number
  cash_flow: number
}
