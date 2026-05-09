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
  const pageVisibilityGroups: GroupsVisibleForType = page.visibility?.visibleForConfig?.groups
  const pageHiddenForGroups: GroupsVisibleForType = page.visibility?.hiddenForConfig?.groups

  const hasVisibilityRestriction = pageVisibilityGroups && pageVisibilityGroups.length > 0
  const hasHiddenForRestriction = pageHiddenForGroups && pageHiddenForGroups.length > 0

  // If no restrictions defined, page is public
  if (!hasVisibilityRestriction && !hasHiddenForRestriction) {
    return { success: true }
  }

  if (!user) {
    if (hasVisibilityRestriction) {
      return {
        success: false,
        message: { code: 401, message: 'user not authenticated' },
      }
    }
    // hiddenFor only applies to authenticated users — unauthenticated can see the page
    return { success: true }
  }

  const userGroupIds = user?.groups?.map((group) => {
    const val = group.value
    return typeof val === 'string' ? val : (val as Group | GroupCategory).id
  })

  // Check hiddenFor first — applies to ALL users including admins/editors
  if (hasHiddenForRestriction) {
    const hiddenGroupIds = pageHiddenForGroups!.map((group) => {
      const val = group.value
      return typeof val === 'string' ? val : (val as Group | GroupCategory).id
    })

    const userIsHidden = userGroupIds && userGroupIds.some((id) => hiddenGroupIds.includes(id))

    if (userIsHidden) {
      return {
        success: false,
        message: { code: 404, message: t('Common.notAuthorized') },
      }
    }
  }

  // Admins and editors bypass visibleFor restriction
  if (user.role === 'admin' || user.role === 'editor') {
    return { success: true }
  }

  // If no visibleFor restriction, page is accessible (hiddenFor check already passed)
  if (!hasVisibilityRestriction) {
    return { success: true }
  }

  const visibilityGroupIds = pageVisibilityGroups!.map((group) => {
    const val = group.value
    return typeof val === 'string' ? val : (val as Group | GroupCategory).id
  })

  const userHasValidGroup =
    userGroupIds && userGroupIds.some((id) => visibilityGroupIds.includes(id))

  const userStatus = user.status

  if (userHasValidGroup && userStatus === 'active') {
    return { success: true }
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
    message: { code: 403, message: t('Common.notAuthorized') },
  }
}
