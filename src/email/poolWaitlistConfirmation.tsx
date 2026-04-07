import React from 'react'
import { TemplateEmail } from './template'
import { PoolSubscription, PoolCycle } from '@/payload-types'

type Args = {
  subscription: PoolSubscription
}

export default function PoolWaitlistConfirmationEmail({ subscription }: Args) {
  const cycle = subscription.cycle as PoolCycle

  return (
    <TemplateEmail title="Pool Waitlist Confirmed">
      <p>You have been added to the pool waitlist.</p>
      {cycle && (
        <p>
          Cycle: {cycle.month} {cycle.year}
        </p>
      )}
      <p>Your waitlist position: #{subscription.waitlistPosition}</p>
    </TemplateEmail>
  )
}
