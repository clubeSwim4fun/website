import { getMeUser } from '@/utilities/getMeUser'
import { notFound } from 'next/navigation'

const UserPage = async () => {
  const userObject = await getMeUser()

  if (!userObject) notFound()

  return (
    <section className="pt-[104px] pb-24">
      <div className="container">{userObject.user?.name}</div>
    </section>
  )
}

export default UserPage
