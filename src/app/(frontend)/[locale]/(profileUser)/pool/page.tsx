import { getMeUser } from '@/utilities/getMeUser'
import {
  getOpenCycle,
  getActiveCount,
  getWaitlistCount,
  getAthleteSubscription,
  computePoolPageState,
} from '@/helpers/poolHelper'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { PoolCycle, PoolSubscription } from '@/payload-types'

const PoolPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PoolSubscription' })

  const { user } = await getMeUser({
    nullUserRedirect: `/${locale}/sign-in?callbackUrl=/${locale}/pool`,
  })

  const cycle = await getOpenCycle()

  let activeCount = 0
  let waitlistCount = 0
  let athleteSub: PoolSubscription | null = null

  if (cycle) {
    ;[activeCount, waitlistCount, athleteSub] = await Promise.all([
      getActiveCount(cycle.id),
      getWaitlistCount(cycle.id),
      getAthleteSubscription(cycle.id, user!.id),
    ])
  }

  const state = computePoolPageState(cycle, activeCount, waitlistCount, athleteSub)

  const renderCycleDetails = (c: PoolCycle) => (
    <div className="flex flex-col gap-2 text-lg">
      <p>{t('cycleLabel', { month: c.month, year: c.year })}</p>
      <p>
        {t(
          'priceLabel',
          { price: c.price },
          { number: { currency: { style: 'currency', currency: 'EUR' } } },
        )}
      </p>
      <div>
        <p className="font-medium">{t('availableSlotsLabel')}</p>
        <ul className="list-disc list-inside mt-1">
          {c.availableSlots?.map((slot, i) => (
            <li key={i}>
              {slot.day} — {slot.time}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <section className="pt-[104px] pb-24 container mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">{t('pageTitle')}</h1>

      {state.variant === 'closed' && <p className="text-xl text-muted-foreground">{t('closed')}</p>}

      {state.variant === 'subscribe' && cycle && (
        <div className="flex flex-col gap-6">
          {renderCycleDetails(cycle)}
          <p className="text-lg">{t('remainingSpots', { count: state.remainingSpots })}</p>
          <div>
            <Button asChild>
              <Link href="/pool/subscribe">{t('subscribeButton')}</Link>
            </Button>
          </div>
        </div>
      )}

      {state.variant === 'waitlist' && cycle && (
        <div className="flex flex-col gap-6">
          {renderCycleDetails(cycle)}
          <p className="text-lg text-muted-foreground">{t('fullyBooked')}</p>
          <p className="text-lg">
            {t('remainingWaitlistSpots', { count: state.remainingWaitlistSpots })}
          </p>
          <div>
            <Button asChild variant="outline">
              <Link href="/pool/waitlist">{t('joinWaitlistButton')}</Link>
            </Button>
          </div>
        </div>
      )}

      {state.variant === 'full' && cycle && (
        <div className="flex flex-col gap-6">
          {renderCycleDetails(cycle)}
          <p className="text-lg font-semibold">{t('fullyBooked')}</p>
        </div>
      )}

      {state.variant === 'already-active' && cycle && (
        <div className="flex flex-col gap-6">
          <p className="text-lg font-semibold text-green-600">
            {t('activeConfirmation', { month: cycle.month, year: cycle.year })}
          </p>
          {renderCycleDetails(cycle)}
          <div>
            <Button asChild variant="outline">
              <Link href="/pool/my-subscription">{t('mySubscriptionTitle')}</Link>
            </Button>
          </div>
        </div>
      )}

      {state.variant === 'already-waitlisted' && cycle && (
        <div className="flex flex-col gap-6">
          <p className="text-lg font-semibold">
            {t('waitlistPosition', { position: state.position })}
          </p>
          {renderCycleDetails(cycle)}
          <div>
            <Button asChild variant="outline">
              <Link href="/pool/my-subscription">{t('mySubscriptionTitle')}</Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

export default PoolPage
