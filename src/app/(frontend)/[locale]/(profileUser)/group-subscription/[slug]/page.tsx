import { GeneralConfig } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMeUser } from '@/utilities/getMeUser'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { getPayload, TypedLocale } from 'payload'
import configPromise from '@payload-config'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import GroupSubscriptionPageClient from './page.client'

const GroupSubscriptionPage = async ({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) => {
  const payload = await getPayload({ config: configPromise })
  const { locale, slug } = await params
  const userObject = await getMeUser({ invalidateCache: true })

  console.log('slug', slug)

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
    // TODO - add a proper error page or redirect
  }

  const form = group?.subscriptionForm as FormType

  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig

  if (!userObject || !userObject.user) {
    redirect(`sign-in?callbackUrl=/${locale}/group-subscription/${slug}`)
  }

  const user = userObject.user

  return (
    <GroupSubscriptionPageClient
      user={user}
      formConfig={form}
      globalConfig={globalConfig}
      groupSlug={slug}
    />
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
