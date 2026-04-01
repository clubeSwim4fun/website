import React from 'react'
import { TemplateEmail } from './template'
import { PoolSubscription, PoolCycle } from '@/payload-types'

type Args = {
  subscription: PoolSubscription
}

export default function PoolSpotAvailableEmail({ subscription }: Args) {
  const cycle = subscription.cycle as PoolCycle
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL

  return (
    <TemplateEmail title="A spot is available in the pool!">
      <p>
        Good news! A spot has opened up in the pool for {cycle.month}/{cycle.year}.
      </p>
      <p>This is first-come, first-served — claim your spot now before it&apos;s taken.</p>
      <p>
        <a href={`${baseUrl}/pool/subscribe`}>Claim your spot</a>
      </p>
    </TemplateEmail>
  )
}
