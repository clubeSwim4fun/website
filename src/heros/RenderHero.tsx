import React from 'react'
import type { Page, User } from '@/payload-types'
import { HighImpactHero } from '@/heros/HighImpact'

export const RenderHero: React.FC<Page['hero'] & { user?: User }> = (props) => {
  if (!props?.type || props.type === 'none') return null
  return <HighImpactHero {...props} />
}
