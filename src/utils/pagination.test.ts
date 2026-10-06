import { describe, expect, it } from 'vitest'
import type { VehiclePage } from '@/types/mbta.ts'
import { pageItems, pageStats } from './pagination.ts'

describe('pageStats', () => {
  const page = (offset: number, lastOffset: number, count = 12) =>
    ({
      vehicles: Array.from({ length: count }, (_, i) => ({ id: String(i) })),
      offset,
      limit: 12,
      lastOffset,
    }) as VehiclePage

  it('computes the total from the current page when it is the last one', () => {
    expect(pageStats(page(228, 228, 5))).toEqual({ pageCount: 20, total: 233 })
  })

  it('needs the last page count when not on the last page', () => {
    expect(pageStats(page(0, 228))).toEqual({
      pageCount: 20,
      total: undefined,
    })
    expect(pageStats(page(0, 228), 12)).toEqual({ pageCount: 20, total: 240 })
  })

  it('handles a single page', () => {
    expect(pageStats(page(0, 0, 7))).toEqual({ pageCount: 1, total: 7 })
  })
})

describe('pageItems', () => {
  it('lists every page when there are at most seven', () => {
    expect(pageItems(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses the tail near the start', () => {
    expect(pageItems(4, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20])
  })

  it('shows neighbours with both ellipses in the middle', () => {
    expect(pageItems(10, 20)).toEqual([
      1,
      'ellipsis',
      9,
      10,
      11,
      'ellipsis',
      20,
    ])
  })

  it('collapses the head near the end', () => {
    expect(pageItems(17, 20)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20])
  })
})
