import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function Badge({
  icon: Icon,
  className,
  children,
}: {
  icon: LucideIcon
  className: string
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[13px] font-medium ${className}`}
    >
      <Icon aria-hidden className="size-3.5" />
      {children}
    </span>
  )
}
