'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { PoolCycle, PoolSubscription, Subscription } from '@/payload-types'
import { getMonthIndex } from '@/collections/Pool/PoolCycles'
import type {
  SubscriptionRow,
  SubscriptionTypeFilter,
  SubscriptionSortOrder,
  SubscriptionsResult,
} from './subscriptionHelperTypes'
import { SUBS_PAGE_SIZE } from './subscriptionHelperTypes'

export async function getUserSubscriptions({
  userId,
  typeFilter = 'all',
  sortOrder = 'desc',
  page = 1,
}: {
  userId: string
  typeFilter?: SubscriptionTypeFilter
  sortOrder?: SubscriptionSortOrder
  page?: number
}): Promise<SubscriptionsResult> {
  const payload = await getPayload({ config })
  const sort = sortOrder === 'desc' ? '-startDate' : 'startDate'

  // ── Single-collection filters: use native Payload pagination ──────────────
  if (typeFilter === 'memberFee') {
    const result = await payload.find({
      collection: 'subscription',
      where: { user: { equals: userId } },
      limit: SUBS_PAGE_SIZE,
      page,
      sort,
    })

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const rows: SubscriptionRow[] = (result.docs as Subscription[]).map((sub) => ({
      kind: 'memberFee' as const,
      id: sub.id,
      startDate: sub.startDate,
      endDate: sub.endDate,
      amount: sub.amount,
      paymentStatus: sub.paymentStatus as 'paid' | 'pending' | 'failed',
      stripePaymentIntentId: sub.stripePaymentIntentId ?? null,
    }))

    // Mark most recent pending for linking (check across this page only)
    const pending = rows.find((r) => r.kind === 'memberFee' && r.paymentStatus === 'pending')
    if (pending && pending.kind === 'memberFee') pending.linkToSubscription = true

    return { rows, totalDocs: result.totalDocs, totalPages: result.totalPages, page }
  }

  if (typeFilter === 'pool') {
    const poolSort = sortOrder === 'desc' ? '-createdAt' : 'createdAt'
    const result = await payload.find({
      collection: 'pool-subscriptions',
      where: { athlete: { equals: userId } },
      depth: 1,
      limit: SUBS_PAGE_SIZE,
      page,
      sort: poolSort,
    })

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const rows: SubscriptionRow[] = []
    for (const sub of result.docs as PoolSubscription[]) {
      const cycle = sub.cycle as PoolCycle
      if (!cycle || typeof cycle === 'string') continue
      rows.push({
        kind: 'pool' as const,
        id: sub.id,
        month: cycle.month,
        year: cycle.year,
        amount: cycle.price,
        status: sub.status,
        paymentStatus: sub.paymentStatus,
        stripePaymentIntentId: sub.stripePaymentIntentId ?? null,
      })
    }

    const activeCurrentPool = rows.find(
      (r) =>
        r.kind === 'pool' &&
        r.status === 'active' &&
        (r.year > currentYear ||
          (r.year === currentYear && getMonthIndex(r.month) >= currentMonth)),
    )
    if (activeCurrentPool && activeCurrentPool.kind === 'pool')
      activeCurrentPool.linkToMyPool = true

    return { rows, totalDocs: result.totalDocs, totalPages: result.totalPages, page }
  }

  // ── "all" filter: fetch both collections, merge, sort, paginate in memory ──
  const [memberResult, poolResult] = await Promise.all([
    payload.find({
      collection: 'subscription',
      where: { user: { equals: userId } },
      limit: 200,
      sort,
    }),
    payload.find({
      collection: 'pool-subscriptions',
      where: { athlete: { equals: userId } },
      depth: 1,
      limit: 200,
      sort: sortOrder === 'desc' ? '-createdAt' : 'createdAt',
    }),
  ])

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const memberFeeRows: Extract<SubscriptionRow, { kind: 'memberFee' }>[] = (
    memberResult.docs as Subscription[]
  ).map((sub) => ({
    kind: 'memberFee' as const,
    id: sub.id,
    startDate: sub.startDate,
    endDate: sub.endDate,
    amount: sub.amount,
    paymentStatus: sub.paymentStatus as 'paid' | 'pending' | 'failed',
    stripePaymentIntentId: sub.stripePaymentIntentId ?? null,
  }))

  const poolRows: Extract<SubscriptionRow, { kind: 'pool' }>[] = []
  for (const sub of poolResult.docs as PoolSubscription[]) {
    const cycle = sub.cycle as PoolCycle
    if (!cycle || typeof cycle === 'string') continue
    poolRows.push({
      kind: 'pool' as const,
      id: sub.id,
      month: cycle.month,
      year: cycle.year,
      amount: cycle.price,
      status: sub.status,
      paymentStatus: sub.paymentStatus,
      stripePaymentIntentId: sub.stripePaymentIntentId ?? null,
    })
  }

  // Mark linking flags before slicing
  const pendingMember = memberFeeRows.find((r) => r.paymentStatus === 'pending')
  if (pendingMember) pendingMember.linkToSubscription = true

  const activePool = poolRows.find(
    (r) =>
      r.status === 'active' &&
      (r.year > currentYear || (r.year === currentYear && getMonthIndex(r.month) >= currentMonth)),
  )
  if (activePool) activePool.linkToMyPool = true

  const all: SubscriptionRow[] = [...memberFeeRows, ...poolRows]

  all.sort((a, b) => {
    const aDate =
      a.kind === 'memberFee'
        ? new Date(a.startDate).getTime()
        : new Date(a.year, getMonthIndex(a.month) - 1).getTime()
    const bDate =
      b.kind === 'memberFee'
        ? new Date(b.startDate).getTime()
        : new Date(b.year, getMonthIndex(b.month) - 1).getTime()
    return sortOrder === 'asc' ? aDate - bDate : bDate - aDate
  })

  const totalDocs = all.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / SUBS_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * SUBS_PAGE_SIZE
  const rows = all.slice(start, start + SUBS_PAGE_SIZE)

  return { rows, totalDocs, totalPages, page: safePage }
}
