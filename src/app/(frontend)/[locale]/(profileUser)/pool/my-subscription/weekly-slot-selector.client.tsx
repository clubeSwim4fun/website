'use client'

import { selectPoolSlots, joinSlotWaitlist, leaveSlotWaitlist } from '@/actions/pool-subscription'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from '@/i18n/routing'
import { cn } from '@/utilities/ui'
import { Check, Clock, Lock, Loader, Save, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import type { WeekData, WeekSlot } from '@/helpers/poolHelper'
import { getMonthIndex, getMonthLabel } from '@/collections/Pool/PoolCycles'

// ─── Types ───────────────────────────────────────────────────────────────────

type SlotStatus = 'available' | 'limited' | 'full' | 'selected' | 'waitlist'

function getSlotStatus(slot: WeekSlot, isSelected: boolean, heldOnServer: boolean): SlotStatus {
  if (isSelected) return 'selected'
  if (slot.userWaitlistPosition !== null) return 'waitlist'
  if (slot.available <= 0 && !heldOnServer) return 'full'
  if (slot.available <= Math.ceil(slot.maxAttendance * 0.3)) return 'limited'
  return 'available'
}

const STATUS_BORDER: Record<SlotStatus, string> = {
  available: 'border-l-[#22c55e]',
  limited: 'border-l-[#f59e0b]',
  full: 'border-l-[#ef4444]',
  selected: 'border-l-[hsl(var(--blue-swim))]',
  waitlist: 'border-l-[hsl(var(--slot-waitlist))]',
}

const STATUS_LABEL_CLASS: Record<SlotStatus, string> = {
  available: 'text-[#22c55e]',
  limited: 'text-[#f59e0b]',
  full: 'text-[#ef4444]',
  selected: 'text-[hsl(var(--blue-swim))]',
  waitlist: 'text-[hsl(var(--slot-waitlist))]',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (d: string) => {
    const date = new Date(d)
    return `${date.getUTCDate()} ${date.toLocaleString('en', { month: 'short', timeZone: 'UTC' })}`
  }
  return `${fmt(startDate)} – ${fmt(endDate)}`
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Slot row (shared between tabs) ──────────────────────────────────────────

function SlotRow({
  slot,
  isSelected,
  heldOnServer,
  readOnly,
  onToggle,
  onJoinWaitlist,
  onLeaveWaitlist,
  waitlistLoading,
}: {
  slot: WeekSlot
  isSelected: boolean
  heldOnServer: boolean
  readOnly: boolean
  onToggle: () => void
  onJoinWaitlist: () => void
  onLeaveWaitlist: () => void
  waitlistLoading: boolean
}) {
  const t = useTranslations('PoolSubscription')
  const status = getSlotStatus(slot, isSelected, heldOnServer)
  const isFull = slot.available <= 0 && !isSelected && !heldOnServer
  const isOnWaitlist = slot.userWaitlistPosition !== null
  const fillPct = Math.min(
    100,
    slot.maxAttendance > 0
      ? Math.round(((slot.maxAttendance - slot.available) / slot.maxAttendance) * 100)
      : 0,
  )

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border bg-card px-5 py-4 border-l-4 transition-all duration-200',
        STATUS_BORDER[status],
        isSelected && !readOnly && 'ring-1 ring-[hsl(var(--blue-swim))]',
        isOnWaitlist && !isSelected && 'ring-1 ring-[hsl(var(--slot-waitlist))]',
      )}
    >
      <div
        onClick={readOnly || (isFull && !isOnWaitlist) ? undefined : onToggle}
        className={cn(
          'flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4',
          readOnly || (isFull && !isOnWaitlist) ? 'cursor-default' : 'cursor-pointer',
        )}
      >
        {/* Day + time — always visible, full width on mobile */}
        <div className="flex items-center justify-between sm:flex-1 sm:min-w-0">
          <div>
            <p className="font-semibold uppercase tracking-wide text-sm">{slot.day}</p>
            <p className="text-muted-foreground text-sm">{slot.time}</p>
          </div>
          {/* Checkbox — shown inline with day on mobile, at end on desktop */}
          {!readOnly && (
            <div
              className={cn(
                'sm:hidden w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
                isSelected
                  ? 'bg-[hsl(var(--blue-swim))] border-[hsl(var(--blue-swim))]'
                  : isOnWaitlist
                    ? 'bg-[hsl(var(--slot-waitlist))] border-[hsl(var(--slot-waitlist))]'
                    : 'border-muted-foreground',
              )}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              {isOnWaitlist && !isSelected && <Clock className="w-3 h-3 text-white" />}
            </div>
          )}
        </div>

        {/* Progress bar + enrolled count + status label + checkbox (desktop) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 flex-1 sm:w-32 sm:flex-none sm:shrink-0">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', {
                  'bg-[#22c55e]': status === 'available',
                  'bg-[#f59e0b]': status === 'limited',
                  'bg-[#ef4444]': status === 'full' || status === 'waitlist',
                  'bg-[hsl(var(--blue-swim))]': status === 'selected',
                })}
                style={{ width: `${fillPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {slot.maxAttendance - slot.available}/{slot.maxAttendance} {t('enrolled')}
            </p>
          </div>

          <div
            className={cn(
              'text-xs font-semibold shrink-0 text-right sm:w-24',
              STATUS_LABEL_CLASS[status],
            )}
          >
            {readOnly && isSelected && (
              <span className="inline-flex items-center justify-end gap-1 text-[hsl(var(--blue-swim))]">
                <Check className="w-3 h-3" /> {t('attended')}
              </span>
            )}
            {readOnly && !isSelected && (
              <span className="text-muted-foreground">{t('skipped')}</span>
            )}
            {!readOnly && status === 'selected' && (
              <span className="flex items-center justify-end gap-1">
                <Check className="w-3 h-3" /> {t('legend_selected')}
              </span>
            )}
            {!readOnly && status === 'waitlist' && (
              <span className="flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" /> #{slot.userWaitlistPosition}
              </span>
            )}
            {!readOnly && status === 'full' && t('legend_full')}
            {!readOnly &&
              (status === 'limited' || status === 'available') &&
              t('spotsLeft', { count: slot.available })}
          </div>

          {/* Checkbox — desktop only (mobile version is above) */}
          {!readOnly && (
            <div
              className={cn(
                'hidden sm:flex w-6 h-6 rounded-full border-2 items-center justify-center shrink-0 transition-all duration-200',
                isSelected
                  ? 'bg-[hsl(var(--blue-swim))] border-[hsl(var(--blue-swim))]'
                  : isOnWaitlist
                    ? 'bg-[hsl(var(--slot-waitlist))] border-[hsl(var(--slot-waitlist))]'
                    : 'border-muted-foreground',
              )}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              {isOnWaitlist && !isSelected && <Clock className="w-3 h-3 text-white" />}
            </div>
          )}
        </div>
      </div>

      {/* Waitlist actions — only for full slots in open (non-readonly) weeks */}
      {!readOnly && isFull && (
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          {isOnWaitlist ? (
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-[hsl(var(--slot-waitlist))] font-medium">
                {t('slotWaitlistPosition', { position: slot.userWaitlistPosition! })}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                disabled={waitlistLoading}
                onClick={(e) => {
                  e.stopPropagation()
                  onLeaveWaitlist()
                }}
              >
                {waitlistLoading ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : (
                  t('leaveWaitlistButton')
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-muted-foreground">
                {t('slotWaitlistCount', { count: slot.waitlistCount })}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-[hsl(var(--slot-waitlist))] text-[hsl(var(--slot-waitlist))] hover:bg-[hsl(var(--slot-waitlist))] hover:text-white"
                disabled={waitlistLoading}
                onClick={(e) => {
                  e.stopPropagation()
                  onJoinWaitlist()
                }}
              >
                {waitlistLoading ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : (
                  t('joinSlotWaitlistButton')
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

// ─── Summary panel ────────────────────────────────────────────────────────────

// Parse hours from a time range string like "10h-11h" or "09h-10h"
function parseSlotHours(time: string): number {
  const match = time.match(/(\d+)h.*?(\d+)h/)
  if (!match || !match[1] || !match[2]) return 1
  return Math.abs(parseInt(match[2]) - parseInt(match[1]))
}

function SummaryPanel({
  selectedIds,
  slots,
  onRemoveChip,
  readOnly,
}: {
  selectedIds: string[]
  slots: WeekSlot[]
  onRemoveChip: (id: string) => void
  readOnly: boolean
}) {
  const t = useTranslations('PoolSubscription')
  const totalHours = selectedIds.reduce((sum, slotId) => {
    const slot = slots.find((s) => s.slotId === slotId)
    return sum + (slot ? parseSlotHours(slot.time) : 1)
  }, 0)

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('yourSummary')}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: selectedIds.length, label: t('confirmedSlots') },
          { value: `${totalHours}h`, label: t('poolTimeMonth') },
        ].map(({ value, label }) => (
          <div key={label} className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          {t('selectedSlots')}
        </p>
        {selectedIds.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noSlotsSelected')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((slotId) => {
              const slot = slots.find((s) => s.slotId === slotId)
              if (!slot) return null
              return (
                <span
                  key={slotId}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--blue-swim))] text-white text-xs px-3 py-1"
                >
                  {slot.day} {slot.time}
                  {!readOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveChip(slotId)
                      }}
                      className="hover:opacity-70 transition-opacity"
                      aria-label={`Remove ${slot.day}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  subscriptionId: string
  cycleId: string
  weeks: WeekData[]
  cycleMonth: string
  cycleYear: number
}

export const WeeklySlotSelector: React.FC<Props> = ({
  subscriptionId,
  cycleId,
  weeks,
  cycleMonth,
  cycleYear,
}) => {
  const t = useTranslations('PoolSubscription')
  const locale = useLocale() as 'en' | 'pt'
  const { toast } = useToast()
  const router = useRouter()

  // Per-week selected state, keyed by weekIndex
  const [selectedByWeek, setSelectedByWeek] = useState<Record<number, string[]>>(() => {
    const init: Record<number, string[]> = {}
    for (const w of weeks) init[w.weekIndex] = [...w.selectedSlotIds]
    return init
  })
  const [saving, setSaving] = useState(false)
  const [waitlistLoadingSlotId, setWaitlistLoadingSlotId] = useState<string | null>(null)
  const currentWeek = weeks.find((w) => w.status === 'current') ?? weeks[0]
  const defaultTab = currentWeek ? String(currentWeek.weekIndex) : '0'

  const toggle = (weekIndex: number, slot: WeekSlot, initialIds: string[]) => {
    const heldOnServer = initialIds.includes(slot.slotId)
    const current = selectedByWeek[weekIndex] ?? []
    if (slot.available <= 0 && !current.includes(slot.slotId) && !heldOnServer) return
    setSelectedByWeek((prev) => ({
      ...prev,
      [weekIndex]: current.includes(slot.slotId)
        ? current.filter((id) => id !== slot.slotId)
        : [...current, slot.slotId],
    }))
  }

  const removeChip = (weekIndex: number, slotId: string) => {
    setSelectedByWeek((prev) => ({
      ...prev,
      [weekIndex]: (prev[weekIndex] ?? []).filter((id) => id !== slotId),
    }))
  }

  const clearWeek = (weekIndex: number) => {
    setSelectedByWeek((prev) => ({ ...prev, [weekIndex]: [] }))
  }

  const handleSave = async (week: WeekData) => {
    const slotIds = selectedByWeek[week.weekIndex] ?? []
    setSaving(true)
    const result = await selectPoolSlots(subscriptionId, slotIds)
    setSaving(false)
    if (!result.success) {
      toast({ variant: 'destructive', description: result.message || t('cycleNotFound') })
      setSelectedByWeek((prev) => ({ ...prev, [week.weekIndex]: [...week.selectedSlotIds] }))
    } else {
      toast({ description: t('slotsSaved') })
    }
    router.refresh()
  }

  const handleJoinWaitlist = async (slot: WeekSlot) => {
    setWaitlistLoadingSlotId(slot.slotId)
    const result = await joinSlotWaitlist(cycleId, slot.slotId, slot.day, slot.time)
    setWaitlistLoadingSlotId(null)
    if (!result.success) {
      toast({ variant: 'destructive', description: result.message || t('cycleNotFound') })
    } else {
      toast({ description: t('slotWaitlistJoined', { position: result.position ?? 0 }) })
      router.refresh()
    }
  }

  const handleLeaveWaitlist = async (slot: WeekSlot) => {
    setWaitlistLoadingSlotId(slot.slotId)
    const result = await leaveSlotWaitlist(cycleId, slot.slotId)
    setWaitlistLoadingSlotId(null)
    if (!result.success) {
      toast({ variant: 'destructive', description: result.message || t('cycleNotFound') })
    } else {
      toast({ description: t('slotWaitlistLeft') })
      router.refresh()
    }
  }

  const totalSelected = Object.values(selectedByWeek).flat().length

  const totalHours = Object.entries(selectedByWeek).reduce((sum, [weekIdx, ids]) => {
    const week = weeks.find((w) => w.weekIndex === Number(weekIdx))
    if (!week) return sum
    return (
      sum +
      ids.reduce((wSum, slotId) => {
        const slot = week.slots.find((s) => s.slotId === slotId)
        return wSum + (slot ? parseSlotHours(slot.time) : 1)
      }, 0)
    )
  }, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Cycle banner */}
      <div className="rounded-xl bg-[hsl(var(--blue-swim))] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest opacity-80">{t('activeCycle')}</p>
          <p className="text-2xl font-bold mt-0.5">
            {new Date(cycleYear, getMonthIndex(cycleMonth) - 1).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-bold">{totalSelected}</p>
            <p className="text-xs opacity-80">{t('daysSelected')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalHours}h</p>
            <p className="text-xs opacity-80">{t('poolTimeMonth')}</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex gap-3 items-start rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
        <span className="mt-0.5 shrink-0">ℹ️</span>
        <p>{t('slotInfoBanner')}</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {(['available', 'limited', 'full', 'selected', 'waitlist'] as SlotStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span
              className={cn('w-2.5 h-2.5 rounded-full', {
                'bg-[#22c55e]': s === 'available',
                'bg-[#f59e0b]': s === 'limited',
                'bg-[#ef4444]': s === 'full',
                'bg-[hsl(var(--blue-swim))]': s === 'selected',
                'bg-[hsl(var(--slot-waitlist))]': s === 'waitlist',
              })}
            />
            {t(`legend_${s}`)}
          </span>
        ))}
      </div>

      {/* Week tabs */}
      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full h-auto p-1 gap-1">
          {weeks.map((week) => {
            const weekSelected = selectedByWeek[week.weekIndex] ?? []
            return (
              <TabsTrigger
                key={week.weekIndex}
                value={String(week.weekIndex)}
                className="flex-1 flex flex-col items-center gap-1 py-2 px-1 sm:px-3 h-auto min-w-0"
              >
                <span className="text-xs sm:text-sm font-medium text-center break-words hyphens-auto leading-tight w-full">
                  {week.status === 'last' && t('lastWeek')}
                  {week.status === 'current' && t('thisWeek')}
                  {week.status === 'next' && t('nextWeek')}
                </span>
                <span
                  className={cn('text-xs px-2 py-0.5 rounded-full font-medium', {
                    'bg-muted text-muted-foreground': week.status === 'last',
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                      week.status === 'current',
                    'bg-muted text-muted-foreground opacity-60': week.status === 'next',
                  })}
                >
                  {week.status === 'last' && `${weekSelected.length} ${t('done')}`}
                  {week.status === 'current' && t('open')}
                  {week.status === 'next' && t('locked')}
                </span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {weeks.map((week) => {
          const weekSelected = selectedByWeek[week.weekIndex] ?? []
          const isReadOnly = week.status === 'last'
          const isLocked = week.status === 'next'
          const isOpen = week.status === 'current'

          // Check if next week is open based on nextWeekOpenDate of the current week
          const prevWeek = weeks.find((w) => w.weekIndex === week.weekIndex - 1)
          const openDate = prevWeek?.nextWeekOpenDate ?? null
          const isActuallyOpen = !openDate || new Date() >= new Date(openDate)

          return (
            <TabsContent key={week.weekIndex} value={String(week.weekIndex)} className="mt-4">
              {/* Week header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-base">
                    {formatDateRange(week.startDate, week.endDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isReadOnly && t('weekCompleted')}
                    {isOpen && t('weekOpen')}
                    {isLocked && t('weekUpcoming')}
                  </p>
                </div>
                <span
                  className={cn('text-xs font-semibold px-3 py-1 rounded-full border', {
                    'border-muted-foreground text-muted-foreground': isReadOnly,
                    'border-green-500 text-green-600 dark:text-green-400': isOpen,
                    'border-muted text-muted-foreground opacity-60': isLocked,
                  })}
                >
                  {isReadOnly && t('statusCompleted')}
                  {isOpen && t('statusOpen')}
                  {isLocked && t('statusLocked')}
                </span>
              </div>

              {/* Locked state */}
              {isLocked && (
                <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-base">{t('lockedTitle')}</p>
                  {openDate && !isActuallyOpen ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {t('lockedDescription', {
                          date: new Date(openDate).toLocaleDateString('default', {
                            day: 'numeric',
                            month: 'short',
                          }),
                        })}
                      </p>
                      <p className="text-sm font-medium text-[hsl(var(--blue-swim))]">
                        {t('opensInDays', { days: daysUntil(openDate) })}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('lockedNoDate')}</p>
                  )}
                </div>
              )}

              {/* Slot list */}
              {!isLocked && (
                <>
                  <ul className="flex flex-col gap-3 mb-4">
                    {week.slots.map((slot) => (
                      <SlotRow
                        key={slot.slotId}
                        slot={slot}
                        isSelected={weekSelected.includes(slot.slotId)}
                        heldOnServer={week.selectedSlotIds.includes(slot.slotId)}
                        readOnly={isReadOnly}
                        onToggle={() => toggle(week.weekIndex, slot, week.selectedSlotIds)}
                        onJoinWaitlist={() => handleJoinWaitlist(slot)}
                        onLeaveWaitlist={() => handleLeaveWaitlist(slot)}
                        waitlistLoading={waitlistLoadingSlotId === slot.slotId}
                      />
                    ))}
                  </ul>

                  <SummaryPanel
                    selectedIds={weekSelected}
                    slots={week.slots}
                    onRemoveChip={(id) => removeChip(week.weekIndex, id)}
                    readOnly={isReadOnly}
                  />

                  {isOpen && (
                    <div className="flex items-center gap-3 mt-4">
                      <Button onClick={() => handleSave(week)} disabled={saving} className="gap-2">
                        {saving ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            {t('saveSlotsButton')}
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {t('saveSlotsButton')}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => clearWeek(week.weekIndex)}
                        disabled={saving || weekSelected.length === 0}
                      >
                        {t('clearAll')}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <p className="text-xs text-muted-foreground">
        {t('changesSavedFor', { month: getMonthLabel(cycleMonth, locale), year: cycleYear })}
      </p>
    </div>
  )
}
