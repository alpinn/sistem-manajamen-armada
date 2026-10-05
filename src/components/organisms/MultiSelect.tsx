import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import { ChevronDown, Search } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/atoms/Button.tsx'
import { Checkbox } from '@/components/atoms/Checkbox.tsx'
import { ColorSwatch } from '@/components/atoms/ColorSwatch.tsx'
import { Spinner } from '@/components/atoms/Spinner.tsx'
import type { Option, OptionPage } from '@/types/mbta.ts'
import { errorMessage } from '@/utils/error.ts'

export function MultiSelect({
  label,
  placeholder,
  endText,
  query,
  selected,
  onChange,
  disabled = false,
  helperText,
}: {
  label: string
  placeholder: string
  endText: string
  query: UseInfiniteQueryResult<InfiniteData<OptionPage>>
  selected: Option[]
  onChange: (next: Option[]) => void
  disabled?: boolean
  helperText?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const options = query.data?.pages.flatMap((page) => page.items) ?? []
  const term = search.trim().toLowerCase()
  const visibleOptions = term
    ? options.filter((option) =>
        `${option.label} ${option.detail ?? ''}`.toLowerCase().includes(term),
      )
    : options
  const selectedIds = new Set(selected.map((option) => option.id))
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!open || !sentinel || !hasNextPage) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage()
      },
      { root: panelRef.current, rootMargin: '0px 0px 48px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage])

  const optionElements = () =>
    Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
    )

  const openPanel = () => {
    setSearch('')
    setOpen(true)
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const toggle = (option: Option) =>
    onChange(
      selectedIds.has(option.id)
        ? selected.filter((item) => item.id !== option.id)
        : [...selected, option],
    )

  const onPanelKeyDown = (event: KeyboardEvent) => {
    const items = optionElements()
    const index = items.indexOf(document.activeElement as HTMLElement)
    const inSearch = event.target === searchRef.current
    const moves: Record<string, number> = {
      ArrowDown: Math.min(index + 1, items.length - 1),
      ArrowUp: index - 1,
      ...(inSearch ? {} : { Home: 0, End: items.length - 1 }),
    }
    if (event.key === 'ArrowUp' && index <= 0) {
      event.preventDefault()
      searchRef.current?.focus()
    } else if (event.key in moves) {
      event.preventDefault()
      items[moves[event.key] ?? 0]?.focus()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    }
  }

  const onOptionKeyDown = (event: KeyboardEvent, option: Option) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      toggle(option)
    }
  }

  const retry = () =>
    query.isFetchNextPageError ? fetchNextPage() : query.refetch()

  const triggerText = selected.length
    ? `${selected.length} dipilih`
    : placeholder

  return (
    <div
      ref={rootRef}
      onBlur={(event) => {
        const next = event.relatedTarget
        if (next && !rootRef.current?.contains(next)) setOpen(false)
      }}
      className="relative flex flex-col gap-1.5"
    >
      <span id={`${id}-label`} className="text-sm font-medium">
        {label}
      </span>
      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-labelledby={`${id}-label ${id}-trigger`}
        aria-describedby={helperText ? `${id}-help` : undefined}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            openPanel()
          } else if (event.key === 'Escape' && open) {
            event.preventDefault()
            setOpen(false)
          }
        }}
        className="flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-control bg-card px-3 text-left text-base transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-muted-foreground"
      >
        <span className="truncate">{triggerText}</span>
        <ChevronDown
          aria-hidden
          className={`size-4 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {helperText && (
        <p id={`${id}-help`} className="text-[13px] text-muted-foreground">
          {helperText}
        </p>
      )}
      <div
        ref={panelRef}
        id={`${id}-panel`}
        hidden={!open}
        onKeyDown={onPanelKeyDown}
        className="absolute top-full right-0 left-0 z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-control bg-card pb-1"
      >
        <div className="sticky top-0 z-10 border-b border-border bg-card p-2">
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Cari ${label.toLowerCase()}…`}
              aria-label={`Cari ${label.toLowerCase()}`}
              aria-controls={`${id}-listbox`}
              autoComplete="off"
              className="h-10 w-full rounded-md border border-control bg-card pr-3 pl-9 text-base"
            />
          </div>
        </div>
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={`${id}-label`}
          className="pt-1"
        >
          {visibleOptions.map((option) => {
            const isSelected = selectedIds.has(option.id)
            return (
              <li
                key={option.id}
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                onClick={() => toggle(option)}
                onKeyDown={(event) => onOptionKeyDown(event, option)}
                className={`flex min-h-10 cursor-pointer items-center gap-3 px-3 py-2 text-sm outline-offset-[-2px] transition-colors duration-150 hover:bg-slate-100 ${isSelected ? 'text-accent' : ''}`}
              >
                <Checkbox checked={isSelected} />
                {option.color && <ColorSwatch color={option.color} />}
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{option.label}</span>
                  {option.detail && (
                    <span className="truncate font-mono text-xs text-muted-foreground">
                      {option.detail}
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
        <div aria-live="polite" className="px-3 text-[13px]">
          {term && visibleOptions.length === 0 && !query.isError && (
            <p className="py-2 text-muted-foreground">
              Tidak ada {label.toLowerCase()} yang cocok dengan “{search.trim()}
              ” di {options.length} data yang sudah dimuat
            </p>
          )}
          {query.isError ? (
            <div className="flex flex-col gap-2 py-2 text-error">
              <p>{errorMessage(query.error)}</p>
              <Button variant="secondary" className="w-fit" onClick={retry}>
                Coba lagi
              </Button>
            </div>
          ) : query.isLoading || isFetchingNextPage ? (
            <p className="flex items-center gap-2 py-2 text-muted-foreground">
              <Spinner className="size-3.5" />
              {query.isLoading ? 'Memuat…' : 'Memuat lagi…'}
            </p>
          ) : hasNextPage ? (
            <Button
              variant="secondary"
              className="my-1 w-full"
              onClick={() => fetchNextPage()}
            >
              Muat lebih banyak
            </Button>
          ) : (
            query.isSuccess && (
              <p className="py-2 text-muted-foreground">{endText}</p>
            )
          )}
        </div>
        <div ref={sentinelRef} aria-hidden className="h-px" />
      </div>
    </div>
  )
}
