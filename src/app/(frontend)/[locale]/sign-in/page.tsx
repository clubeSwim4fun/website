import { getMeUser } from '@/utilities/getMeUser'
import LoginForm from './LoginForm'
import { redirect } from 'next/navigation'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from 'next-intl/server'
import { TypedLocale } from 'payload'
import { GeneralConfig, Header, Media } from '@/payload-types'

const SignInPage = async (props: { searchParams: Promise<{ callbackUrl: string }> }) => {
  const { callbackUrl } = await props.searchParams
  const session = await getMeUser({ invalidateCache: true })
  const locale = (await getLocale()) as TypedLocale
  const globalConfig = (await getCachedGlobal('generalConfigs', 1, locale)()) as GeneralConfig
  const headerData = (await getCachedGlobal('header', 1, locale)()) as Header

  const login = globalConfig?.settings?.login
  const logo = headerData?.logo as Media | null | undefined

  if (session.token && session.user) {
    if (session.user.status !== 'active') {
      return redirect(`/${locale}/subscription`)
    }
    return redirect(callbackUrl || '/')
  }

  return (
    <section className="w-full">
      <LoginForm loginSettings={login} logo={logo} />
    </section>
  )
}

export default SignInPage
