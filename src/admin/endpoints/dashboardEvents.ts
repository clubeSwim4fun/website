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

function formatWeekLabel(monday: Date): string {
  return monday.toLocaleString('en', { month: 'short' }) + ' ' + monday.getDate()
}

export const dashboardEvents: Endpoint = {
  path: '/dashboard/events',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const now = new Date()
    const in30Days = new Date(now)
    in30Days.setDate(now.getDate() + 30)

    // 1. activeEvents — events where end > now
    const activeEventsResult = await req.payload.find({
      collection: 'events',
      where: { end: { greater_than: now.toISOString() } },
      limit: 0,
    })
    const activeEvents = activeEventsResult.totalDocs

    // 2. upcomingIn30Days — events where start >= now AND start <= now + 30 days
    const upcomingResult = await req.payload.find({
      collection: 'events',
      where: {
        and: [
          { start: { greater_than_equal: now.toISOString() } },
          { start: { less_than_equal: in30Days.toISOString() } },
        ],
      },
      limit: 0,
    })
    const upcomingIn30Days = upcomingResult.totalDocs

    // 3. Fetch all paid orders (depth: 1 to populate event relationships)
    const paidOrdersResult = await req.payload.find({
      collection: 'orders',
      where: { paymentStatus: { equals: 'paid' } },
      depth: 1,
      limit: 0,
    })
    const paidOrders = paidOrdersResult.docs as any[]

    // 4. totalEnrolled — sum of all ticket line items across all paid orders
    let totalEnrolled = 0
    for (const order of paidOrders) {
      if (Array.isArray(order.events)) {
        for (const eventEntry of order.events) {
          if (Array.isArray(eventEntry.tickets)) {
            totalEnrolled += eventEntry.tickets.length
          }
        }
      }
    }

    // 5. Fetch all future events (end > now) for the events array
    const futureEventsResult = await req.payload.find({
      collection: 'events',
      where: { end: { greater_than: now.toISOString() } },
      limit: 0,
    })
    const futureEvents = futureEventsResult.docs as any[]

    // Build a map of eventId -> enrolledCount from paid orders
    const enrolledByEvent: Record<string, number> = {}
    for (const order of paidOrders) {
      if (Array.isArray(order.events)) {
        for (const eventEntry of order.events) {
          const eventId =
            typeof eventEntry.event === 'object' && eventEntry.event !== null
              ? eventEntry.event.id
              : eventEntry.event
          if (!eventId) continue
          const ticketCount = Array.isArray(eventEntry.tickets) ? eventEntry.tickets.length : 0
          enrolledByEvent[eventId] = (enrolledByEvent[eventId] ?? 0) + ticketCount
        }
      }
    }

    // Build events array with enrolledCount and ticketCount
    const events = await Promise.all(
      futureEvents.map(async (event) => {
        const eventId = event.id

        // ticketCount — count tickets documents where eventFor === eventId
        const ticketsResult = await req.payload.find({
          collection: 'tickets',
          where: { eventFor: { equals: eventId } },
          limit: 0,
        })
        const ticketCount = ticketsResult.totalDocs
        const enrolledCount = enrolledByEvent[eventId] ?? 0

        return {
          id: eventId,
          title: getTitle(event.title),
          start: event.start,
          end: event.end,
          enrolledCount,
          ticketCount,
        }
      }),
    )

    // 6. enrollmentByEvent — one entry per upcoming event
    const enrollmentByEvent = events.map((e) => ({
      eventTitle: e.title,
      enrolled: e.enrolledCount,
    }))

    // 7. weeklySignups — past 6 ISO weeks, count paid orders created in each week
    const past6Weeks = getPast6ISOWeeks()
    const weeklySignups = await Promise.all(
      past6Weeks.map(async (week) => {
        const result = await req.payload.find({
          collection: 'orders',
          where: {
            and: [
              { paymentStatus: { equals: 'paid' } },
              { createdAt: { greater_than_equal: week.start.toISOString() } },
              { createdAt: { less_than_equal: week.end.toISOString() } },
            ],
          },
          limit: 0,
        })
        return {
          week: formatWeekLabel(week.start),
          count: result.totalDocs,
        }
      }),
    )

    return Response.json({
      activeEvents,
      totalEnrolled,
      upcomingIn30Days,
      totalWaitlisted: 0,
      events,
      enrollmentByEvent,
      weeklySignups,
    })
  },
}
