import { Skeleton } from '@/components/atoms/Skeleton.tsx'

export function SkeletonCard() {
  return (
    <li
      aria-hidden
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
    >
      <span className="flex items-start justify-between gap-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-6 w-28" />
      </span>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </li>
  )
}
