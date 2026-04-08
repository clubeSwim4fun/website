import type { Payload, Where } from 'payload'

export type ResolvedRecipient = { userId: string; email: string }

type RecipientFilter = {
  userIds?: (string | { relationTo: string; value: string })[]
  statuses?: string[]
  roles?: string[]
  groups?: (string | { relationTo: string; value: string })[]
}

function extractId(
  entry: string | { relationTo: string; value: string | { id: string } } | { id: string },
): string {
  if (typeof entry === 'string') return entry
  if ('value' in entry) {
    const v = entry.value
    return typeof v === 'string' ? v : v.id
  }
  if ('id' in entry) return entry.id
  return ''
}

export async function resolveRecipients(
  filter: RecipientFilter,
  payload: Payload,
): Promise<ResolvedRecipient[]> {
  const orConditions: Where[] = []

  const userIds = (filter.userIds ?? []).map(extractId).filter(Boolean)
  if (userIds.length > 0) {
    orConditions.push({ id: { in: userIds } })
  }

  if (filter.statuses && filter.statuses.length > 0) {
    orConditions.push({ status: { in: filter.statuses } })
  }

  if (filter.roles && filter.roles.length > 0) {
    orConditions.push({ role: { in: filter.roles } })
  }

  const groupIds = (filter.groups ?? []).map(extractId).filter(Boolean)
  if (groupIds.length > 0) {
    orConditions.push({ 'groups.value': { in: groupIds } })
  }

  if (orConditions.length === 0) return []

  const where: Where = { or: orConditions }

  let allDocs: { id: string; email: string }[] = []
  let page = 1
  const limit = 500

  while (true) {
    const result = await payload.find({
      collection: 'users',
      where,
      limit,
      page,
      depth: 0,
    })

    allDocs = allDocs.concat(
      result.docs.map((d) => ({ id: String(d.id), email: d.email as string })),
    )

    if (!result.hasNextPage) break
    page++
  }

  // Deduplicate by user ID
  const seen = new Map<string, string>()
  for (const doc of allDocs) {
    if (!seen.has(doc.id)) {
      seen.set(doc.id, doc.email)
    }
  }

  // Apply consent gate — exclude users who have explicitly opted out (false)
  // null/undefined means never set → treat as opted in
  const deduplicatedIds = Array.from(seen.keys())
  if (deduplicatedIds.length === 0) return []

  const consentWhere: Where = {
    and: [
      { id: { in: deduplicatedIds } } as Where,
      {
        or: [
          { emailNotificationsEnabled: { equals: true } },
          { emailNotificationsEnabled: { exists: false } },
        ],
      } as Where,
    ],
  }

  const recipients: ResolvedRecipient[] = []
  let consentPage = 1

  while (true) {
    const result = await payload.find({
      collection: 'users',
      where: consentWhere,
      limit,
      page: consentPage,
      depth: 0,
    })

    for (const d of result.docs) {
      recipients.push({ userId: String(d.id), email: d.email as string })
    }

    if (!result.hasNextPage) break
    consentPage++
  }

  return recipients
}
