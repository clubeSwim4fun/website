import { getMeUser } from '@/utilities/getMeUser'
import LoginForm from './LoginForm'
import { redirect } from 'next/navigation'

const SignInPage = async (props: { searchParams: Promise<{ callbackUrl: string }> }) => {
  const { callbackUrl } = await props.searchParams
  const session = await getMeUser()

  if (session.token) {
    return redirect(callbackUrl || '/')
  }

  return (
    <section className=" w-full h-screen container flex justify-center items-center">
      <div className="w-full md:w-3/6 border border-gray-300 rounded-xl shadow-lg p-6">
        <LoginForm />
      </div>
    </section>
  )
}

export default SignInPage
