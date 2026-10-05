import { ChevronDown } from 'lucide-react'
import { useId, type SelectHTMLAttributes } from 'react'

export function Select({
  label,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = useId()
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className="h-10 cursor-pointer appearance-none rounded-md border border-control bg-card pr-8 pl-3 text-base tabular-nums"
          {...props}
        />
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2"
        />
      </div>
    </div>
  )
}
