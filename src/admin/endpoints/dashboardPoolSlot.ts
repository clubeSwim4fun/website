import type { Endpoint } from 'payload'

/** GET /api/dashboard/pool/slot/:slotId
 *  Returns enrolled athletes and waitlist for a specific slot in the open cycle.
 */
export const dashboardPoolSlot: Endpoint = {
  path: '/dashboard/pool/slot/:slotId',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const slotId = (req.routeParams as any)?.slotId as string | undefined
    if (!slotId) return Response.json({ error: 'Missing slotId' }, { status: 400 })

    const cyclesResult = await req.payload.find({
      collection: 'pool-cycles',
      where: { status: { equals: 'open' } },
      limit: 1,
    })
    if (cyclesResult.totalDocs === 0) return Response.json({ enrolled: [], waitlist: [] })

    const cycleId = (cyclesResult.docs[0] as any).id

    // Enrolled athletes
    const regsResult = await req.payload.find({
      collection: 'pool-slot-registrations',
      where: { cycle: { equals: cycleId }, slotId: { equals: slotId } },
      depth: 1,
      limit: 200,
      sort: 'createdAt',
    })

    const enrolled = (regsResult.docs as any[]).map((reg) => {
      const a = reg.athlete
      return {
        id: reg.id,
        name: typeof a === 'object' ? [a.name, a.surname].filter(Boolean).join(' ') : String(a),
        email: typeof a === 'object' ? (a.email ?? '') : '',
        registeredAt: reg.createdAt,
      }
    })

    // Slot waitlist
    const waitlistResult = await req.payload.find({
      collection: 'pool-slot-waitlist',
      where: { cycle: { equals: cycleId }, slotId: { equals: slotId } },
      depth: 1,
      limit: 200,
      sort: 'createdAt',
    })

    const waitlist = (waitlistResult.docs as any[]).map((entry, i) => {
      const a = entry.athlete ?? entry.user
      return {
        position: i + 1,
        name: typeof a === 'object' ? [a.name, a.surname].filter(Boolean).join(' ') : String(a),
        email: typeof a === 'object' ? (a.email ?? '') : '',
        joinedAt: entry.createdAt,
      }
    })

    return Response.json({ enrolled, waitlist })
  },
}

/** GET /api/dashboard/pool/week/:weekIndex
 *  Returns athletes who registered during a specific week of the open cycle.
 */
export const dashboardPoolWeek: Endpoint = {
  path: '/dashboard/pool/week/:weekIndex',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const weekIndex = parseInt((req.routeParams as any)?.weekIndex ?? '0', 10)

    const cyclesResult = await req.payload.find({
      collection: 'pool-cycles',
      where: { status: { equals: 'open' } },
      limit: 1,
    })
    if (cyclesResult.totalDocs === 0) return Response.json({ week: null, athletes: [] })

    const cycle = cyclesResult.docs[0] as any
    const weeks: any[] = Array.isArray(cycle.weeks) ? cycle.weeks : []
    const week = weeks[weekIndex]
    if (!week) return Response.json({ week: null, athletes: [] })

    const start = new Date(week.startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(week.endDate)
    end.setHours(23, 59, 59, 999)

    const regsResult = await req.payload.find({
      collection: 'pool-slot-registrations',
      where: {
        cycle: { equals: cycle.id },
        createdAt: {
          greater_than_equal: start.toISOString(),
          less_than_equal: end.toISOString(),
        },
      },
      depth: 1,
      limit: 500,
      sort: 'createdAt',
    })

    const athletes = (regsResult.docs as any[]).map((reg) => {
      const a = reg.athlete
      return {
        id: reg.id,
        name: typeof a === 'object' ? [a.name, a.surname].filter(Boolean).join(' ') : String(a),
        email: typeof a === 'object' ? (a.email ?? '') : '',
        slotDay: reg.slotDay,
        slotTime: reg.slotTime,
        registeredAt: reg.createdAt,
      }
    })

    return Response.json({
      week: { label: `Week ${weekIndex + 1}`, start: start.toISOString(), end: end.toISOString() },
      athletes,
    })
  },
}
