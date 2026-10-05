import { Button } from '@/components/atoms/Button.tsx'
import { FilterChip } from '@/components/molecules/FilterChip.tsx'
import { useRouteOptions } from '@/hooks/useRouteOptions.ts'
import { useTripOptions } from '@/hooks/useTripOptions.ts'
import type { Option } from '@/types/mbta.ts'
import { MultiSelect } from './MultiSelect.tsx'

export function FilterBar({
  routes,
  trips,
  onRoutesChange,
  onTripsChange,
  onReset,
}: {
  routes: Option[]
  trips: Option[]
  onRoutesChange: (next: Option[]) => void
  onTripsChange: (next: Option[]) => void
  onReset: () => void
}) {
  const routeQuery = useRouteOptions()
  const tripQuery = useTripOptions(routes.map((route) => route.id))

  return (
    <section
      aria-label="Filter kendaraan"
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <MultiSelect
          label="Rute"
          placeholder="Semua rute"
          endText="Semua rute sudah ditampilkan"
          query={routeQuery}
          selected={routes}
          onChange={onRoutesChange}
        />
        <MultiSelect
          label="Trip"
          placeholder="Semua trip"
          endText="Semua trip sudah ditampilkan"
          query={tripQuery}
          selected={trips}
          onChange={onTripsChange}
          disabled={routes.length === 0}
          helperText={
            routes.length === 0 ? 'Pilih rute terlebih dahulu' : undefined
          }
        />
      </div>
      {(routes.length > 0 || trips.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          <ul aria-label="Filter aktif" className="flex flex-wrap gap-2">
            {routes.map((route) => (
              <FilterChip
                key={route.id}
                kind="Rute"
                option={route}
                onRemove={() =>
                  onRoutesChange(routes.filter((r) => r.id !== route.id))
                }
              />
            ))}
            {trips.map((trip) => (
              <FilterChip
                key={trip.id}
                kind="Trip"
                option={trip}
                onRemove={() =>
                  onTripsChange(trips.filter((t) => t.id !== trip.id))
                }
              />
            ))}
          </ul>
          <Button variant="link" onClick={onReset}>
            Reset filter
          </Button>
        </div>
      )}
    </section>
  )
}
