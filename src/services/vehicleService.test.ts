import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './apiClient.ts'
import { getVehicle, getVehicles } from './vehicleService.ts'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status })

const mockFetch = (response: Response) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)

const requestedUrl = (spy: ReturnType<typeof mockFetch>) =>
  new URL(String(spy.mock.calls[0]?.[0]))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getVehicles', () => {
  it('builds paging and comma-joined filter params', async () => {
    const spy = mockFetch(
      json({
        data: [{ id: 'y1', type: 'vehicle', attributes: { label: '1234' } }],
        links: {
          last: 'https://api-v3.mbta.com/vehicles?page%5Boffset%5D=48',
        },
      }),
    )

    const result = await getVehicles({
      offset: 24,
      limit: 12,
      routeIds: ['Red', 'Orange'],
      tripIds: ['t1', 't2'],
    })

    const url = requestedUrl(spy)
    expect(url.pathname).toBe('/vehicles')
    expect(url.searchParams.get('page[limit]')).toBe('12')
    expect(url.searchParams.get('page[offset]')).toBe('24')
    expect(url.searchParams.get('filter[route]')).toBe('Red,Orange')
    expect(url.searchParams.get('filter[trip]')).toBe('t1,t2')
    expect(result).toEqual({
      vehicles: [{ id: 'y1', label: '1234' }],
      offset: 24,
      limit: 12,
      lastOffset: 48,
    })
  })

  it('omits empty filters and falls back to the current offset', async () => {
    const spy = mockFetch(json({ data: [] }))

    const result = await getVehicles({
      offset: 0,
      limit: 12,
      routeIds: [],
      tripIds: [],
    })

    const url = requestedUrl(spy)
    expect(url.searchParams.has('filter[route]')).toBe(false)
    expect(url.searchParams.has('filter[trip]')).toBe(false)
    expect(url.searchParams.has('fields[vehicle]')).toBe(false)
    expect(result.lastOffset).toBe(0)
  })

  it('throws ApiError with the HTTP status on non-OK responses', async () => {
    mockFetch(json({ errors: [] }, 429))

    const error = await getVehicles({
      offset: 0,
      limit: 12,
      routeIds: [],
      tripIds: [],
    }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 429 })
  })
})

describe('getVehicle', () => {
  it('requests includes and resolves route, trip and stop', async () => {
    const spy = mockFetch(
      json({
        data: {
          id: 'y1',
          type: 'vehicle',
          attributes: { label: '1234' },
          relationships: {
            route: { data: { id: 'Red', type: 'route' } },
            trip: { data: { id: 't1', type: 'trip' } },
            stop: { data: null },
          },
        },
        included: [
          { id: 't1', type: 'trip', attributes: { headsign: 'Ashmont' } },
          { id: 'Red', type: 'stop', attributes: { name: 'Wrong type' } },
          { id: 'Red', type: 'route', attributes: { long_name: 'Red Line' } },
        ],
      }),
    )

    const vehicle = await getVehicle('y1')

    const url = requestedUrl(spy)
    expect(url.pathname).toBe('/vehicles/y1')
    expect(url.searchParams.get('include')).toBe('route,trip,stop')
    expect(vehicle).toMatchObject({
      id: 'y1',
      label: '1234',
      route: { id: 'Red', long_name: 'Red Line' },
      trip: { id: 't1', headsign: 'Ashmont' },
    })
    expect(vehicle.stop).toBeUndefined()
  })
})
