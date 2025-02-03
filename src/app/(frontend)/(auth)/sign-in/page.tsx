import LoginForm from './LoginForm'

const SignInPage = () => {
  return (
    <section className=" w-full h-screen container flex justify-center items-center">
      <div className="w-full md:w-3/6 border border-gray-300 rounded-xl shadow-lg p-6">
        <LoginForm />
      </div>
    </section>
  )
}

export default SignInPage
