import { getMeUser } from '@/utilities/getMeUser'
import { getOpenCycle, getAthleteSubscription, getWeekSlotData } from '@/helpers/poolHelper'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { CancelButton } from './cancel-button'
import { WeeklySlotSelector } from './weekly-slot-selector.client'

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
  const weeks = isActive ? await getWeekSlotData(cycle!, user!.id) : []

  return (
    <section className="pt-[104px] pb-24 container mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">{t('mySubscriptionTitle')}</h1>
      <p className="text-muted-foreground mb-8">{t('mySubscriptionSubtitle')}</p>

      {isActive && weeks.length > 0 && (
        <WeeklySlotSelector
          subscriptionId={subscription!.id}
          weeks={weeks}
          cycleMonth={cycle!.month}
          cycleYear={cycle!.year}
        />
      )}

      {subscription!.status === 'waitlisted' && (
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-lg font-medium">
            {t('waitlistPosition', { position: subscription!.waitlistPosition ?? 0 })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('waitlistConfirmation', { position: subscription!.waitlistPosition ?? 0 })}
          </p>
        </div>
      )}

      <div className="mt-8">
        <CancelButton subscriptionId={subscription!.id} />
      </div>
    </section>
  )
}

export default MySubscriptionPage
