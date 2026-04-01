'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { PoolCycle, PoolSubscription, Subscription } from '@/payload-types'

export type SubscriptionRow =
  | {
      kind: 'memberFee'
      id: string
      startDate: string
      endDate: string
      amount: number
      paymentStatus: 'paid' | 'pending' | 'failed'
      /** True for the most recent pending memberFee — should link to /subscription */
      linkToSubscription?: boolean
    }
  | {
      kind: 'pool'
      id: string
      month: number
      year: number
      amount: number
      status: 'active' | 'waitlisted' | 'cancelled'
      paymentStatus: 'paid' | 'pending' | 'failed'
      /** True for the most recent active pool sub whose cycle month hasn't passed */
      linkToMyPool?: boolean
    }

export type SubscriptionTypeFilter = 'all' | 'memberFee' | 'pool'
export type SubscriptionSortOrder = 'asc' | 'desc'

export async function getUserSubscriptions({
  userId,
  typeFilter = 'all',
  sortOrder = 'desc',
}: {
  userId: string
  typeFilter?: SubscriptionTypeFilter
  sortOrder?: SubscriptionSortOrder
}): Promise<SubscriptionRow[]> {
  const payload = await getPayload({ config })
  const memberFeeRows: Extract<SubscriptionRow, { kind: 'memberFee' }>[] = []
  const poolRows: Extract<SubscriptionRow, { kind: 'pool' }>[] = []

  if (typeFilter === 'all' || typeFilter === 'memberFee') {
    const result = await payload.find({
      collection: 'subscription',
      where: { user: { equals: userId } },
      limit: 100,
      sort: '-startDate',
    })

    for (const sub of result.docs as Subscription[]) {
      memberFeeRows.push({
        kind: 'memberFee',
        id: sub.id,
        startDate: sub.startDate,
        endDate: sub.endDate,
        amount: sub.amount,
        paymentStatus: sub.paymentStatus as 'paid' | 'pending' | 'failed',
      })
    }

    // Mark the most recent pending memberFee for linking
    const mostRecentPending = memberFeeRows.find((r) => r.paymentStatus === 'pending')
    if (mostRecentPending) mostRecentPending.linkToSubscription = true
  }

  if (typeFilter === 'all' || typeFilter === 'pool') {
    const result = await payload.find({
      collection: 'pool-subscriptions',
      where: { athlete: { equals: userId } },
      depth: 1,
      limit: 100,
      sort: '-createdAt',
    })

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-based

    for (const sub of result.docs as PoolSubscription[]) {
      const cycle = sub.cycle as PoolCycle
      if (!cycle || typeof cycle === 'string') continue
      poolRows.push({
        kind: 'pool',
        id: sub.id,
        month: cycle.month,
        year: cycle.year,
        amount: cycle.price,
        status: sub.status,
        paymentStatus: sub.paymentStatus,
      })
    }

    // Mark the most recent active pool sub whose cycle hasn't passed yet
    const activeCurrentPool = poolRows.find(
      (r) =>
        r.status === 'active' &&
        (r.year > currentYear || (r.year === currentYear && r.month >= currentMonth)),
    )
    if (activeCurrentPool) activeCurrentPool.linkToMyPool = true
  }

  const rows: SubscriptionRow[] = [...memberFeeRows, ...poolRows]

  // Sort combined results
  rows.sort((a, b) => {
    const aDate =
      a.kind === 'memberFee'
        ? new Date(a.startDate).getTime()
        : new Date(a.year, a.month - 1).getTime()
    const bDate =
      b.kind === 'memberFee'
        ? new Date(b.startDate).getTime()
        : new Date(b.year, b.month - 1).getTime()
    return sortOrder === 'asc' ? aDate - bDate : bDate - aDate
  })

  return rows
}
