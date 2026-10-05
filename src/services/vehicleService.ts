import type {
  JsonApiDocument,
  Resource,
  Route,
  Stop,
  Trip,
  Vehicle,
  VehicleAttributes,
  VehiclePage,
} from '@/types/mbta.ts'
import { fetchJson, offsetFromLink } from './apiClient.ts'

function flatten<A>(resource: Resource<A>) {
  return { id: resource.id, ...resource.attributes }
}

export async function getVehicles(
  {
    offset,
    limit,
    routeIds,
    tripIds,
    labelOnly,
  }: {
    offset: number
    limit: number
    routeIds: string[]
    tripIds: string[]
    labelOnly?: boolean
  },
  signal?: AbortSignal,
): Promise<VehiclePage> {
  const doc = await fetchJson<JsonApiDocument<Resource<VehicleAttributes>[]>>(
    '/vehicles',
    {
      'page[limit]': String(limit),
      'page[offset]': String(offset),
      'filter[route]': routeIds.join(','),
      'filter[trip]': tripIds.join(','),
      'fields[vehicle]': labelOnly ? 'label' : undefined,
    },
    signal,
  )
  return {
    vehicles: doc.data.map(flatten),
    offset,
    limit,
    lastOffset: offsetFromLink(doc.links?.last) ?? offset,
  }
}

export async function getVehicle(
  id: string,
  signal?: AbortSignal,
): Promise<Vehicle> {
  const doc = await fetchJson<JsonApiDocument<Resource<VehicleAttributes>>>(
    `/vehicles/${encodeURIComponent(id)}`,
    { include: 'route,trip,stop' },
    signal,
  )
  const related = <T>(name: string) => {
    const ref = doc.data.relationships?.[name]?.data
    const found =
      ref && doc.included?.find((r) => r.type === ref.type && r.id === ref.id)
    return found ? (flatten(found) as T) : undefined
  }
  return {
    ...flatten(doc.data),
    route: related<Route>('route'),
    trip: related<Trip>('trip'),
    stop: related<Stop>('stop'),
  }
}
