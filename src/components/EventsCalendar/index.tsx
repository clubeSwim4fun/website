'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Route } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { cn } from '@/utilities/ui'
import { useLocale } from 'next-intl'
import type { CalendarEvent } from '@/components/Calendar/calendar-types'

// ── Locale data ───────────────────────────────────────────────────────────────

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const MONTHS_SHORT_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]
const MONTHS_SHORT_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Color token map ───────────────────────────────────────────────────────────
// Maps the category `color` token (stored in DB) → { bg, text } CSS values
// using the project's brand palette from globals.css / tailwind.config.mjs

const COLOR_MAP: Record<string, { bg: string; text: string; pill: string }> = {
  mid: { bg: 'hsl(199 82% 36%)', text: '#fff', pill: 'hsl(199 82% 36%)' },
  'green-dark': { bg: 'hsl(145 70% 35%)', text: '#fff', pill: 'hsl(145 70% 35%)' },
  amber: { bg: 'hsl(38 87% 53%)', text: '#fff', pill: 'hsl(38 87% 53%)' },
  coral: { bg: 'hsl(5 76% 60%)', text: '#fff', pill: 'hsl(5 76% 60%)' },
  purple: { bg: 'hsl(271 81% 56%)', text: '#fff', pill: 'hsl(271 81% 56%)' },
  deep: { bg: 'hsl(205 82% 23%)', text: '#fff', pill: 'hsl(205 82% 23%)' },
  light: { bg: 'hsl(193 62% 54%)', text: 'hsl(205 82% 23%)', pill: 'hsl(193 62% 54%)' },
}

const DEFAULT_COLOR: { bg: string; text: string; pill: string } = {
  bg: 'hsl(199 82% 36%)',
  text: '#fff',
  pill: 'hsl(199 82% 36%)',
}

function resolveColor(event: CalendarEvent): { bg: string; text: string; pill: string } {
  const cat = event.category
  if (cat && typeof cat === 'object' && 'color' in cat && cat.color) {
    return COLOR_MAP[cat.color as string] ?? DEFAULT_COLOR
  }
  return DEFAULT_COLOR
}

function getCategoryLabel(event: CalendarEvent): string {
  const cat = event.category
  if (cat && typeof cat === 'object' && 'title' in cat) return (cat.title as string) ?? ''
  return ''
}

function getCategoryId(event: CalendarEvent): string {
  const cat = event.category
  if (cat && typeof cat === 'object' && 'id' in cat) return String(cat.id)
  return ''
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// ── Main Component ────────────────────────────────────────────────────────────

export function EventsCalendar({ events }: { events: CalendarEvent[] }) {
  const locale = useLocale() as 'pt' | 'en'
  const today = useMemo(() => new Date(), [])

  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [view, setView] = useState<'month' | 'list'>('month')
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const MONTHS = locale === 'pt' ? MONTHS_PT : MONTHS_EN
  const MONTHS_SHORT = locale === 'pt' ? MONTHS_SHORT_PT : MONTHS_SHORT_EN
  const WEEKDAYS = locale === 'pt' ? WEEKDAYS_PT : WEEKDAYS_EN

  // Unique categories
  const categories = useMemo(() => {
    const map = new Map<string, { label: string; color: string }>()
    events.forEach((ev) => {
      const id = getCategoryId(ev)
      if (id && !map.has(id))
        map.set(id, { label: getCategoryLabel(ev), color: resolveColor(ev).bg })
    })
    return Array.from(map.entries()).map(([id, val]) => ({ id, ...val }))
  }, [events])

  const filteredEvents = useMemo(
    () =>
      activeFilter === 'all' ? events : events.filter((ev) => getCategoryId(ev) === activeFilter),
    [events, activeFilter],
  )

  const upcomingEvents = useMemo(
    () =>
      filteredEvents
        .filter((ev) => new Date(ev.start) >= today)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 5),
    [filteredEvents, today],
  )

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else setCurrentMonth((m) => m - 1)
  }
  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else setCurrentMonth((m) => m + 1)
  }

  return (
    <div className="w-full">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Row 1: nav + view toggle */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg border border-swim-border bg-white flex items-center justify-center text-ink-mid hover:border-light hover:bg-pale transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-syne font-bold text-lg text-deep min-w-[160px] text-center">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg border border-swim-border bg-white flex items-center justify-center text-ink-mid hover:border-light hover:bg-pale transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(today.getMonth())
                setCurrentYear(today.getFullYear())
              }}
              className="px-3 py-1.5 text-xs font-medium border border-swim-border rounded-lg bg-white text-ink-mid hover:border-mid hover:text-mid hover:bg-pale transition-colors"
            >
              {locale === 'pt' ? 'Hoje' : 'Today'}
            </button>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 bg-white border border-swim-border rounded-xl p-1">
            {(['month', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  view === v
                    ? 'bg-gradient-to-br from-deep to-mid text-white'
                    : 'text-ink-mid hover:bg-foam',
                )}
              >
                {v === 'month'
                  ? locale === 'pt'
                    ? 'Mês'
                    : 'Month'
                  : locale === 'pt'
                    ? 'Lista'
                    : 'List'}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: filter chips — scrollable on mobile, wrap on desktop */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-0.5 md:flex-wrap md:overflow-visible [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
            <FilterChip active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
              {locale === 'pt' ? 'Todos' : 'All'}
            </FilterChip>
            {categories.map((cat) => (
              <FilterChip
                key={cat.id}
                active={activeFilter === cat.id}
                onClick={() => setActiveFilter(cat.id)}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0 inline-block"
                  style={{ background: cat.color }}
                />
                {cat.label}
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      {/* ── Calendar / List ── */}
      {view === 'month' ? (
        <MonthView
          year={currentYear}
          month={currentMonth}
          today={today}
          events={filteredEvents}
          locale={locale}
          WEEKDAYS={WEEKDAYS}
          MONTHS={MONTHS}
        />
      ) : (
        <ListView
          events={filteredEvents}
          locale={locale}
          MONTHS={MONTHS}
          MONTHS_SHORT={MONTHS_SHORT}
        />
      )}

      {/* ── Bottom row: upcoming + legend (month view only) ── */}
      {view === 'month' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <UpcomingPanel events={upcomingEvents} locale={locale} MONTHS_SHORT={MONTHS_SHORT} />
          {categories.length > 0 && <LegendPanel categories={categories} locale={locale} />}
        </div>
      )}
    </div>
  )
}

// ── Filter Chip ───────────────────────────────────────────────────────────────

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
        active
          ? 'border-mid bg-pale text-deep font-semibold'
          : 'border-swim-border bg-white text-ink-mid hover:border-light',
      )}
    >
      {children}
    </button>
  )
}

// ── Month View ────────────────────────────────────────────────────────────────

function MonthView({
  year,
  month,
  today,
  events,
  locale,
  WEEKDAYS,
  MONTHS,
}: {
  year: number
  month: number
  today: Date
  events: CalendarEvent[]
  locale: string
  WEEKDAYS: string[]
  MONTHS: string[]
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  // Build a map: dayKey → events[]
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    events.forEach((ev) => {
      const k = dayKey(new Date(ev.start))
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(ev)
    })
    return map
  }, [events])

  const selectedEvents = selectedDay
    ? (eventsByDay.get(
        `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`,
      ) ?? [])
    : []

  return (
    <div>
      <div className="bg-white border-2 border-swim-border rounded-lg overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-foam border-b border-swim-border">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="py-3 text-center text-[10px] font-bold uppercase tracking-wider text-ink-light"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: totalCells }).map((_, i) => {
            let day: number,
              cellMonth: number,
              cellYear: number,
              isOther = false
            if (i < firstDay) {
              day = daysInPrev - firstDay + i + 1
              cellMonth = month - 1
              cellYear = year
              isOther = true
            } else if (i >= firstDay + daysInMonth) {
              day = i - firstDay - daysInMonth + 1
              cellMonth = month + 1
              cellYear = year
              isOther = true
            } else {
              day = i - firstDay + 1
              cellMonth = month
              cellYear = year
            }

            const isToday =
              day === today.getDate() &&
              cellMonth === today.getMonth() &&
              cellYear === today.getFullYear()
            const isSelected = !isOther && day === selectedDay
            const k = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayEvents = isOther ? [] : (eventsByDay.get(k) ?? [])

            return (
              <div
                key={i}
                onClick={() => !isOther && setSelectedDay(day === selectedDay ? null : day)}
                className={cn(
                  'border-r border-b border-swim-border [&:nth-child(7n)]:border-r-0 flex flex-col cursor-pointer transition-colors',
                  isOther
                    ? 'bg-[#fafafa] opacity-50 pointer-events-none'
                    : 'bg-white hover:bg-foam',
                  isSelected && 'bg-pale',
                )}
                // Fixed height: all cells same size regardless of content
                style={{ minHeight: '88px', height: '88px' }}
              >
                {/* Day number */}
                <div className="p-1.5 pb-0 flex-shrink-0">
                  <div
                    className={cn(
                      'w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full',
                      isToday ? 'bg-mid text-white' : 'text-ink',
                    )}
                  >
                    {day}
                  </div>
                </div>

                {/* Event pills */}
                <div className="px-1 pb-1 flex flex-col gap-0.5 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const c = resolveColor(ev)
                    return (
                      <Link
                        key={String(ev.id)}
                        href={`/event/${ev.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block text-[10px] font-semibold px-1.5 py-0.5 rounded-full truncate leading-tight hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {ev.title}
                      </Link>
                    )
                  })}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-mid font-semibold px-1">
                      +{dayEvents.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day detail */}
      {selectedDay !== null && (
        <div className="mt-3 bg-white border-2 border-swim-border rounded-lg p-4">
          <p className="font-syne font-bold text-sm text-deep mb-3">
            {selectedDay} {locale === 'pt' ? 'de ' : ''}
            {MONTHS[month]}
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-ink-light italic">
              {locale === 'pt' ? 'Sem eventos neste dia' : 'No events on this day'}
            </p>
          ) : (
            <div className="divide-y divide-swim-border">
              {selectedEvents.map((ev) => (
                <Link
                  key={String(ev.id)}
                  href={`/event/${ev.slug}`}
                  className="flex items-center gap-3 py-2.5 hover:bg-foam -mx-4 px-4 transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: resolveColor(ev).bg }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{ev.title}</p>
                    {ev.address?.street && (
                      <p className="text-xs text-ink-light">{ev.address.street}</p>
                    )}
                  </div>
                  <span className="text-xs text-ink-light flex-shrink-0">
                    {getCategoryLabel(ev)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── List View ─────────────────────────────────────────────────────────────────

function ListView({
  events,
  locale,
  MONTHS,
  MONTHS_SHORT,
}: {
  events: CalendarEvent[]
  locale: string
  MONTHS: string[]
  MONTHS_SHORT: string[]
}) {
  const grouped = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    )
    const map = new Map<string, { label: string; events: CalendarEvent[] }>()
    sorted.forEach((ev) => {
      const d = new Date(ev.start)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!map.has(key))
        map.set(key, { label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, events: [] })
      map.get(key)!.events.push(ev)
    })
    return Array.from(map.values())
  }, [events, MONTHS])

  if (grouped.length === 0) {
    return (
      <p className="text-sm text-ink-light italic py-8 text-center">
        {locale === 'pt' ? 'Sem eventos' : 'No events'}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {grouped.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-syne text-xs font-bold uppercase tracking-wider text-ink-light">
              {group.label}
            </span>
            <div className="flex-1 h-px bg-swim-border" />
          </div>
          <div className="flex flex-col gap-2">
            {group.events.map((ev) => (
              <ListEventCard key={String(ev.id)} event={ev} MONTHS_SHORT={MONTHS_SHORT} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── List Event Card ───────────────────────────────────────────────────────────

function ListEventCard({ event, MONTHS_SHORT }: { event: CalendarEvent; MONTHS_SHORT: string[] }) {
  const d = new Date(event.start)
  const c = resolveColor(event)
  const catLabel = getCategoryLabel(event)

  return (
    <Link
      href={`/event/${event.slug}`}
      className="group bg-white border-2 border-swim-border rounded-lg overflow-hidden hover:border-light hover:shadow-md transition-all"
    >
      <div className="grid grid-cols-[5px_64px_1fr_auto]">
        <div className="self-stretch" style={{ background: c.bg }} />
        <div className="flex flex-col items-center justify-center px-3 py-4 border-r border-swim-border">
          <span className="font-syne text-xl font-extrabold text-deep leading-none">
            {String(d.getDate()).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-light mt-0.5">
            {MONTHS_SHORT[d.getMonth()]}
          </span>
        </div>
        <div className="px-4 py-3 flex flex-col justify-center min-w-0">
          {catLabel && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: c.bg }}
            >
              {catLabel}
            </span>
          )}
          <p className="font-syne font-bold text-sm text-deep leading-snug line-clamp-2">
            {event.title}
          </p>
          <div className="flex flex-wrap gap-3 mt-1.5">
            {event.address?.street && (
              <span className="flex items-center gap-1 text-xs text-ink-light">
                <MapPin className="w-3 h-3" />
                {event.address.street}
              </span>
            )}
            {event.distances && event.distances.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-ink-light">
                <Route className="w-3 h-3" />
                {event.distances
                  .map((d: { distance: number }) => `${(d.distance / 1000).toFixed(1)} km`)
                  .join(', ')}
              </span>
            )}
          </div>
        </div>
        <div className="px-4 py-3 flex items-center flex-shrink-0">
          <EventStatusBadge event={event} />
        </div>
      </div>
    </Link>
  )
}

// ── Upcoming Panel ────────────────────────────────────────────────────────────

function UpcomingPanel({
  events,
  locale,
  MONTHS_SHORT,
}: {
  events: CalendarEvent[]
  locale: string
  MONTHS_SHORT: string[]
}) {
  return (
    <div className="bg-white border-2 border-swim-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-swim-border">
        <p className="font-syne text-xs font-bold text-deep uppercase tracking-wider">
          {locale === 'pt' ? 'Próximas provas' : 'Upcoming events'}
        </p>
      </div>
      <div className="divide-y divide-swim-border">
        {events.length === 0 ? (
          <p className="px-4 py-3 text-sm text-ink-light italic">
            {locale === 'pt' ? 'Sem eventos próximos' : 'No upcoming events'}
          </p>
        ) : (
          events.map((ev) => (
            <Link
              key={String(ev.id)}
              href={`/event/${ev.slug}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-foam transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-pale flex flex-col items-center justify-center flex-shrink-0">
                <span className="font-syne text-sm font-extrabold text-deep leading-none">
                  {new Date(ev.start).getDate()}
                </span>
                <span className="text-[9px] font-bold uppercase text-mid">
                  {MONTHS_SHORT[new Date(ev.start).getMonth()]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate leading-snug">{ev.title}</p>
                {ev.address?.street && (
                  <p className="text-xs text-ink-light truncate">{ev.address.street}</p>
                )}
              </div>
              <EventStatusBadge event={ev} />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

// ── Legend Panel ──────────────────────────────────────────────────────────────

function LegendPanel({
  categories,
  locale,
}: {
  categories: { id: string; label: string; color: string }[]
  locale: string
}) {
  return (
    <div className="bg-white border-2 border-swim-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-swim-border">
        <p className="font-syne text-xs font-bold text-deep uppercase tracking-wider">
          {locale === 'pt' ? 'Legenda' : 'Legend'}
        </p>
      </div>
      <div className="px-4 py-3 flex flex-col gap-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 text-sm text-ink-mid">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: cat.color }}
            />
            {cat.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function EventStatusBadge({ event }: { event: CalendarEvent }) {
  const now = new Date()
  const start = new Date(event.start)
  const end = new Date(event.end)

  let label: string, cls: string
  if (end < now) {
    label = 'Realizado'
    cls = 'bg-slate-100 text-slate-500'
  } else if (start <= now && end >= now) {
    label = 'A decorrer'
    cls = 'bg-amber-light text-amber-700'
  } else {
    label = 'Próximo'
    cls = 'bg-green-light text-green-dark'
  }

  return (
    <span
      className={cn(
        'text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap',
        cls,
      )}
    >
      {label}
    </span>
  )
}
