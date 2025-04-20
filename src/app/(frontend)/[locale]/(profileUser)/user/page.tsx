import { GeneralConfig } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMeUser } from '@/utilities/getMeUser'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { TypedLocale } from 'payload'

const UserPage = async () => {
  const userObject = await getMeUser()

  if (!userObject) notFound()

  return (
    <section className="pt-[104px] pb-24">
      <div className="container">{userObject.user?.name}</div>
      {/* {userObject.user.identity && (
        <Image src={userObject.user.identityFile} height={400} width={400} alt="test" />
      )} */}

      {userObject?.user?.profilePicture && (
        <Image src={userObject.user.profilePicture as string} height={400} width={400} alt="test" />
      )}
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
