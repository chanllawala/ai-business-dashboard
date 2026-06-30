import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600 ring-slate-200/80',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  warning: 'bg-amber-50  text-amber-700  ring-amber-200/80',
  danger:  'bg-red-50    text-red-700    ring-red-200/80',
  info:    'bg-blue-50   text-blue-700   ring-blue-200/80',
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
