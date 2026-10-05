import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { getVehicles } from '@/services/vehicleService.ts'
import { pageStats } from '@/utils/pagination.ts'

export function useVehicles({
  page,
  pageSize,
  routeIds,
  tripIds,
}: {
  page: number
  pageSize: number
  routeIds: string[]
  tripIds: string[]
}) {
  const queryClient = useQueryClient()
  const offset = (page - 1) * pageSize

  const vehicles = useQuery({
    queryKey: ['vehicles', page, pageSize, routeIds, tripIds],
    queryFn: ({ signal }) =>
      getVehicles({ offset, limit: pageSize, routeIds, tripIds }, signal),
    placeholderData: keepPreviousData,
  })
  const data = vehicles.data
  const isCurrent = !!data && !vehicles.isPlaceholderData
  const lastOffset = data?.lastOffset ?? offset

  const lastPage = useQuery({
    queryKey: ['vehicles-count', pageSize, routeIds, tripIds, lastOffset],
    queryFn: ({ signal }) =>
      getVehicles(
        {
          offset: lastOffset,
          limit: pageSize,
          routeIds,
          tripIds,
          labelOnly: true,
        },
        signal,
      ),
    enabled: isCurrent && lastOffset !== offset,
  })

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    void queryClient.invalidateQueries({ queryKey: ['vehicles-count'] })
  }

  return {
    data,
    stats: data && pageStats(data, lastPage.data?.vehicles.length),
    isCurrent,
    isFetching: vehicles.isFetching,
    isError: vehicles.isError,
    error: vehicles.error,
    refetch: vehicles.refetch,
    refresh,
  }
}
