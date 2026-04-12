import React from 'react'
import type { Page } from '@/payload-types'
import { HighImpactHero } from '@/heros/HighImpact'

export const RenderHero: React.FC<Page['hero']> = (props) => {
  if (!props?.type || props.type === 'none') return null
  return <HighImpactHero {...props} />
}
