import type { Endpoint } from 'payload'

function getTitle(title: any): string {
  if (typeof title === 'string') return title
  if (title && typeof title === 'object')
    return title.en || title.pt || Object.values(title)[0] || ''
  return ''
}

function getPast6ISOWeeks() {
  const weeks = []
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const currentMonday = new Date(now)
  currentMonday.setDate(now.getDate() + diff)
  currentMonday.setHours(0, 0, 0, 0)
  for (let i = 5; i >= 0; i--) {
    const monday = new Date(currentMonday)
    monday.setDate(currentMonday.getDate() - i * 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    weeks.push({ start: monday, end: sunday })
  }
  return weeks
}

/** GET /api/dashboard/events/event/:eventId
 *  Returns enrolled attendees (from paid orders) for a specific event.
 */
export const dashboardEventDetail: Endpoint = {
  path: '/dashboard/events/event/:eventId',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const eventId = (req.routeParams as any)?.eventId as string
    if (!eventId) return Response.json({ attendees: [] })

    const ordersResult = await req.payload.find({
      collection: 'orders',
      where: { paymentStatus: { equals: 'paid' } },
      depth: 2,
      limit: 0,
    })

    const attendees: {
      orderId: string
      name: string
      email: string
      tickets: { name: string; tshirtSize?: string }[]
      orderedAt: string
    }[] = []

    for (const order of ordersResult.docs as any[]) {
      if (!Array.isArray(order.events)) continue
      for (const eventEntry of order.events) {
        const eId = typeof eventEntry.event === 'object' ? eventEntry.event?.id : eventEntry.event
        if (eId !== eventId) continue

        const user = order.user
        const name =
          typeof user === 'object'
            ? [user.name, user.surname].filter(Boolean).join(' ')
            : String(user)
        const email = typeof user === 'object' ? (user.email ?? '') : ''

        const tickets = (eventEntry.tickets ?? []).map((t: any) => {
          const ticket = typeof t.ticket === 'object' ? t.ticket : null
          return {
            name: ticket ? getTitle(ticket.name) : '—',
            tshirtSize: t.tshirtSize ?? undefined,
          }
        })

        attendees.push({ orderId: order.id, name, email, tickets, orderedAt: order.createdAt })
      }
    }

    return Response.json({ attendees })
  },
}

/** GET /api/dashboard/events/week/:weekIndex
 *  Returns paid orders created in a given week (0 = oldest of last 6, 5 = current).
 */
export const dashboardEventsWeek: Endpoint = {
  path: '/dashboard/events/week/:weekIndex',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const idx = parseInt((req.routeParams as any)?.weekIndex ?? '5', 10)
    const weeks = getPast6ISOWeeks()
    const week = weeks[idx]
    if (!week) return Response.json({ orders: [], label: '' })

    const label = week.start.toLocaleString('en', { month: 'short' }) + ' ' + week.start.getDate()

    const result = await req.payload.find({
      collection: 'orders',
      where: {
        and: [
          { paymentStatus: { equals: 'paid' } },
          { createdAt: { greater_than_equal: week.start.toISOString() } },
          { createdAt: { less_than_equal: week.end.toISOString() } },
        ],
      },
      depth: 1,
      sort: '-createdAt',
      limit: 200,
    })

    const orders = (result.docs as any[]).map((order) => {
      const user = order.user
      const name =
        typeof user === 'object'
          ? [user.name, user.surname].filter(Boolean).join(' ')
          : String(user)
      const email = typeof user === 'object' ? (user.email ?? '') : ''
      const eventTitles = (order.events ?? []).map((e: any) => {
        const ev = typeof e.event === 'object' ? e.event : null
        return ev ? getTitle(ev.title) : '—'
      })
      return {
        id: order.id,
        name,
        email,
        eventTitles,
        total: order.total,
        orderedAt: order.createdAt,
      }
    })

    return Response.json({ label, orders })
  },
}
