import type { Endpoint } from 'payload'

function getISOWeekBounds() {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day // days to Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { weekStart: monday, weekEnd: sunday }
}

function slotDayLabel(dateTime: string): string {
  return new Date(dateTime).toLocaleDateString('pt-PT', {
    weekday: 'long',
    timeZone: 'Europe/Lisbon',
  })
}

function slotTimeRange(dateTime: string, duration: number): string {
  const tz = 'Europe/Lisbon'
  const fmt = (iso: string) => {
    const parts = new Intl.DateTimeFormat('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz,
      hour12: false,
    }).formatToParts(new Date(iso))
    const h = parts.find((p) => p.type === 'hour')?.value ?? '0'
    const m = parts.find((p) => p.type === 'minute')?.value ?? '00'
    return `${parseInt(h)}h${m === '00' ? '' : m}`
  }
  const endIso = new Date(new Date(dateTime).getTime() + duration * 60 * 1000).toISOString()
  return `${fmt(dateTime)}-${fmt(endIso)}`
}

const emptyResponse = {
  subscribedAthletes: 0,
  confirmedSlotsThisWeek: 0,
  waitlistTotal: 0,
  fullSlotsCount: 0,
  weeklyRegistrations: [],
  slotFillRate: [],
  slotTable: [],
  waitlist: [],
}

export const dashboardPool: Endpoint = {
  path: '/dashboard/pool',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    // 1. Find open pool cycle
    const cyclesResult = await req.payload.find({
      collection: 'pool-cycles',
      where: { status: { equals: 'open' } },
      limit: 1,
    })

    if (cyclesResult.totalDocs === 0) {
      return Response.json(emptyResponse)
    }

    const cycle = cyclesResult.docs[0] as any
    const cycleId = cycle.id

    // 2. subscribedAthletes — active pool-subscriptions for this cycle
    const activeSubs = await req.payload.find({
      collection: 'pool-subscriptions',
      where: { cycle: { equals: cycleId }, status: { equals: 'active' } },
      limit: 0,
    })
    const subscribedAthletes = activeSubs.totalDocs

    // 3. waitlistTotal — waitlisted pool-subscriptions for this cycle
    const waitlistedSubs = await req.payload.find({
      collection: 'pool-subscriptions',
      where: { cycle: { equals: cycleId }, status: { equals: 'waitlisted' } },
      limit: 0,
    })
    const waitlistTotal = waitlistedSubs.totalDocs

    // 4. confirmedSlotsThisWeek — registrations within current ISO week
    const { weekStart, weekEnd } = getISOWeekBounds()
    const thisWeekRegs = await req.payload.find({
      collection: 'pool-slot-registrations',
      where: {
        cycle: { equals: cycleId },
        createdAt: {
          greater_than_equal: weekStart.toISOString(),
          less_than_equal: weekEnd.toISOString(),
        },
      },
      limit: 0,
    })
    const confirmedSlotsThisWeek = thisWeekRegs.totalDocs

    // Collect all slots across all weeks
    const weeks: any[] = Array.isArray(cycle.weeks) ? cycle.weeks : []
    const allSlots: {
      slotId: string
      dateTime: string
      duration: number
      day: string
      time: string
      maxAttendance: number
      weekIndex: number
    }[] = []
    weeks.forEach((week: any, weekIndex: number) => {
      const slots: any[] = Array.isArray(week.slots) ? week.slots : []
      slots.forEach((slot: any) => {
        allSlots.push({
          slotId: slot.slotId,
          dateTime: slot.dateTime,
          duration: slot.duration ?? 60,
          day: slotDayLabel(slot.dateTime),
          time: slotTimeRange(slot.dateTime, slot.duration ?? 60),
          maxAttendance: slot.maxAttendance,
          weekIndex,
        })
      })
    })

    // Fetch all registrations for this cycle at once
    const allRegs = await req.payload.find({
      collection: 'pool-slot-registrations',
      where: { cycle: { equals: cycleId } },
      limit: 0,
    })
    const allRegDocs = allRegs.docs as any[]

    // Fetch all slot-waitlist entries for this cycle at once
    const allSlotWaitlist = await req.payload.find({
      collection: 'pool-slot-waitlist',
      where: { cycle: { equals: cycleId } },
      limit: 0,
    })
    const allSlotWaitlistDocs = allSlotWaitlist.docs as any[]

    // Build lookup maps: slotId -> count
    const regCountBySlot: Record<string, number> = {}
    for (const reg of allRegDocs) {
      const sid = reg.slotId
      regCountBySlot[sid] = (regCountBySlot[sid] ?? 0) + 1
    }

    const waitlistCountBySlot: Record<string, number> = {}
    for (const entry of allSlotWaitlistDocs) {
      const sid = entry.slotId
      waitlistCountBySlot[sid] = (waitlistCountBySlot[sid] ?? 0) + 1
    }

    // 5. fullSlotsCount — slots where registrations === maxAttendance
    let fullSlotsCount = 0
    for (const slot of allSlots) {
      const registered = regCountBySlot[slot.slotId] ?? 0
      if (registered >= slot.maxAttendance) fullSlotsCount++
    }

    // 6. weeklyRegistrations — one entry per week in cycle
    const weeklyRegistrations = weeks.map((week: any, i: number) => {
      const start = new Date(week.startDate)
      const end = new Date(week.endDate)
      // Set end to end of day
      end.setHours(23, 59, 59, 999)
      const count = allRegDocs.filter((reg: any) => {
        const created = new Date(reg.createdAt)
        return created >= start && created <= end
      }).length
      return {
        week: `Week ${i + 1}`,
        count,
      }
    })

    // 7. slotFillRate — group by day, compute fill rate
    const dayMap: Record<string, { totalRegistered: number; totalCapacity: number }> = {}
    for (const slot of allSlots) {
      if (!dayMap[slot.day]) {
        dayMap[slot.day] = { totalRegistered: 0, totalCapacity: 0 }
      }
      const entry = dayMap[slot.day]!
      entry.totalRegistered += regCountBySlot[slot.slotId] ?? 0
      entry.totalCapacity += slot.maxAttendance
    }
    const slotFillRate = Object.entries(dayMap).map(
      ([day, { totalRegistered, totalCapacity }]) => ({
        day,
        rate: totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0,
      }),
    )

    // 8. slotTable — only slots belonging to the current ISO week
    const now = new Date()
    const currentWeekIndex = weeks.findIndex((week: any) => {
      const start = new Date(week.startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(week.endDate)
      end.setHours(23, 59, 59, 999)
      return now >= start && now <= end
    })
    const targetWeekIndex = currentWeekIndex >= 0 ? currentWeekIndex : 0
    const currentWeekSlots = allSlots.filter((s) => s.weekIndex === targetWeekIndex)

    const slotTable = currentWeekSlots.map((slot) => ({
      slotId: slot.slotId,
      day: slot.day,
      time: slot.time,
      registered: regCountBySlot[slot.slotId] ?? 0,
      capacity: slot.maxAttendance,
      waitlisted: waitlistCountBySlot[slot.slotId] ?? 0,
    }))

    // 9. waitlist — waitlisted subscriptions with athlete name, 1-based position
    const waitlistSubsResult = await req.payload.find({
      collection: 'pool-subscriptions',
      where: { cycle: { equals: cycleId }, status: { equals: 'waitlisted' } },
      sort: 'createdAt',
      depth: 1,
      limit: 0,
    })
    const waitlist = (waitlistSubsResult.docs as any[]).map((sub: any, index: number) => {
      const athlete = sub.athlete
      let athleteName = ''
      if (athlete && typeof athlete === 'object') {
        athleteName = [athlete.name, athlete.surname].filter(Boolean).join(' ')
      }
      return {
        athleteName,
        waitlistPosition: index + 1,
        createdAt: sub.createdAt,
      }
    })

    return Response.json({
      subscribedAthletes,
      confirmedSlotsThisWeek,
      waitlistTotal,
      fullSlotsCount,
      weeklyRegistrations,
      slotFillRate,
      slotTable,
      waitlist,
    })
  },
}
