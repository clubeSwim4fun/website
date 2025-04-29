'use server'

import { Group, GroupCategory, Page, User } from '@/payload-types'
import { getTranslations } from 'next-intl/server'

type GroupsVisibleForType =
  | (
      | {
          relationTo: 'groups'
          value: string | Group
        }
      | {
          relationTo: 'group-categories'
          value: string | GroupCategory
        }
    )[]
  | null
  | undefined

type ErrorMessage = {
  code: number
  message: string
}

export type PageVisibilityResponse = {
  success: boolean
  message?: ErrorMessage
}

export const checkPageVisibility = async ({
  user,
  page,
}: {
  user?: User
  page: Page
}): Promise<PageVisibilityResponse> => {
  const t = await getTranslations()
  const pageVisibilityGroups: GroupsVisibleForType = page.visibility?.visibleFor

  // If no groups defined page is public
  if (!pageVisibilityGroups || pageVisibilityGroups?.length === 0) {
    return {
      success: true,
    }
  }

  if (!user) {
    return {
      success: false,
      message: {
        code: 401,
        message: 'user not authenticated',
      },
    }
  }

  const visibilityGroupIds = pageVisibilityGroups.map((group) => group.value)
  const userGroups = user?.groups?.map((group) => group.value)

  const userHasValidyGroup =
    userGroups &&
    userGroups.some((userGroup) => {
      const group = userGroup as Group | GroupCategory
      return visibilityGroupIds.includes(group.id)
    })

  const userStatus = user.status

  if (userHasValidyGroup && userStatus === 'active') {
    return {
      success: true,
    }
  }

  if (userStatus !== 'active') {
    return {
      success: false,
      message: {
        code: 402,
        message:
          userStatus === 'pendingPayment' ? t('User.pendingPayment') : t('User.paymentExpired'),
      },
    }
  }

  return {
    success: false,
    message: {
      code: 403,
      message: t('Common.notAuthorized'),
    },
  }
}
