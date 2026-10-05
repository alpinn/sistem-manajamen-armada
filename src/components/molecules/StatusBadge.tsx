import { Badge } from '@/components/atoms/Badge.tsx'
import { getStatus } from '@/utils/status.ts'

export function StatusBadge({ status }: { status: string | null }) {
  const { label, Icon, className } = getStatus(status)
  return (
    <Badge icon={Icon} className={className}>
      {label}
    </Badge>
  )
}
