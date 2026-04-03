import { getMeUser } from '@/utilities/getMeUser'
import {
  getOpenCycle,
  getActiveCount,
  getWaitlistCount,
  getAthleteSubscription,
} from '@/helpers/poolHelper'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { WaitlistForm } from './waitlist-form'

const PoolWaitlistPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params

  const { user } = await getMeUser({
    nullUserRedirect: `/${locale}/sign-in?callbackUrl=/${locale}/pool/waitlist`,
  })

  if (!user) return redirect(`/${locale}/sign-in?callbackUrl=/${locale}/pool/waitlist`)

  const cycle = await getOpenCycle()
  if (!cycle) redirect(`/${locale}/pool`)

  const [activeCount, waitlistCount, athleteSub] = await Promise.all([
    getActiveCount(cycle!.id),
    getWaitlistCount(cycle!.id),
    getAthleteSubscription(cycle!.id, user!.id),
  ])

  if (activeCount < cycle!.maxAthletes) redirect(`/${locale}/pool`)
  if (waitlistCount >= cycle!.waitlistLimit) redirect(`/${locale}/pool`)
  if (athleteSub?.status === 'active' || athleteSub?.status === 'waitlisted')
    redirect(`/${locale}/pool`)

  const t = await getTranslations({ locale, namespace: 'PoolSubscription' })
  const expectedPosition = waitlistCount + 1

  return (
    <section className="pt-[104px] pb-24 container mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">{t('waitlistTitle')}</h1>

      <div className="flex flex-col gap-4 mb-8">
        <p className="text-lg">{t('cycleLabel', { month: cycle!.month, year: cycle!.year })}</p>
        <p className="text-lg">
          {t(
            'priceLabel',
            { price: cycle!.price },
            { number: { currency: { style: 'currency', currency: 'EUR' } } },
          )}
        </p>
        <div>
          <p className="font-medium">{t('availableSlotsLabel')}</p>
          <ul className="list-disc list-inside mt-1">
            {cycle!.availableSlots?.map((slot, i) => (
              <li key={i}>
                {slot.day} — {slot.time}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">{t('noRefundNotice')}</p>

      <WaitlistForm cycle={cycle!} user={user!} expectedPosition={expectedPosition} />
    </section>
  )
}

export default PoolWaitlistPage
