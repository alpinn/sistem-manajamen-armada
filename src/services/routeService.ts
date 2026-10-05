import type {
  JsonApiDocument,
  OptionPage,
  Resource,
  Route,
} from '@/types/mbta.ts'
import { fetchJson, offsetFromLink } from './apiClient.ts'

const ROUTE_PAGE_SIZE = 30

export async function getRoutes(
  offset: number,
  signal?: AbortSignal,
): Promise<OptionPage> {
  const doc = await fetchJson<JsonApiDocument<Resource<Route>[]>>(
    '/routes',
    {
      'page[limit]': String(ROUTE_PAGE_SIZE),
      'page[offset]': String(offset),
      'fields[route]': 'short_name,long_name,color',
    },
    signal,
  )
  return {
    items: doc.data.map(({ id, attributes: a }) => ({
      id,
      label: [a.short_name, a.long_name].filter(Boolean).join(' · ') || id,
      color: a.color,
    })),
    nextOffset: offsetFromLink(doc.links?.next),
  }
}
