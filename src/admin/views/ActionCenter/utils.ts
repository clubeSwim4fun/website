export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (mins > 0) return `${mins} min${mins !== 1 ? 's' : ''} ago`
  return 'just now'
}

export function absoluteTime(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function maskNif(nif: string | null): string {
  if (!nif) return '—'
  return nif.slice(0, 3) + ' ···'
}

export function urgencyColor(urgency: string, T: Record<string, string>): string {
  if (urgency === 'red') return T['red'] ?? '#ef4444'
  if (urgency === 'amber') return T['amber'] ?? '#f59e0b'
  return T['textDisabled'] ?? '#3a4150'
}
