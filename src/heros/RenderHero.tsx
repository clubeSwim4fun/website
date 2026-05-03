import React from 'react'
import type { Page, User } from '@/payload-types'
import { HighImpactHero } from '@/heros/HighImpact'
import { resolveStats } from '@/helpers/resolveStats'

export const RenderHero: React.FC<Page['hero'] & { user?: User }> = async (props) => {
  if (!props?.type || props.type === 'none') return null

  const resolvedStats = props.stats?.length ? await resolveStats(props.stats as any) : props.stats

  return <HighImpactHero {...props} stats={resolvedStats as any} />
}
