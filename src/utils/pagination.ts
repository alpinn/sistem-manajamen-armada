import type { VehiclePage } from '@/types/mbta.ts'

export const PAGE_SIZES = [12, 24, 48, 96]

export function pageItems(
  page: number,
  pageCount: number,
): (number | 'ellipsis')[] {
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i)
  if (pageCount <= 7) return range(1, pageCount)
  if (page <= 4) return [...range(1, 5), 'ellipsis', pageCount]
  if (page >= pageCount - 3)
    return [1, 'ellipsis', ...range(pageCount - 4, pageCount)]
  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', pageCount]
}

export function pageStats(page: VehiclePage, lastPageCount?: number) {
  const pageCount = Math.floor(page.lastOffset / page.limit) + 1
  const total =
    page.offset === page.lastOffset
      ? page.offset + page.vehicles.length
      : lastPageCount === undefined
        ? undefined
        : page.lastOffset + lastPageCount
  return { pageCount, total }
}
