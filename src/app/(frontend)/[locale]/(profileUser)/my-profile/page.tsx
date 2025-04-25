import { UserAvatar } from '@/components/Avatar'
import { UserDetails } from '@/components/User/user-details'
import { UserFutureEvents } from '@/components/User/user-future-events'
import { UserProfile } from '@/components/User/user-profile'
import { GeneralConfig, Media } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMeUser } from '@/utilities/getMeUser'
import { getClientSideURL } from '@/utilities/getURL'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { TypedLocale } from 'payload'

const UserPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const userObject = await getMeUser({ invalidateCache: true })

  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig

  const defaultAvatar = globalConfig.settings?.fixedPages?.myProfile?.avatar as Media

  if (!userObject || !userObject.user) notFound()

  const user = userObject.user
  const initials = user.name.charAt(0) + user.surname.charAt(0)
  const profilePictureUrl = `${getClientSideURL()}/${
    typeof user.profilePicture === 'object' ? user.profilePicture?.url : defaultAvatar.thumbnailURL
  }`

  return (
    <section className="pt-[104px] pb-24 container mx-auto max-w-5xl">
      {/* User Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        <UserAvatar
          className="w-full lg:w-1/3 mt-2"
          fallbackText={initials}
          avatarUrl={profilePictureUrl}
        />
        <div className="flex w-full lg:w-2/3">
          <UserDetails user={user} />
        </div>
      </div>
      {/* Table and calendar */}
      <div className="flex flex-col md:flex-row mt-6 gap-8">
        <div className="w-full lg:w-1/3">
          <UserProfile user={user} />
        </div>
        <div className="w-full lg:w-2/3">
          <UserFutureEvents userId={user.id} />
        </div>
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
