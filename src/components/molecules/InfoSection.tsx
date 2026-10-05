import { useId, type ReactNode } from 'react'

export function InfoSection({
  title,
  busy = false,
  children,
}: {
  title: string
  busy?: boolean
  children: ReactNode
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h3 id={id} className="text-base font-semibold">
        {title}
      </h3>
      <dl
        aria-busy={busy}
        className="grid grid-cols-[minmax(0,9rem)_1fr] gap-x-4 gap-y-2 text-sm"
      >
        {children}
      </dl>
    </section>
  )
}
