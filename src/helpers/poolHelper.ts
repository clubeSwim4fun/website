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

/**
 * Fetches all slot registrations for a cycle once.
 * Returns counts per slotId and the set of slotIds the given athlete has registered for.
 * Also returns slot-level waitlist counts and the athlete's waitlist positions.
 */
export async function getSlotRegistrationData(
  cycleId: string,
  athleteId: string,
): Promise<{
  countsBySlotId: Record<string, number>
  athleteSlotIds: Set<string>
  waitlistCountsBySlotId: Record<string, number>
  athleteWaitlistPositions: Record<string, number> // slotId → position
}> {
  const payload = await getPayload({ config })

  const [regResult, waitlistResult] = await Promise.all([
    payload.find({
      collection: 'pool-slot-registrations',
      where: { cycle: { equals: cycleId } },
      limit: 10000,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: 'pool-slot-waitlist',
      where: { cycle: { equals: cycleId } },
      limit: 10000,
      pagination: false,
      depth: 0,
    }),
  ])

  const countsBySlotId: Record<string, number> = {}
  const athleteSlotIds = new Set<string>()

  for (const reg of regResult.docs as any[]) {
    const slotId: string = reg.slotId
    if (!slotId) continue
    countsBySlotId[slotId] = (countsBySlotId[slotId] ?? 0) + 1
    const regAthleteId = typeof reg.athlete === 'string' ? reg.athlete : reg.athlete?.id
    if (regAthleteId === athleteId) athleteSlotIds.add(slotId)
  }

  const waitlistCountsBySlotId: Record<string, number> = {}
  const athleteWaitlistPositions: Record<string, number> = {}

  for (const entry of waitlistResult.docs as any[]) {
    const slotId: string = entry.slotId
    if (!slotId) continue
    waitlistCountsBySlotId[slotId] = (waitlistCountsBySlotId[slotId] ?? 0) + 1
    const entryAthleteId = typeof entry.athlete === 'string' ? entry.athlete : entry.athlete?.id
    if (entryAthleteId === athleteId) athleteWaitlistPositions[slotId] = entry.position
  }

  return { countsBySlotId, athleteSlotIds, waitlistCountsBySlotId, athleteWaitlistPositions }
}

export type WeekSlot = {
  slotId: string
  day: string
  time: string
  maxAttendance: number
  available: number
  waitlistCount: number
  userWaitlistPosition: number | null // null = not on waitlist
}

export type WeekStatus = 'last' | 'current' | 'next'

export type WeekData = {
  weekIndex: number
  startDate: string
  endDate: string
  nextWeekOpenDate: string | null
  status: WeekStatus
  slots: WeekSlot[]
  selectedSlotIds: string[]
}

/**
 * Builds week-structured slot data from the cycle, enriched with registration counts
 * and the athlete's current selections. Determines which week is last/current/next
 * based on today's date.
 */
export async function getWeekSlotData(cycle: PoolCycle, athleteId: string): Promise<WeekData[]> {
  const weeks = (cycle as any).weeks as
    | Array<{
        startDate: string
        endDate: string
        nextWeekOpenDate?: string
        slots: Array<{ slotId: string; day: string; time: string; maxAttendance: number }>
      }>
    | undefined

  if (!weeks || weeks.length === 0) return []

  const { countsBySlotId, athleteSlotIds, waitlistCountsBySlotId, athleteWaitlistPositions } =
    await getSlotRegistrationData(cycle.id, athleteId)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find which week index contains today
  let currentWeekIndex = -1
  for (let i = 0; i < weeks.length; i++) {
    const weekEntry = weeks[i]
    if (!weekEntry?.startDate || !weekEntry?.endDate) continue
    const start = new Date(weekEntry.startDate)
    const end = new Date(weekEntry.endDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    if (today >= start && today <= end) {
      currentWeekIndex = i
      break
    }
  }

  // If today is before all weeks, treat first week as current
  if (currentWeekIndex === -1) {
    const firstWeek = weeks[0]
    const firstStart = firstWeek?.startDate ? new Date(firstWeek.startDate) : new Date()
    firstStart.setHours(0, 0, 0, 0)
    currentWeekIndex = today < firstStart ? 0 : weeks.length - 1
  }

  const result: WeekData[] = []

  for (let i = 0; i < weeks.length; i++) {
    const week = weeks[i]
    if (!week) continue

    // Only include: the week before current, current, and the week after current
    if (i < currentWeekIndex - 1 || i > currentWeekIndex + 1) continue

    let status: WeekStatus
    if (i < currentWeekIndex) status = 'last'
    else if (i === currentWeekIndex) status = 'current'
    else status = 'next'

    const slots: WeekSlot[] = (week.slots ?? []).map((slot) => {
      const taken = countsBySlotId[slot.slotId] ?? 0
      return {
        slotId: slot.slotId,
        day: slot.day,
        time: slot.time,
        maxAttendance: slot.maxAttendance ?? 0,
        available: (slot.maxAttendance ?? 0) - taken,
        waitlistCount: waitlistCountsBySlotId[slot.slotId] ?? 0,
        userWaitlistPosition: athleteWaitlistPositions[slot.slotId] ?? null,
      }
    })

    const selectedSlotIds = slots.filter((s) => athleteSlotIds.has(s.slotId)).map((s) => s.slotId)

    result.push({
      weekIndex: i,
      startDate: week.startDate,
      endDate: week.endDate,
      nextWeekOpenDate: week.nextWeekOpenDate ?? null,
      status,
      slots,
      selectedSlotIds,
    })
  }

  return result
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
