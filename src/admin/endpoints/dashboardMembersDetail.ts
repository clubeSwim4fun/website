import type { Endpoint } from 'payload'

function getPast6Months() {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d)
  }
  return months
}

/** GET /api/dashboard/members/month/:monthIndex
 *  Returns members who signed up in a given month (0 = oldest of last 6, 5 = current).
 */
export const dashboardMembersMonth: Endpoint = {
  path: '/dashboard/members/month/:monthIndex',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const idx = parseInt((req.routeParams as any)?.monthIndex ?? '5', 10)
    const months = getPast6Months()
    const monthStart = months[idx]
    if (!monthStart) return Response.json({ members: [], label: '' })

    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    )
    const label = monthStart.toLocaleString('en', { month: 'long', year: 'numeric' })

    const result = await req.payload.find({
      collection: 'users',
      where: {
        createdAt: {
          greater_than_equal: monthStart.toISOString(),
          less_than_equal: monthEnd.toISOString(),
        },
      },
      sort: '-createdAt',
      limit: 200,
    })

    const members = (result.docs as any[]).map((u) => ({
      id: u.id,
      name: [u.name, u.surname].filter(Boolean).join(' '),
      email: u.email,
      status: u.status,
      createdAt: u.createdAt,
    }))

    return Response.json({ label, members })
  },
}

/** GET /api/dashboard/members/status/:status
 *  Returns members with a given status (e.g. pendingPayment, active, expired).
 */
export const dashboardMembersStatus: Endpoint = {
  path: '/dashboard/members/status/:status',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const status = (req.routeParams as any)?.status as string
    if (!status) return Response.json({ members: [] })

    const result = await req.payload.find({
      collection: 'users',
      where: { status: { equals: status } },
      sort: '-createdAt',
      limit: 200,
    })

    const members = (result.docs as any[]).map((u) => ({
      id: u.id,
      name: [u.name, u.surname].filter(Boolean).join(' '),
      email: u.email,
      status: u.status,
      createdAt: u.createdAt,
    }))

    return Response.json({ members })
  },
}
