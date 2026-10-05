import { Check } from 'lucide-react'

export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-accent bg-accent text-white' : 'border-control'}`}
    >
      {checked && <Check className="size-3" />}
    </span>
  )
}
