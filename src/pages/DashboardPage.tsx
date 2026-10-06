import { useRef, useState } from 'react'
import { FilterBar } from '@/components/organisms/FilterBar.tsx'
import { Header } from '@/components/organisms/Header.tsx'
import { Pagination } from '@/components/organisms/Pagination.tsx'
import { VehicleDetail } from '@/components/organisms/VehicleDetail.tsx'
import { VehicleGrid } from '@/components/organisms/VehicleGrid.tsx'
import { useVehicles } from '@/hooks/useVehicles.ts'
import type { Option, Vehicle } from '@/types/mbta.ts'

export function DashboardPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [routes, setRoutes] = useState<Option[]>([])
  const [trips, setTrips] = useState<Option[]>([])
  const [selected, setSelected] = useState<Vehicle | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const hasFilters = routes.length > 0 || trips.length > 0
  const vehicles = useVehicles({
    page,
    pageSize,
    routeIds: routes.map((route) => route.id),
    tripIds: trips.map((trip) => trip.id),
  })
  const { data, stats } = vehicles

  if (vehicles.isCurrent && stats && page > stats.pageCount)
    setPage(stats.pageCount)

  const goToPage = (next: number) => {
    setPage(next)
    headingRef.current?.scrollIntoView({ block: 'start' })
    headingRef.current?.focus({ preventScroll: true })
  }

  const changePageSize = (size: number) => {
    setPageSize(size)
    goToPage(1)
  }

  const changeRoutes = (next: Option[]) => {
    setRoutes(next)
    setTrips((current) =>
      current.filter((trip) => next.some((route) => route.id === trip.routeId)),
    )
    setPage(1)
  }

  const changeTrips = (next: Option[]) => {
    setTrips(next)
    setPage(1)
  }

  const resetFilters = () => {
    setRoutes([])
    setTrips([])
    setPage(1)
  }

  return (
    <div className="min-h-dvh">
      <Header refreshing={vehicles.isFetching} onRefresh={vehicles.refresh} />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
        <FilterBar
          routes={routes}
          trips={trips}
          onRoutesChange={changeRoutes}
          onTripsChange={changeTrips}
          onReset={resetFilters}
        />

        <section
          aria-labelledby="results-heading"
          className="flex flex-col gap-4"
        >
          <h2
            id="results-heading"
            ref={headingRef}
            tabIndex={-1}
            className="scroll-mt-4 text-lg font-semibold"
          >
            Daftar kendaraan
          </h2>

          <VehicleGrid
            vehicles={data?.vehicles}
            isFetching={vehicles.isFetching}
            isError={vehicles.isError}
            error={vehicles.error}
            skeletonCount={pageSize}
            onRetry={() => vehicles.refetch()}
            onReset={hasFilters ? resetFilters : undefined}
            onSelect={(vehicle, opener) => {
              openerRef.current = opener
              setSelected(vehicle)
            }}
          />

          {data && stats && data.vehicles.length > 0 && !vehicles.isError && (
            <Pagination
              page={page}
              pageCount={stats.pageCount}
              pageSize={pageSize}
              from={data.offset + 1}
              to={data.offset + data.vehicles.length}
              total={stats.total}
              onPageChange={goToPage}
              onPageSizeChange={changePageSize}
            />
          )}
        </section>
      </main>

      {selected && (
        <VehicleDetail
          vehicle={selected}
          onClose={() => {
            setSelected(null)
            openerRef.current?.focus()
          }}
        />
      )}
    </div>
  )
}
