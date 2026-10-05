import { SearchX } from 'lucide-react'
import { Button } from '@/components/atoms/Button.tsx'

export function EmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-4 py-12 text-center">
      <SearchX aria-hidden className="size-8 text-muted-foreground" />
      <p className="font-medium">
        {onReset
          ? 'Tidak ada kendaraan yang cocok dengan filter'
          : 'Tidak ada kendaraan yang sedang beroperasi'}
      </p>
      {onReset && (
        <Button variant="secondary" onClick={onReset}>
          Reset filter
        </Button>
      )}
    </div>
  )
}
