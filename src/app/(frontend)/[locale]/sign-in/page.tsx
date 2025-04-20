import { getMeUser } from '@/utilities/getMeUser'
import LoginForm from './LoginForm'
import { redirect } from 'next/navigation'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from 'next-intl/server'
import { TypedLocale } from 'payload'
import { GeneralConfig } from '@/payload-types'

const SignInPage = async (props: { searchParams: Promise<{ callbackUrl: string }> }) => {
  const { callbackUrl } = await props.searchParams
  const session = await getMeUser()
  const locale = (await getLocale()) as TypedLocale
  const globalConfig = (await getCachedGlobal('generalConfigs', 1, locale)()) as GeneralConfig

  const login = globalConfig?.settings?.login

  if (session.token) {
    return redirect(callbackUrl || '/')
  }

  return (
    <section className="w-full h-screen container flex justify-center items-center">
      <div className="w-full md:w-3/6 border border-gray-300 rounded-xl shadow-lg p-6">
        <LoginForm loginSettings={login} />
      </div>
    </section>
  )
}

export default SignInPage
