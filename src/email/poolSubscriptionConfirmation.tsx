import React from 'react'
import { TemplateEmail } from './template'
import { PoolSubscription, PoolCycle } from '@/payload-types'

type Args = {
  subscription: PoolSubscription
}

export default function PoolSubscriptionConfirmationEmail({ subscription }: Args) {
  const cycle = subscription.cycle as PoolCycle

  return (
    <TemplateEmail title="Pool Subscription Confirmed">
      <p>Your pool subscription has been confirmed.</p>
      {cycle && (
        <p>
          Cycle: {cycle.month}/{cycle.year}
        </p>
      )}
    </TemplateEmail>
  )
}
