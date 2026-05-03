'use client'

import { PoolCycle, PoolSubscription, User } from '@/payload-types'
import { useLocale, useTranslations } from 'next-intl'
import { Info, Zap, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { SubscribeInline } from './subscribe-inline.client'
import { cn } from '@/utilities/ui'
import { getMonthIndex, getMonthLabel } from '@/collections/Pool/PoolCycles'

type SlotAvailability = 'available' | 'limited' | 'full' | 'closed'

// Same dot colors as slot-selector.client.tsx / weekly-slot-selector.client.tsx
const DOT_COLORS: Record<SlotAvailability, string> = {
  available: 'bg-[#22c55e]',
  limited: 'bg-[#f59e0b]',
  full: 'bg-[#ef4444]',
  closed: 'bg-muted-foreground/40',
}

// Outlined badge using the same teal/amber/red tokens
const BADGE_COLORS: Record<SlotAvailability, string> = {
  available: 'border border-[#22c55e] text-[#22c55e]',
  limited: 'border border-[#f59e0b] text-[#f59e0b]',
  full: 'border border-[#ef4444] text-[#ef4444]',
  closed: 'border border-muted-foreground/40 text-muted-foreground/60',
}

type Props = {
  cycle: PoolCycle | null
  activeCount: number
  remainingSpots: number
  remainingWaitlistSpots: number
  user: User
  athleteSub: PoolSubscription | null
  variant: 'subscribe' | 'waitlist' | 'full' | 'closed' | 'already-active' | 'already-waitlisted'
  waitlistPosition?: number
  confirmed?: boolean
}

export const PoolPageClient: React.FC<Props> = ({
  cycle,
  activeCount,
  remainingSpots,
  remainingWaitlistSpots,
  user,
  athleteSub,
  variant: variantProp,
  waitlistPosition,
  confirmed = false,
}) => {
  const t = useTranslations('PoolSubscription')
  const locale = useLocale() as 'en' | 'pt'

  // Treat active-but-unpaid as subscribe so the payment form is shown
  const variant =
    variantProp === 'already-active' && athleteSub?.paymentStatus !== 'paid'
      ? 'subscribe'
      : variantProp

  if (variant === 'closed' || !cycle) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <p className="text-2xl font-semibold text-muted-foreground">{t('closed')}</p>
      </div>
    )
  }

  const weeks = (cycle.weeks ?? []) as Array<{
    startDate: string
    endDate: string
    slots: Array<{ slotId?: string | null; day: string; time: string; maxAttendance: number }>
  }>
  const legacySlots = (cycle.availableSlots ?? []).map((s) => ({
    slotId: s.slotId ?? '',
    day: s.day ?? '',
    time: s.time ?? '',
    maxAttendance: s.maxAttendance ?? 0,
  }))

  // For sessionsPerWeek stat — use first week or legacy
  const firstWeekSlots = weeks[0]?.slots ?? legacySlots
  const uniqueSlots = firstWeekSlots.reduce(
    (acc: Array<{ day: string; time: string }>, slot: { day: string; time: string }) => {
      const key = `${slot.day}-${slot.time}`
      if (!acc.find((s) => `${s.day}-${s.time}` === key)) acc.push(slot)
      return acc
    },
    [],
  )

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })

  const monthName = new Date(cycle.year, getMonthIndex(cycle.month) - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  const sessionsPerWeek = uniqueSlots.length
  const spotsDisplay = remainingSpots > 0 ? remainingSpots : 0
  const isFillingFast = remainingSpots > 0 && remainingSpots <= Math.ceil(cycle.maxAthletes * 0.3)

  const formattedPrice = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(cycle.price)

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Cycle banner — same style as the cycle banner in slot-selector */}
      <div className="rounded-xl bg-[hsl(var(--blue-swim))] text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest opacity-70 font-semibold mb-1">
            {t('currentCycle')}
          </p>
          <p className="text-3xl font-bold capitalize">{monthName}</p>
        </div>
        <div className="flex gap-8 sm:gap-10 shrink-0">
          <div className="text-center">
            <p className="text-3xl font-bold">{sessionsPerWeek}</p>
            <p className="text-xs opacity-70 mt-0.5">{t('sessionsWeekLabel')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{spotsDisplay}</p>
            <p className="text-xs opacity-70 mt-0.5">{t('spotsLeftLabel')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{formattedPrice}</p>
            <p className="text-xs opacity-70 mt-0.5">{t('monthlyFeeLabel')}</p>
          </div>
        </div>
      </div>

      {/* Info banner — same as in slot-selector */}
      {(variant === 'subscribe' || variant === 'waitlist') && (
        <div className="flex gap-3 items-start rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
          <span className="mt-0.5 shrink-0">ℹ️</span>
          <p>{t('slotInfoBanner')}</p>
        </div>
      )}

      {/* Already active banner */}
      {variant === 'already-active' && (
        <div className="flex gap-3 items-start rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            {t('activeConfirmation', {
              month: getMonthLabel(cycle.month, locale),
              year: cycle.year,
            })}
          </p>
        </div>
      )}

      {/* Already waitlisted banner */}
      {variant === 'already-waitlisted' && (
        <div className="flex gap-3 items-start rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{t('waitlistConfirmation', { position: waitlistPosition ?? 0 })}</p>
        </div>
      )}

      {/* Plan card */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          {t('yourPlan')}
        </h2>

        <div className="rounded-lg border border-[hsl(var(--blue-swim))]/40 border-l-4 border-l-[hsl(var(--blue-swim))] bg-card p-6 flex flex-col gap-5">
          {/* Plan header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b">
            <div>
              <p className="font-bold text-[hsl(var(--blue-swim))] text-lg leading-tight">
                {t('planName')}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('cycleLabel', { month: getMonthLabel(cycle.month, locale), year: cycle.year })}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-2xl text-[hsl(var(--blue-swim))]">{formattedPrice}</p>
              <p className="text-xs text-muted-foreground">{t('perMonth')}</p>
            </div>
          </div>

          {/* Training slots */}
          {(weeks.length > 0 || legacySlots.length > 0) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                {t('availableSlotsLabel')}
              </p>
              {weeks.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {weeks.map((week, wi) => {
                    const isPast = new Date(week.endDate) < new Date(new Date().toDateString())
                    return (
                      <div key={wi}>
                        <p className="text-xs text-muted-foreground font-medium mb-1">
                          {formatDate(week.startDate)} – {formatDate(week.endDate)}
                        </p>
                        <div className="flex flex-col divide-y divide-border/50">
                          {week.slots.map((slot, si) => {
                            const avail: SlotAvailability = isPast ? 'closed' : 'available'
                            return (
                              <div
                                key={si}
                                className={cn(
                                  'flex items-center gap-3 py-2.5',
                                  isPast && 'opacity-50',
                                )}
                              >
                                <span
                                  className={cn(
                                    'w-2.5 h-2.5 rounded-full shrink-0',
                                    DOT_COLORS[avail],
                                  )}
                                />
                                <span className="font-bold text-sm uppercase tracking-wide w-28">
                                  {slot.day}
                                </span>
                                <span className="text-sm text-muted-foreground flex-1">
                                  {slot.time}
                                </span>
                                <span
                                  className={cn(
                                    'text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full',
                                    BADGE_COLORS[avail],
                                  )}
                                >
                                  {t(`legend_${avail}`)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border/50">
                  {legacySlots.map((slot, i) => {
                    const avail: SlotAvailability = 'available'
                    return (
                      <div key={i} className="flex items-center gap-3 py-2.5">
                        <span
                          className={cn('w-2.5 h-2.5 rounded-full shrink-0', DOT_COLORS[avail])}
                        />
                        <span className="font-bold text-sm uppercase tracking-wide w-28">
                          {slot.day}
                        </span>
                        <span className="text-sm text-muted-foreground flex-1">{slot.time}</span>
                        <span
                          className={cn(
                            'text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full',
                            BADGE_COLORS[avail],
                          )}
                        >
                          {t(`legend_${avail}`)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Spots remaining + filling fast */}
          <div className="flex items-center justify-between pt-1 border-t">
            <div>
              <span className="text-2xl font-bold text-[hsl(var(--blue-swim))]">
                {spotsDisplay}
              </span>
              <span className="text-sm text-muted-foreground ml-2">{t('spotsRemainingLabel')}</span>
            </div>
            {isFillingFast && (
              <span className="flex items-center gap-1.5 bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/40 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
                <Zap className="w-3 h-3 fill-current" />
                {t('fillingFast')}
              </span>
            )}
          </div>

          {/* Active checkmark */}
          {variant === 'already-active' && (
            <div className="flex items-center gap-2 text-[hsl(var(--blue-swim))] font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {t('subscribed')}
            </div>
          )}
        </div>
      </div>

      {/* No refund warning */}
      {(variant === 'subscribe' || variant === 'waitlist') && (
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{t('noRefundNotice')}</p>
        </div>
      )}

      {/* Actions */}
      {variant === 'subscribe' && !confirmed && (
        <SubscribeInline
          cycle={cycle}
          user={user}
          remainingSpots={remainingSpots}
          existingPendingSubscriptionId={
            variantProp === 'already-active' && athleteSub?.paymentStatus !== 'paid'
              ? athleteSub?.id
              : undefined
          }
        />
      )}

      {/* Confirmation panel — shown after successful payment instead of a separate page */}
      {(variant === 'already-active' || confirmed) && cycle && (
        <div className="flex flex-col gap-5">
          <div className="flex gap-3 items-start rounded-lg border border-[hsl(var(--blue-swim))]/40 border-l-4 border-l-[hsl(var(--blue-swim))] bg-card px-5 py-4">
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-[hsl(var(--blue-swim))]" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-[hsl(var(--blue-swim))]">{t('confirmationTitle')}</p>
              <p className="text-sm text-muted-foreground">
                {t('activeConfirmation', {
                  month: getMonthLabel(cycle.month, locale),
                  year: cycle.year,
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/pool/my-subscription">{t('mySubscriptionTitle')}</Link>
            </Button>
          </div>
        </div>
      )}

      {variant === 'waitlist' && !confirmed && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {t('remainingWaitlistSpots', { count: remainingWaitlistSpots })}
          </p>
          <Button asChild variant="outline" className="w-fit">
            <Link href="/pool/waitlist">{t('joinWaitlistButton')}</Link>
          </Button>
        </div>
      )}

      {variant === 'full' && (
        <p className="text-lg font-semibold text-muted-foreground">{t('fullyBooked')}</p>
      )}

      {variant === 'already-waitlisted' && (
        <Button asChild variant="outline" className="w-fit">
          <Link href="/pool/my-subscription">{t('mySubscriptionTitle')}</Link>
        </Button>
      )}
    </div>
  )
}
