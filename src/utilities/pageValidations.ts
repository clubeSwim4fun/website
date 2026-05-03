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

  // Admins and editors bypass page visibility
  if (user.role === 'admin' || user.role === 'editor') {
    return { success: true }
  }

  // Normalize to string IDs regardless of whether values are populated objects or raw strings
  const visibilityGroupIds = pageVisibilityGroups.map((group) => {
    const val = group.value
    return typeof val === 'string' ? val : (val as Group | GroupCategory).id
  })

  const userGroupIds = user?.groups?.map((group) => {
    const val = group.value
    return typeof val === 'string' ? val : (val as Group | GroupCategory).id
  })

  const userHasValidyGroup =
    userGroupIds && userGroupIds.some((id) => visibilityGroupIds.includes(id))

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
