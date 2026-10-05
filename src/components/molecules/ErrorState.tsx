import { CircleAlert } from 'lucide-react'
import { Button } from '@/components/atoms/Button.tsx'
import { errorDetail, errorMessage } from '@/utils/error.ts'

export function ErrorState({
  error,
  onRetry,
  title = 'Gagal memuat data',
}: {
  error: unknown
  onRetry: () => void
  title?: string
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-error-bg p-4 text-error sm:flex-row"
    >
      <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <p className="font-semibold">{title}</p>
        <p className="text-sm">{errorMessage(error)}</p>
        <details className="text-[13px]">
          <summary className="w-fit cursor-pointer">Detail teknis</summary>
          <p className="mt-1 font-mono">{errorDetail(error)}</p>
        </details>
      </div>
      <Button variant="secondary" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  )
}
