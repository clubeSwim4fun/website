import { GeneralConfig } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMeUser } from '@/utilities/getMeUser'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { getPayload, TypedLocale } from 'payload'
import { cn } from '@/utilities/ui'
import configPromise from '@payload-config'
import { PaymentForm } from './payment-form'
import { getClientSideURL } from '@/utilities/getURL'
import PaymentStatus from './payment-status'
import { generateSibsPaymentTransaction } from '@/helpers/sibsHelper'

const GroupSubscriptionPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ id: string }>
}) => {
  const payload = await getPayload({ config: configPromise })
  const { locale, slug } = await params
  const { id } = await searchParams
  const userObject = await getMeUser({ invalidateCache: true })
  const t = await getTranslations()
  let sibsTransactionID, sibsFormContext

  const groupConfig = await payload.find({
    collection: 'groups',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  const group = groupConfig?.docs?.[0]

  if (!group || !group.hasSubscription) {
    console.error('Group not found or does not have a subscription')
  }

  if (!userObject || !userObject.user) {
    redirect(
      `/sign-in?callbackUrl=/${locale}/group-subscription/${slug}/payment${id ? '?id=' + id : ''}`,
    )
  }

  const user = userObject.user

  if (!id) {
    const { transactionID, formContext } = await generateSibsPaymentTransaction({
      price: group?.subscriptionPrice || 0,
      orderID: `group-subscription-${user.id}`,
      description: t(`GroupSubscription.description`, {
        groupName: group?.title || 'Group',
      }),
    })

    sibsTransactionID = transactionID
    sibsFormContext = formContext
  }

  return (
    <section
      className={cn(
        'pt-[104px] pb-24 container max-w-5xl',
        `${user.status !== 'active' ? 'mx' : 'm'}-auto`,
      )}
    >
      {id ? (
        <PaymentStatus id={id} />
      ) : (
        <PaymentForm
          transactionID={sibsTransactionID}
          formContext={sibsFormContext}
          groupSlug={slug}
        />
      )}
    </section>
  )
}

export default GroupSubscriptionPage

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
