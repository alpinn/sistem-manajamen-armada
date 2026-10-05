import { useInfiniteQuery } from '@tanstack/react-query'
import { getTrips } from '@/services/tripService.ts'

export function useTripOptions(routeIds: string[]) {
  return useInfiniteQuery({
    queryKey: ['trips', routeIds],
    queryFn: ({ pageParam, signal }) => getTrips(routeIds, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset,
    enabled: routeIds.length > 0,
  })
}
