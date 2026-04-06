import type { User } from '@/payload-types'

export type BlockVisibilityType =
  | 'everyone'
  | 'loggedIn'
  | 'notLoggedIn'
  | 'active'
  | 'admin'
  | 'specificGroups'

export interface BlockVisibilityConfig {
  visibilityType?: BlockVisibilityType
  allowedGroups?:
    | (
        | { relationTo: 'groups'; value: string | { id: string } }
        | { relationTo: 'group-categories'; value: string | { id: string } }
      )[]
    | null
}

/**
 * Determines if a block should be visible based on the user's status and the block's visibility setting.
 *
 * @param visibilityConfig - The visibility configuration from the block (can be string for backwards compatibility or BlockVisibilityConfig object)
 * @param user - The current user object (or undefined if not logged in)
 * @returns boolean - true if the block should be shown, false otherwise
 */
export const shouldShowBlock = (
  visibilityConfig: BlockVisibilityType | BlockVisibilityConfig | undefined,
  user: User | undefined,
): boolean => {
  // Handle backwards compatibility with old string-based visibility
  if (typeof visibilityConfig === 'string') {
    return shouldShowBlockLegacy(visibilityConfig, user)
  }

  // Default to showing the block if no visibility setting is specified
  if (!visibilityConfig || visibilityConfig.visibilityType === 'everyone') {
    return true
  }

  const { visibilityType, allowedGroups } = visibilityConfig

  // Not logged in user
  if (!user) {
    return visibilityType === 'notLoggedIn'
  }

  // Logged in user - check specific visibility rules
  switch (visibilityType) {
    case 'loggedIn':
      return true

    case 'notLoggedIn':
      return false

    case 'active':
      return user.status === 'active'

    case 'admin':
      return user.role === 'admin'

    case 'specificGroups': {
      // Check if user belongs to any of the allowed groups or subgroups
      if (!allowedGroups || allowedGroups.length === 0) {
        return false
      }

      if (!user.groups || !Array.isArray(user.groups)) {
        return false
      }

      // Extract IDs from the polymorphic allowedGroups array: { relationTo, value: string | object }
      const allowedIds = allowedGroups.map((entry) => {
        const val = (entry as { relationTo: string; value: string | { id: string } }).value
        return typeof val === 'string' ? val : val.id
      })

      // Extract IDs from the user's polymorphic groups array: { relationTo, value: string | object }
      return user.groups.some((userGroup) => {
        const val = (userGroup as { relationTo: string; value: string | { id: string } }).value
        const userGroupId = typeof val === 'string' ? val : val.id
        return allowedIds.includes(userGroupId)
      })
    }

    default:
      return true
  }
}

/**
 * Legacy function for backwards compatibility with old string-based visibility
 */
function shouldShowBlockLegacy(
  visibilitySetting: BlockVisibilityType | undefined,
  user: User | undefined,
): boolean {
  // Default to showing the block if no visibility setting is specified
  if (!visibilitySetting || visibilitySetting === 'everyone') {
    return true
  }

  // Not logged in user
  if (!user) {
    return visibilitySetting === 'notLoggedIn'
  }

  // Logged in user - check specific visibility rules
  switch (visibilitySetting) {
    case 'loggedIn':
      return true

    case 'notLoggedIn':
      return false

    case 'active':
      return user.status === 'active'

    case 'admin':
      return user.role === 'admin'

    default:
      return true
  }
}
