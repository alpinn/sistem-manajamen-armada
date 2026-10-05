import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/atoms/Button.tsx'
import { Select } from '@/components/atoms/Select.tsx'
import { PAGE_SIZES, pageItems } from '@/utils/pagination.ts'

const pageButton =
  'inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-sm font-medium tabular-nums transition-colors duration-150'

export function Pagination({
  page,
  pageCount,
  pageSize,
  from,
  to,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageCount: number
  pageSize: number
  from: number
  to: number
  total: number | undefined
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-col gap-4 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <p aria-live="polite" className="text-sm tabular-nums">
          Menampilkan{' '}
          <strong className="font-semibold">
            {from}–{to}
          </strong>
          {total !== undefined && (
            <>
              {' '}
              dari <strong className="font-semibold">{total}</strong>
            </>
          )}{' '}
          kendaraan
        </p>
        <Select
          label="Per halaman"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground tabular-nums">
          Halaman {page} dari {pageCount}
        </p>
        <ul className="flex flex-wrap items-center gap-1">
          <li>
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft aria-hidden className="size-4" />
              <span className="max-sm:sr-only">Sebelumnya</span>
            </Button>
          </li>
          {pageItems(page, pageCount).map((item, index) =>
            item === 'ellipsis' ? (
              <li
                key={`ellipsis-${index}`}
                aria-hidden
                className="inline-flex size-10 items-center justify-center text-muted-foreground"
              >
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  aria-label={`Halaman ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                  onClick={() => onPageChange(item)}
                  className={
                    item === page
                      ? `${pageButton} bg-accent text-white`
                      : `${pageButton} hover:bg-slate-100`
                  }
                >
                  {item}
                </button>
              </li>
            ),
          )}
          <li>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
            >
              <span className="max-sm:sr-only">Berikutnya</span>
              <ChevronRight aria-hidden className="size-4" />
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
