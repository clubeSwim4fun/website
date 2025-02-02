import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAssociated = (args: AccessArgs<User>) => boolean

export const isAssociated: isAssociated = ({ req: { user } }) => {
  return Boolean(user && user.groups.some((group) => group.value === 'socio'))
}
