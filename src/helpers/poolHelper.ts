import { getPayload } from 'payload'
import config from '@payload-config'
import { PoolCycle, PoolSubscription, User } from '@/payload-types'
import { sendEmail } from '@/helpers/emailHelper'
import { render } from '@react-email/components'
import React from 'react'

export type PoolPageState =
  | { variant: 'subscribe'; remainingSpots: number }
  | { variant: 'waitlist'; remainingWaitlistSpots: number }
  | { variant: 'full' }
  | { variant: 'closed' }
  | { variant: 'already-active'; subscription: PoolSubscription }
  | { variant: 'already-waitlisted'; subscription: PoolSubscription; position: number }

export async function getOpenCycle(): Promise<PoolCycle | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pool-cycles',
    where: {
      status: { equals: 'open' },
    },
    limit: 1,
  })

  return (result.docs[0] as PoolCycle) ?? null
}

export async function getActiveCount(cycleId: string): Promise<number> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pool-subscriptions',
    where: {
      and: [{ cycle: { equals: cycleId } }, { status: { equals: 'active' } }],
    },
    limit: 0,
  })

  return result.totalDocs
}

export async function getWaitlistCount(cycleId: string): Promise<number> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pool-subscriptions',
    where: {
      and: [{ cycle: { equals: cycleId } }, { status: { equals: 'waitlisted' } }],
    },
    limit: 0,
  })

  return result.totalDocs
}

export async function getAthleteSubscription(
  cycleId: string,
  userId: string,
): Promise<PoolSubscription | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pool-subscriptions',
    where: {
      and: [{ cycle: { equals: cycleId } }, { athlete: { equals: userId } }],
    },
    limit: 1,
  })

  return (result.docs[0] as PoolSubscription) ?? null
}

export function computePoolPageState(
  cycle: PoolCycle | null,
  activeCount: number,
  waitlistCount: number,
  athleteSub: PoolSubscription | null,
): PoolPageState {
  if (!cycle) {
    return { variant: 'closed' }
  }

  if (athleteSub?.status === 'active') {
    return { variant: 'already-active', subscription: athleteSub }
  }

  if (athleteSub?.status === 'waitlisted') {
    return {
      variant: 'already-waitlisted',
      subscription: athleteSub,
      position: athleteSub.waitlistPosition ?? 0,
    }
  }

  if (activeCount < cycle.maxAthletes) {
    return { variant: 'subscribe', remainingSpots: cycle.maxAthletes - activeCount }
  }

  if (waitlistCount < cycle.waitlistLimit) {
    return { variant: 'waitlist', remainingWaitlistSpots: cycle.waitlistLimit - waitlistCount }
  }

  return { variant: 'full' }
}

export async function notifyWaitlist(cycleId: string): Promise<void> {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'pool-subscriptions',
      where: {
        and: [
          { cycle: { equals: cycleId } },
          { status: { equals: 'waitlisted' } },
          { waitlistPosition: { equals: 1 } },
        ],
      },
      depth: 1,
      limit: 1,
    })

    const subscription = result.docs[0] as PoolSubscription | undefined
    if (!subscription) return

    const athlete = subscription.athlete as User
    if (!athlete?.email) return

    const { default: PoolSpotAvailableEmail } = await import('@/email/poolSpotAvailable')
    const emailHtml = await render(React.createElement(PoolSpotAvailableEmail, { subscription }))

    await sendEmail({
      to: athlete.email,
      subject: 'A spot is available in the pool!',
      emailHtml,
    })
  } catch (error) {
    console.error('[notifyWaitlist] Failed to send spot-available email:', error)
  }
}

export async function decrementWaitlistPositions(cycleId: string): Promise<void> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pool-subscriptions',
    where: {
      and: [{ cycle: { equals: cycleId } }, { status: { equals: 'waitlisted' } }],
    },
    limit: 1000,
  })

  for (const sub of result.docs) {
    const current = sub as PoolSubscription
    if (typeof current.waitlistPosition === 'number' && current.waitlistPosition > 0) {
      await payload.update({
        collection: 'pool-subscriptions',
        id: current.id,
        data: {
          waitlistPosition: current.waitlistPosition - 1,
        },
      })
    }
  }
}
