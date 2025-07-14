import { GeneralConfig } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMeUser } from '@/utilities/getMeUser'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { TypedLocale } from 'payload'
import { Handshake } from 'lucide-react'
import { cn } from '@/utilities/ui'

const UserSubscriptionConfirmationPage = async ({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) => {
  const { locale, id } = await params
  const userObject = await getMeUser({ invalidateCache: true })
  const t = await getTranslations()
  // let isLoading = true

  if (!userObject || !userObject.user) {
    redirect(`sign-in?callbackUrl=/${locale}/subscription/order-generation`)
  }

  const user = userObject.user

  return (
    <section
      className={cn(
        'pt-[104px] pb-24 container max-w-5xl',
        `${user.status !== 'active' ? 'mx' : 'm'}-auto`,
      )}
    >
      <div className="flex mt-6 justify-center items-center">
        <div className="w-1/3 border-r-2 border-gray-600 flex items-center justify-center">
          <Handshake className="w-40 h-40 stroke-1" />
        </div>
        <div className="flex flex-col gap-4 justify-start items-start p-6">
          <p className="font-bold text-3xl">
            {t('Subscription.userTitle', {
              username: user.name,
            })}
          </p>
          <p className="text-xl">{t('Subscription.subscriptionConfirmation', { id })}</p>
        </div>
      </div>
    </section>
  )
}

export default UserSubscriptionConfirmationPage

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
