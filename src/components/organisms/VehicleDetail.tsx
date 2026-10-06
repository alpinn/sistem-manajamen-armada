import { ExternalLink, X } from 'lucide-react'
import { Suspense, lazy, useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from '@/components/atoms/Button.tsx'
import { ColorSwatch } from '@/components/atoms/ColorSwatch.tsx'
import { Skeleton } from '@/components/atoms/Skeleton.tsx'
import { ErrorState } from '@/components/molecules/ErrorState.tsx'
import { InfoField } from '@/components/molecules/InfoField.tsx'
import { InfoSection } from '@/components/molecules/InfoSection.tsx'
import { StatusBadge } from '@/components/molecules/StatusBadge.tsx'
import { useVehicleDetail } from '@/hooks/useVehicleDetail.ts'
import type { Vehicle } from '@/types/mbta.ts'
import {
  NOT_AVAILABLE,
  formatBearing,
  formatCoordinates,
  formatDateTime,
  formatOccupancy,
  formatRelative,
  formatSpeed,
} from '@/utils/format.ts'
import { getStatus } from '@/utils/status.ts'

const VehicleMap = lazy(() => import('./VehicleMap.tsx'))

export function VehicleDetail({
  vehicle: initial,
  onClose,
}: {
  vehicle: Vehicle
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const query = useVehicleDetail(initial.id)
  const vehicle = query.data ?? initial
  const label = vehicle.label || vehicle.id
  const { route, trip, stop } = vehicle
  const direction = vehicle.direction_id ?? -1

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const close = () => dialogRef.current?.close()

  const loaded = (value: ReactNode) =>
    query.isPending ? <Skeleton className="h-4 w-32" /> : value

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const outside =
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        if (event.target === event.currentTarget && outside) close()
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-card p-0 text-foreground backdrop:bg-slate-950/50 sm:m-auto sm:h-fit sm:max-h-[calc(100dvh-4rem)] sm:max-w-160 sm:rounded-lg sm:border sm:border-border"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 id={titleId} className="text-xl font-semibold">
            Kendaraan <span className="font-mono tabular-nums">{label}</span>
          </h2>
          <StatusBadge status={vehicle.current_status} />
        </div>
        <Button variant="secondary" size="sm" onClick={close}>
          <X aria-hidden className="size-4" />
          <span className="max-sm:sr-only">Tutup</span>
        </Button>
      </header>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-2">
          <Suspense fallback={<Skeleton className="h-60 w-full rounded-lg" />}>
            <VehicleMap
              latitude={vehicle.latitude}
              longitude={vehicle.longitude}
              label={label}
            />
          </Suspense>
          <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
            <span className="font-mono tabular-nums">
              {formatCoordinates(vehicle.latitude, vehicle.longitude)}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${vehicle.latitude},${vehicle.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-accent underline underline-offset-2"
            >
              Buka di Google Maps
              <span className="sr-only">(tab baru)</span>
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          </p>
        </div>

        <InfoSection title="Kendaraan">
          <InfoField term="Status">
            {getStatus(vehicle.current_status).label}{' '}
            <span className="font-mono text-xs text-muted-foreground">
              {vehicle.current_status ?? 'null'}
            </span>
          </InfoField>
          <InfoField term="Koordinat">
            <span className="font-mono">
              {formatCoordinates(vehicle.latitude, vehicle.longitude)}
            </span>
          </InfoField>
          <InfoField term="Kecepatan">{formatSpeed(vehicle.speed)}</InfoField>
          <InfoField term="Arah">{formatBearing(vehicle.bearing)}</InfoField>
          <InfoField term="Okupansi">
            {formatOccupancy(vehicle.occupancy_status)}
          </InfoField>
          <InfoField term="Update terakhir">
            <time dateTime={vehicle.updated_at}>
              {formatRelative(vehicle.updated_at)} (
              {formatDateTime(vehicle.updated_at)})
            </time>
          </InfoField>
        </InfoSection>

        {query.isError ? (
          <ErrorState
            title="Gagal memuat detail rute, trip, dan halte"
            error={query.error}
            onRetry={() => query.refetch()}
          />
        ) : (
          <>
            <InfoSection title="Rute" busy={query.isPending}>
              <InfoField term="Nama">
                {loaded(
                  route ? (
                    <span className="inline-flex items-center gap-2">
                      <ColorSwatch color={route.color} />
                      {[route.short_name, route.long_name]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  ) : (
                    NOT_AVAILABLE
                  ),
                )}
              </InfoField>
              <InfoField term="Deskripsi">
                {loaded(route?.description || NOT_AVAILABLE)}
              </InfoField>
              <InfoField term="Arah">
                {loaded(
                  [
                    route?.direction_names[direction],
                    route?.direction_destinations[direction],
                  ]
                    .filter(Boolean)
                    .join(' – ') || NOT_AVAILABLE,
                )}
              </InfoField>
            </InfoSection>
            <InfoSection title="Trip" busy={query.isPending}>
              <InfoField term="Tujuan">
                {loaded(trip?.headsign || NOT_AVAILABLE)}
              </InfoField>
              <InfoField term="ID trip">
                {loaded(
                  trip ? (
                    <span className="font-mono break-all">{trip.id}</span>
                  ) : (
                    NOT_AVAILABLE
                  ),
                )}
              </InfoField>
            </InfoSection>
            <InfoSection title="Halte" busy={query.isPending}>
              <InfoField term="Nama halte">
                {loaded(stop?.name || NOT_AVAILABLE)}
              </InfoField>
            </InfoSection>
          </>
        )}
      </div>
    </dialog>
  )
}
