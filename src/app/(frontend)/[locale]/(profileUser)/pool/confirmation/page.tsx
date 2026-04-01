import { getMeUser } from '@/utilities/getMeUser'
import { getOpenCycle, getAthleteSubscription } from '@/helpers/poolHelper'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

const PoolConfirmationPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params

  const { user } = await getMeUser({
    nullUserRedirect: `/${locale}/sign-in?callbackUrl=/${locale}/pool/confirmation`,
  })

  const cycle = await getOpenCycle()

  if (!cycle) {
    redirect(`/${locale}/pool`)
  }

  const subscription = await getAthleteSubscription(cycle.id, user!.id)

  if (!subscription || subscription.status === 'cancelled') {
    redirect(`/${locale}/pool`)
  }

  const t = await getTranslations({ locale, namespace: 'PoolSubscription' })

  return (
    <section className="pt-[104px] pb-24 container mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">{t('confirmationTitle')}</h1>

      <div className="flex flex-col gap-6">
        {subscription.status === 'active' && (
          <p className="text-xl">
            {t('activeConfirmation', { month: cycle.month, year: cycle.year })}
          </p>
        )}

        {subscription.status === 'waitlisted' && (
          <p className="text-xl">
            {t('waitlistConfirmation', { position: subscription.waitlistPosition ?? 1 })}
          </p>
        )}

        <div>
          <Button asChild variant="outline">
            <Link href="/pool">{t('pageTitle')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default PoolConfirmationPage
