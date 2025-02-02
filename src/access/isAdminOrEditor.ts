import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAdminOrEditor = (args: AccessArgs<User>) => boolean

export const isAdminOrEditor: isAdminOrEditor = ({ req: { user } }) => {
  return Boolean(user && (user.role?.includes('admin') || user.role?.includes('editor')))
}
