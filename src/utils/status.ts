import {
  CircleHelp,
  CirclePause,
  Clock,
  Navigation,
  type LucideIcon,
} from 'lucide-react'

interface StatusInfo {
  label: string
  Icon: LucideIcon
  className: string
}

const UNKNOWN_STATUS: StatusInfo = {
  label: 'Tidak diketahui',
  Icon: CircleHelp,
  className:
    'text-status-unknown bg-status-unknown-bg border-status-unknown-border',
}

export const STATUS: Record<string, StatusInfo> = {
  IN_TRANSIT_TO: {
    label: 'Menuju halte',
    Icon: Navigation,
    className:
      'text-status-transit bg-status-transit-bg border-status-transit-border',
  },
  INCOMING_AT: {
    label: 'Segera tiba',
    Icon: Clock,
    className:
      'text-status-incoming bg-status-incoming-bg border-status-incoming-border',
  },
  STOPPED_AT: {
    label: 'Berhenti di halte',
    Icon: CirclePause,
    className:
      'text-status-stopped bg-status-stopped-bg border-status-stopped-border',
  },
}

export function getStatus(code: string | null | undefined): StatusInfo {
  return (code && STATUS[code]) || UNKNOWN_STATUS
}
