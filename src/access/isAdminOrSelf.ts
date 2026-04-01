import type { Access, AccessResult } from 'payload'

export const isAdminOrSelf: Access = ({ req: { user } }): AccessResult => {
  if (!user) return false

  if (user.role?.includes('admin')) {
    return true
  }

  return {
    athlete: {
      equals: user.id,
    },
  }
}
