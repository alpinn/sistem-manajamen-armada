import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/atoms/Button.tsx'

export function Header({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean
  onRefresh: () => void
}) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Sistem Manajemen Armada</h1>
          <p className="text-sm text-muted-foreground">
            Data kendaraan MBTA secara real time
          </p>
        </div>
        <Button variant="secondary" onClick={onRefresh}>
          <RefreshCw
            aria-hidden
            className={`size-4 ${refreshing ? 'motion-safe:animate-spin' : ''}`}
          />
          Muat ulang
        </Button>
      </div>
    </header>
  )
}
