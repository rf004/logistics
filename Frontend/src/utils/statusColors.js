/**
 * Map urgency levels to badge and styling configs
 */
export function getUrgencyConfig(level) {
  const norm = (level || 'LOW').toUpperCase();
  switch (norm) {
    case 'CRITICAL':
      return {
        label: 'Critical',
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/25',
        dot: 'bg-red-500',
        glow: 'shadow-[0_0_12px_rgba(239,68,68,0.25)]',
      };
    case 'HIGH':
      return {
        label: 'High Urgency',
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/25',
        dot: 'bg-orange-500',
        glow: 'shadow-[0_0_12px_rgba(249,115,22,0.25)]',
      };
    case 'MEDIUM':
      return {
        label: 'Medium',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/25',
        dot: 'bg-amber-500',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      };
    case 'LOW':
    default:
      return {
        label: 'Low Urgency',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/25',
        dot: 'bg-emerald-500',
        glow: 'shadow-[0_0_12px_rgba(34,197,94,0.25)]',
      };
  }
}

/**
 * Map Transport Plan statuses to badge configs
 */
export function getTransportPlanStatusConfig(status) {
  const norm = (status || 'PLANNED').toUpperCase();
  switch (norm) {
    case 'IN_PROGRESS':
    case 'IN TRANSIT':
      return {
        label: 'In Transit',
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/25',
        dot: 'bg-blue-500 animate-pulse',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/25',
        dot: 'bg-emerald-500',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        bg: 'bg-zinc-500/10',
        text: 'text-zinc-400',
        border: 'border-zinc-500/25',
        dot: 'bg-zinc-500',
      };
    case 'PLANNED':
    default:
      return {
        label: 'Planned',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/25',
        dot: 'bg-amber-400',
      };
  }
}

/**
 * Map Road statuses
 */
export function getRoadStatusConfig(status) {
  const norm = (status || 'OPEN').toUpperCase();
  switch (norm) {
    case 'CLOSED':
      return {
        label: 'Closed',
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/25',
      };
    case 'RESTRICTED':
      return {
        label: 'Restricted',
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/25',
      };
    case 'OPEN':
    default:
      return {
        label: 'Open',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/25',
      };
  }
}
