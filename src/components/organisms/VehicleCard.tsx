import { TriangleAlert } from 'lucide-react'
import { StatusBadge } from '@/components/molecules/StatusBadge.tsx'
import type { Vehicle } from '@/types/mbta.ts'
import {
  formatCoordinates,
  formatDateTime,
  formatRelative,
  isStale,
} from '@/utils/format.ts'
import { getStatus } from '@/utils/status.ts'

export function VehicleCard({
  vehicle,
  onSelect,
}: {
  vehicle: Vehicle
  onSelect: (opener: HTMLButtonElement) => void
}) {
  const label = vehicle.label || vehicle.id
  const metaId = `vehicle-meta-${vehicle.id}`
  return (
    <button
      type="button"
      aria-label={`Kendaraan ${label}, ${getStatus(vehicle.current_status).label}, lihat detail`}
      aria-describedby={metaId}
      onClick={(event) => onSelect(event.currentTarget)}
      className="flex h-full w-full cursor-pointer flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors duration-150 hover:border-slate-400"
    >
      <span className="flex w-full items-start justify-between gap-2">
        <span className="font-mono text-lg font-semibold tabular-nums">
          {label}
        </span>
        <StatusBadge status={vehicle.current_status} />
      </span>
      <span
        id={metaId}
        className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm"
      >
        <span className="text-[13px] font-medium text-muted-foreground">
          Koordinat
        </span>
        <span className="font-mono tabular-nums">
          {formatCoordinates(vehicle.latitude, vehicle.longitude)}
        </span>
        <span className="text-[13px] font-medium text-muted-foreground">
          Update terakhir
        </span>
        <span className="flex flex-wrap items-center gap-x-2 tabular-nums">
          <time
            dateTime={vehicle.updated_at}
            title={formatDateTime(vehicle.updated_at)}
          >
            {formatRelative(vehicle.updated_at)}
          </time>
          {isStale(vehicle.updated_at) && (
            <span className="inline-flex items-center gap-1 text-[13px] font-medium text-warning">
              <TriangleAlert aria-hidden className="size-3.5" />
              Data lama
            </span>
          )}
        </span>
      </span>
    </button>
  )
}
