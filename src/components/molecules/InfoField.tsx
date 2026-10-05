import type { ReactNode } from 'react'

export function InfoField({
  term,
  children,
}: {
  term: string
  children: ReactNode
}) {
  return (
    <>
      <dt className="text-[13px] font-medium text-muted-foreground">{term}</dt>
      <dd className="min-w-0 tabular-nums">{children}</dd>
    </>
  )
}
