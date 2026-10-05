import type {
  JsonApiDocument,
  OptionPage,
  Resource,
  Trip,
} from '@/types/mbta.ts'
import { fetchJson, offsetFromLink } from './apiClient.ts'

const TRIP_PAGE_SIZE = 500

export async function getTrips(
  routeIds: string[],
  offset: number,
  signal?: AbortSignal,
): Promise<OptionPage> {
  const doc = await fetchJson<JsonApiDocument<Resource<Trip>[]>>(
    '/trips',
    {
      'filter[route]': routeIds.join(','),
      'page[limit]': String(TRIP_PAGE_SIZE),
      'page[offset]': String(offset),
      'fields[trip]': 'headsign',
    },
    signal,
  )
  return {
    items: doc.data.map(({ id, attributes, relationships }) => ({
      id,
      label: attributes.headsign || id,
      detail: id,
      routeId: relationships?.route?.data?.id,
    })),
    nextOffset: offsetFromLink(doc.links?.next),
  }
}
