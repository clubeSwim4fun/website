import { getPayload } from 'payload'
import config from '@payload-config'

type RawStat = {
  id?: string | null
  statsMode?: string | null
  value?: string | null
  label?: string | null
  group?: { id: string } | string | null
}

export type ResolvedStat = { value: string; label: string; id?: string | null }

/**
 * Resolves stats array — replaces automatic stats with live user counts per group.
 * Falls back to manual value when statsMode is 'manual' or unset.
 */
export async function resolveStats(stats: RawStat[]): Promise<ResolvedStat[]> {
  const hasAuto = stats.some((s) => s.statsMode === 'automatic')
  const payload = hasAuto ? await getPayload({ config }) : null

  return Promise.all(
    stats.map(async (stat) => {
      if (stat.statsMode === 'automatic' && stat.group && payload) {
        const groupId = typeof stat.group === 'object' ? stat.group.id : stat.group
        const result = await payload.find({
          collection: 'users',
          where: { 'groups.value': { in: [groupId] } },
          limit: 0,
          depth: 0,
        })
        return { value: String(result.totalDocs), label: stat.label ?? '', id: stat.id }
      }
      return { value: stat.value ?? '', label: stat.label ?? '', id: stat.id }
    }),
  )
}
