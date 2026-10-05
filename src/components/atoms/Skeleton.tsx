export function Skeleton({ className }: { className: string }) {
  return (
    <span aria-hidden className={`block rounded bg-slate-200 ${className}`} />
  )
}
