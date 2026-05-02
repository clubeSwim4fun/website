'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'

type AssignToGroup =
  | { relationTo: 'groups'; value: string | { id: string; title?: unknown } }
  | { relationTo: 'group-categories'; value: string | { id: string; title?: unknown } }
  | null
  | undefined

function resolveTitle(title: unknown): string | null {
  if (!title) return null
  if (typeof title === 'string') return title
  if (typeof title === 'object') {
    const obj = title as Record<string, string>
    return obj['pt'] ?? obj['en'] ?? Object.values(obj)[0] ?? null
  }
  return null
}

export async function checkUserGroupMembership(
  assignToGroup: AssignToGroup,
): Promise<{ isMember: boolean; groupName: string | null }> {
  if (!assignToGroup) return { isMember: false, groupName: null }

  const { user: sessionUser } = await getMeUser()
  if (!sessionUser) return { isMember: false, groupName: null }

  const payload = await getPayload({ config })

  // Re-fetch from DB so group changes are reflected immediately (JWT can be stale)
  const user = await payload.findByID({ collection: 'users', id: sessionUser.id, depth: 1 })
  if (!user) return { isMember: false, groupName: null }

  const groupId =
    typeof assignToGroup.value === 'string' ? assignToGroup.value : assignToGroup.value?.id

  if (!groupId) return { isMember: false, groupName: null }

  const existingGroups: { relationTo: string; value: string }[] = (
    (user.groups as any[]) ?? []
  ).map((g: any) =>
    typeof g === 'string'
      ? { relationTo: 'groups', value: g }
      : {
          relationTo: g.relationTo ?? 'groups',
          value: typeof g.value === 'string' ? g.value : g.value?.id,
        },
  )

  const isMember = existingGroups.some(
    (g) => g.relationTo === assignToGroup.relationTo && g.value === groupId,
  )

  if (!isMember) return { isMember: false, groupName: null }

  // Fetch the group name for the message
  try {
    const collection = assignToGroup.relationTo === 'groups' ? 'groups' : 'group-categories'
    const doc = await payload.findByID({ collection, id: groupId, depth: 0 })
    const groupName = resolveTitle((doc as any)?.title) ?? null
    return { isMember: true, groupName }
  } catch {
    return { isMember: true, groupName: null }
  }
}
