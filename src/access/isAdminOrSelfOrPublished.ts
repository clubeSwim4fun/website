import type { Access, AccessResult } from 'payload'

export const isAdminOrSelfOrPublished: Access = ({ req: { user } }): AccessResult => {
  if (user && user.role?.includes('admin')) {
    return true
  }

  if (user && user.role?.includes('editor')) {
    return {
      authors: {
        in: user?.id,
      },
    }
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
