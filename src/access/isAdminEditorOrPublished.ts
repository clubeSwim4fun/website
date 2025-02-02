import type { Access } from 'payload'

export const isAdminEditorOrPublished: Access = ({ req: { user } }) => {
  if (user && (user.role?.includes('admin') || user.role?.includes('editor'))) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
