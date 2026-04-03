'use client'

import { selectPoolSlots } from '@/actions/pool-subscription'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from '@/i18n/routing'
import { cn } from '@/utilities/ui'
import { Check, Loader, Save, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export type SlotData = {
  index: number
  slotId: string
  day: string
  time: string
  maxAttendance: number
  available: number
}

type SlotStatus = 'available' | 'limited' | 'full' | 'selected'

function getSlotStatus(slot: SlotData, isSelected: boolean, heldOnServer: boolean): SlotStatus {
  if (isSelected) return 'selected'
  if (slot.available <= 0 && !heldOnServer) return 'full'
  if (slot.available <= Math.ceil(slot.maxAttendance * 0.3)) return 'limited'
  return 'available'
}

const STATUS_BORDER: Record<SlotStatus, string> = {
  available: 'border-l-[#22c55e]',
  limited: 'border-l-[#f59e0b]',
  full: 'border-l-[#ef4444]',
  selected: 'border-l-[hsl(var(--blue-swim))]',
}

const STATUS_LABEL_CLASS: Record<SlotStatus, string> = {
  available: 'text-[#22c55e]',
  limited: 'text-[#f59e0b]',
  full: 'text-[#ef4444]',
  selected: 'text-[hsl(var(--blue-swim))]',
}

type Props = {
  subscriptionId: string
  slots: SlotData[]
  /** slotIds the server has confirmed as selected for this user */
  initialSelectedIds: string[]
  cycleMonth: number
  cycleYear: number
}

export const SlotSelector: React.FC<Props> = ({
  subscriptionId,
  slots,
  initialSelectedIds,
  cycleMonth,
  cycleYear,
}) => {
  const t = useTranslations('PoolSubscription')
  const { toast } = useToast()
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds)
  const [saving, setSaving] = useState(false)

  const toggle = (slot: SlotData) => {
    const heldOnServer = initialSelectedIds.includes(slot.slotId)
    if (slot.available <= 0 && !selectedIds.includes(slot.slotId) && !heldOnServer) return
    setSelectedIds((prev) =>
      prev.includes(slot.slotId) ? prev.filter((id) => id !== slot.slotId) : [...prev, slot.slotId],
    )
  }

  const removeChip = (slotId: string) =>
    setSelectedIds((prev) => prev.filter((id) => id !== slotId))
  const clearAll = () => setSelectedIds([])

  const handleSave = async () => {
    setSaving(true)
    const result = await selectPoolSlots(subscriptionId, selectedIds)
    setSaving(false)
    if (!result.success) {
      toast({ variant: 'destructive', description: result.message || t('cycleNotFound') })
      setSelectedIds(initialSelectedIds)
    } else {
      toast({ description: t('slotsSaved') })
    }
    router.refresh()
  }

  const sessionsPerMonth = selectedIds.length * 4
  const poolHours = Math.round(sessionsPerMonth * 1)

  return (
    <div className="flex flex-col gap-6">
      {/* Cycle banner */}
      <div className="rounded-xl bg-[hsl(var(--blue-swim))] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest opacity-80">{t('activeCycle')}</p>
          <p className="text-2xl font-bold mt-0.5">
            {new Date(cycleYear, cycleMonth - 1).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-bold">{selectedIds.length}</p>
            <p className="text-xs opacity-80">{t('daysSelected')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{sessionsPerMonth}</p>
            <p className="text-xs opacity-80">{t('sessionsMonth')}</p>
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
        {(['available', 'limited', 'full', 'selected'] as SlotStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span
              className={cn('w-2.5 h-2.5 rounded-full', {
                'bg-[#22c55e]': s === 'available',
                'bg-[#f59e0b]': s === 'limited',
                'bg-[#ef4444]': s === 'full',
                'bg-[hsl(var(--blue-swim))]': s === 'selected',
              })}
            />
            {t(`legend_${s}`)}
          </span>
        ))}
      </div>

      {/* Slot rows */}
      <ul className="flex flex-col gap-3">
        {slots.map((slot) => {
          const isSelected = selectedIds.includes(slot.slotId)
          const heldOnServer = initialSelectedIds.includes(slot.slotId)
          const status = getSlotStatus(slot, isSelected, heldOnServer)
          const isFull = slot.available <= 0 && !isSelected && !heldOnServer
          const fillPct = Math.min(
            100,
            slot.maxAttendance > 0
              ? Math.round(((slot.maxAttendance - slot.available) / slot.maxAttendance) * 100)
              : 0,
          )

          return (
            <li
              key={slot.slotId}
              onClick={() => toggle(slot)}
              className={cn(
                'relative flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4',
                'border-l-4 transition-all duration-200',
                STATUS_BORDER[status],
                isFull ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md',
                isSelected && 'ring-1 ring-[hsl(var(--blue-swim))]',
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold uppercase tracking-wide text-sm">{slot.day}</p>
                <p className="text-muted-foreground text-sm">{slot.time}</p>
              </div>

              <div className="flex flex-col gap-1 w-32 shrink-0">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', {
                      'bg-[#22c55e]': status === 'available',
                      'bg-[#f59e0b]': status === 'limited',
                      'bg-[#ef4444]': status === 'full',
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
                  'text-xs font-semibold w-24 text-right shrink-0',
                  STATUS_LABEL_CLASS[status],
                )}
              >
                {status === 'selected' && (
                  <span className="flex items-center justify-end gap-1">
                    <Check className="w-3 h-3" /> {t('legend_selected')}
                  </span>
                )}
                {status === 'full' && t('legend_full')}
                {(status === 'limited' || status === 'available') &&
                  t('spotsLeft', { count: slot.available })}
              </div>

              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
                  isSelected
                    ? 'bg-[hsl(var(--blue-swim))] border-[hsl(var(--blue-swim))]'
                    : 'border-muted-foreground',
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            </li>
          )
        })}
      </ul>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('yourSummary')}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: selectedIds.length, label: t('confirmedSlots') },
            { value: sessionsPerMonth, label: t('sessionsMonth') },
            { value: `${poolHours}h`, label: t('poolTimeMonth') },
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeChip(slotId)
                      }}
                      className="hover:opacity-70 transition-opacity"
                      aria-label={`Remove ${slot.day}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
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
        <Button variant="ghost" onClick={clearAll} disabled={saving || selectedIds.length === 0}>
          {t('clearAll')}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {t('changesSavedFor', { month: cycleMonth, year: cycleYear })}
      </p>
    </div>
  )
}
