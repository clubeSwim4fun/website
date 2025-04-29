import { getUserPaymentAmount } from '@/helpers/userHelper'
import { GeneralConfig } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMeUser } from '@/utilities/getMeUser'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { TypedLocale } from 'payload'

const UserSubscriptionPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const userObject = await getMeUser({ invalidateCache: true })

  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig

  const { amount, endDate, startDate } = await getUserPaymentAmount({
    user: userObject.user,
    fees: globalConfig.associationFees,
    payForCurrentMonth: true,
  })

  if (!userObject || !userObject.user) {
    redirect(`sign-in?callbackUrl=/${locale}/subscription`)
  }

  const user = userObject.user

  return (
    <section className="pt-[104px] pb-24 container mx-auto max-w-5xl">
      hello {user.name} you need to pay: €{amount}
    </section>
  )
}

export default UserSubscriptionPage

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig

  const subscription = globalConfig?.settings?.fixedPages?.subscription

  const clubTitle = globalConfig?.clubName || t('Club')
  const subscriptionTitle = subscription?.title || t('Subscription')

  return {
    title: `${clubTitle} - ${subscriptionTitle}`,
  }
}
