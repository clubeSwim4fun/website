import type { Endpoint } from 'payload'

function getCurrentMonthBounds() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { monthStart: start, monthEnd: end }
}

function getPast6Months() {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d)
  }
  return months
}

export const dashboardMembers: Endpoint = {
  path: '/dashboard/members',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const { monthStart, monthEnd } = getCurrentMonthBounds()

    // 1. newMembersThisMonth — users created in current calendar month
    const newMembersResult = await req.payload.find({
      collection: 'users',
      where: {
        createdAt: {
          greater_than_equal: monthStart.toISOString(),
          less_than_equal: monthEnd.toISOString(),
        },
      },
      limit: 0,
    })
    const newMembersThisMonth = newMembersResult.totalDocs

    // 2. feesCollected — sum amount from paid memberFee subscriptions in current month
    const paidFeesResult = await req.payload.find({
      collection: 'subscription',
      where: {
        paymentStatus: { equals: 'paid' },
        type: { equals: 'memberFee' },
        startDate: {
          greater_than_equal: monthStart.toISOString(),
          less_than_equal: monthEnd.toISOString(),
        },
      },
      limit: 0,
    })
    const feesCollected = (paidFeesResult.docs as any[]).reduce(
      (sum, sub) => sum + (sub.amount ?? 0),
      0,
    )

    // 3. pendingPayment — users with status === 'pendingPayment'
    const pendingPaymentResult = await req.payload.find({
      collection: 'users',
      where: { status: { equals: 'pendingPayment' } },
      limit: 0,
    })
    const pendingPayment = pendingPaymentResult.totalDocs

    // 4. activeAccounts — users with status === 'active'
    const activeAccountsResult = await req.payload.find({
      collection: 'users',
      where: { status: { equals: 'active' } },
      limit: 0,
    })
    const activeAccounts = activeAccountsResult.totalDocs

    // 5. monthlySignups — past 6 calendar months, count users created each month
    const past6Months = getPast6Months()
    const monthlySignups = await Promise.all(
      past6Months.map(async (monthStart) => {
        const monthEnd = new Date(
          monthStart.getFullYear(),
          monthStart.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        )
        const result = await req.payload.find({
          collection: 'users',
          where: {
            createdAt: {
              greater_than_equal: monthStart.toISOString(),
              less_than_equal: monthEnd.toISOString(),
            },
          },
          limit: 0,
        })
        return {
          month: monthStart.toLocaleString('en', { month: 'short' }),
          count: result.totalDocs,
        }
      }),
    )

    // 6. paymentBreakdown — subscription documents grouped by paymentStatus
    const allSubscriptionsResult = await req.payload.find({
      collection: 'subscription',
      limit: 0,
    })
    const allSubscriptions = allSubscriptionsResult.docs as any[]

    const statusLabelMap: Record<string, string> = {
      paid: 'Paid',
      pending: 'Pending',
      failed: 'Failed',
    }
    const breakdownMap: Record<string, number> = {}
    for (const sub of allSubscriptions) {
      const status = sub.paymentStatus as string
      breakdownMap[status] = (breakdownMap[status] ?? 0) + 1
    }
    const paymentBreakdown = Object.entries(breakdownMap).map(([status, count]) => ({
      label: statusLabelMap[status] ?? status,
      count,
    }))

    // 7. recentMembers — 10 most recently created users, raw fields only
    const recentMembersResult = await req.payload.find({
      collection: 'users',
      sort: '-createdAt',
      limit: 10,
    })
    const recentMembers = (recentMembersResult.docs as any[]).map((user) => ({
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
    }))

    return Response.json({
      newMembersThisMonth,
      feesCollected,
      pendingPayment,
      activeAccounts,
      monthlySignups,
      paymentBreakdown,
      recentMembers,
    })
  },
}
