import { useInfiniteQuery } from '@tanstack/react-query'
import { getRoutes } from '@/services/routeService.ts'

export function useRouteOptions() {
  return useInfiniteQuery({
    queryKey: ['routes'],
    queryFn: ({ pageParam, signal }) => getRoutes(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset,
  })
}
