'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import { getMeUser } from '@/utilities/getMeUser'
import { getTranslations } from 'next-intl/server'

export type GroupResetResult = {
  success: boolean
  message: string
  updatedCount?: number
}

export async function performGroupReset(groupId: string): Promise<GroupResetResult> {
  const t = await getTranslations()
  const { user } = await getMeUser()

  if (!user || user.role !== 'admin') {
    return { success: false, message: t('Common.notAuthorized') }
  }

  const payload = await getPayload({ config })

  // Polymorphic relationship fields can't be filtered with `contains` in Payload queries,
  // so fetch all users and filter in JS.
  const result = await payload.find({
    collection: 'users',
    limit: 0,
    pagination: false,
  })

  const affectedUsers = result.docs.filter((u) => {
    const groups: any[] = (u.groups as any[]) ?? []
    return groups.some((g: any) => {
      const id = typeof g.value === 'string' ? g.value : (g.value?.id ?? g.value)
      return id === groupId
    })
  })
  const updatedCount = affectedUsers.length

  if (updatedCount === 0) {
    return { success: true, message: 'No users found with this group.', updatedCount: 0 }
  }

  const transactionID = await payload.db.beginTransaction()

  if (!transactionID) {
    return { success: false, message: t('Common.transactionError') }
  }

  try {
    for (const affectedUser of affectedUsers) {
      const currentGroups = (affectedUser.groups ?? []) as {
        relationTo: string
        value: string | { id: string }
      }[]
      const updatedGroups = currentGroups.filter((g) => {
        const id = typeof g.value === 'string' ? g.value : g.value?.id
        return id !== groupId
      })

      await payload.update({
        collection: 'users',
        id: affectedUser.id,
        req: { transactionID } as any,
        data: { groups: updatedGroups as any },
      })
    }

    await payload.db.commitTransaction(transactionID)
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    payload.logger.error(`Group reset DB error: ${JSON.stringify(error)}`)
    return { success: false, message: t('Common.unexpectedError') }
  }

  return { success: true, message: 'Group reset completed.', updatedCount }
}
