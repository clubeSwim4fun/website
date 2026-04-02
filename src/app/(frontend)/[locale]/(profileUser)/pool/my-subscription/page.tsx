import { getMeUser } from '@/utilities/getMeUser'
import { getOpenCycle, getAthleteSubscription, getSlotAttendanceCounts } from '@/helpers/poolHelper'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { CancelButton } from './cancel-button'
import { SlotSelector } from './slot-selector.client'
import { PoolCycle, PoolSubscription } from '@/payload-types'

const MySubscriptionPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params

  const { user } = await getMeUser({
    nullUserRedirect: `/${locale}/sign-in?callbackUrl=/${locale}/pool/my-subscription`,
  })

  const cycle = await getOpenCycle()
  if (!cycle) redirect(`/${locale}/pool`)

  const subscription = await getAthleteSubscription(cycle!.id, user!.id)
  if (!subscription || subscription.status === 'cancelled') redirect(`/${locale}/pool`)

  const t = await getTranslations({ locale, namespace: 'PoolSubscription' })

  const isActive = subscription!.status === 'active'

  // Build slot list with available capacity for active subscribers
  let slotsWithAvailability: Array<{
    index: number
    day: string
    time: string
    maxAttendance: number
    available: number
  }> = []

  if (isActive && cycle!.availableSlots) {
    const attendanceCounts = await getSlotAttendanceCounts(cycle!.id)
    slotsWithAvailability = cycle!.availableSlots.map((slot, i) => {
      const max = (slot as any).maxAttendance ?? 0
      const taken = attendanceCounts[i] ?? 0
      return {
        index: i,
        day: slot.day,
        time: slot.time,
        maxAttendance: max,
        available: max - taken,
      }
    })
  }

  const initialSelected =
    (subscription as PoolSubscription).selectedSlots?.map((s) => s.slotIndex) ?? []

  return (
    <section className="pt-[104px] pb-24 container mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">{t('mySubscriptionTitle')}</h1>

      <div className="flex flex-col gap-4 mb-8">
        <p className="text-lg">{t('cycleLabel', { month: cycle!.month, year: cycle!.year })}</p>

        {isActive && slotsWithAvailability.length > 0 && (
          <SlotSelector
            subscriptionId={subscription!.id}
            slots={slotsWithAvailability}
            initialSelected={initialSelected}
          />
        )}

        {subscription!.status === 'waitlisted' && (
          <div className="flex flex-col gap-2">
            <p className="text-lg font-medium">
              {t('waitlistPosition', { position: subscription!.waitlistPosition ?? 0 })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('waitlistConfirmation', { position: subscription!.waitlistPosition ?? 0 })}
            </p>
          </div>
        )}
      </div>

      <CancelButton subscriptionId={subscription!.id} />
    </section>
  )
}

export default MySubscriptionPage
