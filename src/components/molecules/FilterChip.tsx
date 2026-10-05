import { X } from 'lucide-react'
import { Button } from '@/components/atoms/Button.tsx'
import type { Option } from '@/types/mbta.ts'

export function FilterChip({
  kind,
  option,
  onRemove,
}: {
  kind: string
  option: Option
  onRemove: () => void
}) {
  const name = [option.label, option.detail].filter(Boolean).join(' ')
  return (
    <li className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background py-1 pr-1 pl-2 text-[13px]">
      <span className="text-muted-foreground">{kind}:</span>
      <span className="font-medium">{option.label}</span>
      {option.detail && (
        <span className="font-mono text-muted-foreground">{option.detail}</span>
      )}
      <Button
        variant="ghost"
        aria-label={`Hapus filter ${kind} ${name}`}
        onClick={onRemove}
        className="size-7"
      >
        <X aria-hidden className="size-3.5" />
      </Button>
    </li>
  )
}
