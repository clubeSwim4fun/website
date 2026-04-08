'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { revalidatePath } from 'next/cache'

export async function updateNotificationPreferences({
  emailNotificationsEnabled,
}: {
  emailNotificationsEnabled: boolean
}): Promise<{ success: boolean; message: string }> {
  const { user } = await getMeUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const payload = await getPayload({ config })

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { emailNotificationsEnabled },
  })

  revalidatePath('/[locale]/my-profile', 'page')

  return { success: true, message: 'Preferences updated' }
}
