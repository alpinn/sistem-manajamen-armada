import { EmptyState } from '@/components/molecules/EmptyState.tsx'
import { ErrorState } from '@/components/molecules/ErrorState.tsx'
import { SkeletonCard } from '@/components/molecules/SkeletonCard.tsx'
import type { Vehicle } from '@/types/mbta.ts'
import { VehicleCard } from './VehicleCard.tsx'

export function VehicleGrid({
  vehicles,
  isFetching,
  isError,
  error,
  skeletonCount,
  onRetry,
  onReset,
  onSelect,
}: {
  vehicles: Vehicle[] | undefined
  isFetching: boolean
  isError: boolean
  error: unknown
  skeletonCount: number
  onRetry: () => void
  onReset?: () => void
  onSelect: (vehicle: Vehicle, opener: HTMLButtonElement) => void
}) {
  const refetching = isFetching && !!vehicles

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {isFetching ? 'Memuat data kendaraan…' : ''}
      </p>

      {isError ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : vehicles && vehicles.length === 0 ? (
        <EmptyState onReset={onReset} />
      ) : (
        <div aria-busy={isFetching} className="flex flex-col gap-2">
          <div
            aria-hidden
            className={`h-0.5 rounded-full ${refetching ? 'bg-accent' : 'bg-transparent'}`}
          />
          <ul
            className={`grid grid-cols-1 gap-4 transition-opacity duration-150 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${refetching ? 'opacity-60' : ''}`}
          >
            {vehicles
              ? vehicles.map((vehicle) => (
                  <li key={vehicle.id}>
                    <VehicleCard
                      vehicle={vehicle}
                      onSelect={(opener) => onSelect(vehicle, opener)}
                    />
                  </li>
                ))
              : Array.from({ length: skeletonCount }, (_, i) => (
                  <SkeletonCard key={i} />
                ))}
          </ul>
        </div>
      )}
    </>
  )
}
