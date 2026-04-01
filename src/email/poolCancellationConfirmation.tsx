import React from 'react'
import { TemplateEmail } from './template'
import { PoolSubscription, PoolCycle } from '@/payload-types'

type Args = {
  subscription: PoolSubscription
}

export default function PoolCancellationConfirmationEmail({ subscription }: Args) {
  const cycle = subscription.cycle as PoolCycle

  return (
    <TemplateEmail title="Pool Subscription Cancelled">
      <p>Your pool subscription has been cancelled.</p>
      {cycle && (
        <p>
          Cycle: {cycle.month}/{cycle.year}
        </p>
      )}
      <p>Please note: no refunds are issued for cancellations.</p>
    </TemplateEmail>
  )
}
