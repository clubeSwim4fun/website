import { getMeUser } from '@/utilities/getMeUser'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const UserPage = async () => {
  const userObject = await getMeUser()
  console.log('user', userObject)

  if (!userObject) notFound()

  return (
    <section className="pt-[104px] pb-24">
      <div className="container">{userObject.user?.name}</div>
      {/* {userObject.user.identity && (
        <Image src={userObject.user.identityFile} height={400} width={400} alt="test" />
      )} */}

      {userObject.user.profilePicture && (
        <Image src={userObject.user.profilePicture as string} height={400} width={400} alt="test" />
      )}
    </section>
  )
}

export default UserPage
