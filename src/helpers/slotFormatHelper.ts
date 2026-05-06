const TZ = 'Europe/Lisbon'

function fmtTimePart(iso: string): string {
  const parts = new Intl.DateTimeFormat('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
    hour12: false,
  }).formatToParts(new Date(iso))
  const h = parts.find((p) => p.type === 'hour')?.value ?? '0'
  const m = parts.find((p) => p.type === 'minute')?.value ?? '00'
  return `${parseInt(h)}h${m === '00' ? '' : m}`
}

export function formatSlotDay(dateTime: string): string {
  return new Date(dateTime).toLocaleDateString('pt-PT', {
    weekday: 'long',
    timeZone: TZ,
  })
}

export function formatSlotTime(dateTime: string, duration: number): string {
  const endIso = new Date(new Date(dateTime).getTime() + duration * 60 * 1000).toISOString()
  return `${fmtTimePart(dateTime)}-${fmtTimePart(endIso)}`
}
