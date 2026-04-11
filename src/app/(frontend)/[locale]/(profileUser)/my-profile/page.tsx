import { UserDetails } from '@/components/User/user-details'
import { UserFutureEvents } from '@/components/User/user-future-events'
import { UserSubscriptions } from '@/components/User/user-subscriptions'
import { UserProfileHeader } from '@/components/User/user-profile-header'
import { GeneralConfig } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMeUser } from '@/utilities/getMeUser'
import { getCountryCode } from '@/helpers/userHelper'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { TypedLocale } from 'payload'
import { getUserFutureEvents } from '@/helpers/userHelper'
import { getUserSubscriptions } from '@/helpers/subscriptionHelper'

const UserPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const userObject = await getMeUser({ invalidateCache: true })

  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig

  if (!userObject || !userObject.user) notFound()

  const user = userObject.user

  if (user.status !== 'active') {
    redirect(`/${locale}/subscription`)
  }

  const [eventsData, subsResult, countryCode] = await Promise.all([
    getUserFutureEvents({ userId: user.id, dateFilter: 'all' }),
    getUserSubscriptions({ userId: user.id }),
    getCountryCode(user.nationality as string),
  ])

  const poolSubCount = subsResult.rows.filter((r) => r.kind === 'pool').length

  return (
    <section className=" pb-24 min-h-screen" style={{ background: '#fdf8f3' }}>
      <div className="container mx-auto max-w-4xl px-4 flex flex-col gap-6">
        <UserProfileHeader
          user={user}
          globalConfig={globalConfig}
          eventCount={eventsData.events.length}
          subscriptionCount={subsResult.totalDocs}
          poolSubCount={poolSubCount}
        />

        <UserDetails user={user} countryCode={countryCode || 'PT'} />

        <UserFutureEvents userId={user.id} />
        <UserSubscriptions userId={user.id} />
      </div>
    </section>
  )
}

export default UserPage

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

  const myProfile = globalConfig?.settings?.fixedPages?.myProfile
  const clubTitle = globalConfig?.clubName || t('Club')
  const myProfileTitle = myProfile?.title || t('MyProfile')

  return {
    title: `${clubTitle} - ${myProfileTitle}`,
  }
}
