'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { getTranslations } from 'next-intl/server'
import { sendEmail } from '@/helpers/emailHelper'
import { render } from '@react-email/components'
import React from 'react'
import { notifyWaitlist } from '@/helpers/poolHelper'
import { PoolCycle, PoolSubscription, User } from '@/payload-types'
import { revalidatePath } from 'next/cache'

/**
 * Formats a slot ISO dateTime string into a localized day name (PT).
 * e.g. "2026-05-04T20:00:00.000Z" → "Segunda-feira"
 */
function formatSlotDay(dateTime: string): string {
  const date = new Date(dateTime)
  return date.toLocaleDateString('pt-PT', { weekday: 'long', timeZone: 'UTC' })
}

/**
 * Formats start time and computes end time from duration.
 * e.g. "2026-05-04T20:00:00.000Z", 60 → "20h-21h"
 */
function formatSlotTime(dateTime: string, duration: number): string {
  const start = new Date(dateTime)
  const end = new Date(start.getTime() + duration * 60 * 1000)
  const fmt = (d: Date) =>
    `${d.getUTCHours()}h${d.getUTCMinutes() > 0 ? String(d.getUTCMinutes()).padStart(2, '0') : ''}`
  return `${fmt(start)}-${fmt(end)}`
}

/**
 * Creates a pool subscription record in `pending` state before payment.
 * Pass the returned `subscriptionId` as `recordId` in the Stripe payment intent metadata
 * with `type: 'pool-subscription'`.
 * The webhook confirms payment, sets status to `active`, sends email and creates the invoice.
 */
export async function createPendingPoolSubscription(
  cycleId: string,
): Promise<{ success: boolean; subscriptionId?: string; message?: string }> {
  const t = await getTranslations()
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user) {
    return { success: false, message: t('Common.unexpectedError') }
  }

  const transactionID = await payload.db.beginTransaction()

  if (!transactionID) {
    return { success: false, message: t('Common.unexpectedError') }
  }

  try {
    const cycle = (await payload.findByID({
      collection: 'pool-cycles',
      id: cycleId,
      req: { transactionID },
    })) as PoolCycle

    if (!cycle || cycle.status !== 'open') {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    if (cycle.price < 0.5) {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('PoolSubscription.priceTooLow') }
    }

    const activeResult = await payload.find({
      collection: 'pool-subscriptions',
      where: { and: [{ cycle: { equals: cycleId } }, { status: { equals: 'active' } }] },
      limit: 0,
      req: { transactionID },
    })

    if (activeResult.totalDocs >= cycle.maxAthletes) {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    const existingResult = await payload.find({
      collection: 'pool-subscriptions',
      where: {
        and: [
          { cycle: { equals: cycleId } },
          { athlete: { equals: user.id } },
          { status: { in: ['active', 'waitlisted'] } },
        ],
      },
      limit: 1,
      req: { transactionID },
    })

    if (existingResult.totalDocs > 0) {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    const response = await payload.create({
      collection: 'pool-subscriptions',
      data: {
        athlete: user.id,
        cycle: cycleId,
        status: 'active',
        paymentStatus: 'pending',
      },
      req: { transactionID },
    })

    await payload.db.commitTransaction(transactionID)

    return { success: true, subscriptionId: response.id }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    payload.logger.error(`[createPendingPoolSubscription] Error: ${JSON.stringify(error)}`)
    return { success: false, message: t('Common.unexpectedError') }
  }
}

export async function joinPoolWaitlist(cycleId: string): Promise<{
  success: boolean
  subscriptionId?: string
  waitlistPosition?: number
  message?: string
}> {
  const t = await getTranslations()
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user) {
    return { success: false, message: t('Common.unexpectedError') }
  }

  const transactionID = await payload.db.beginTransaction()

  if (!transactionID) {
    return { success: false, message: t('Common.unexpectedError') }
  }

  try {
    const cycle = (await payload.findByID({
      collection: 'pool-cycles',
      id: cycleId,
      req: { transactionID },
    })) as PoolCycle

    if (!cycle || cycle.status !== 'open') {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    const activeResult = await payload.find({
      collection: 'pool-subscriptions',
      where: { and: [{ cycle: { equals: cycleId } }, { status: { equals: 'active' } }] },
      limit: 0,
      req: { transactionID },
    })

    if (activeResult.totalDocs < cycle.maxAthletes) {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    const waitlistResult = await payload.find({
      collection: 'pool-subscriptions',
      where: { and: [{ cycle: { equals: cycleId } }, { status: { equals: 'waitlisted' } }] },
      limit: 0,
      req: { transactionID },
    })

    if (waitlistResult.totalDocs >= cycle.waitlistLimit) {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    const existingResult = await payload.find({
      collection: 'pool-subscriptions',
      where: {
        and: [
          { cycle: { equals: cycleId } },
          { athlete: { equals: user.id } },
          { status: { in: ['active', 'waitlisted'] } },
        ],
      },
      limit: 1,
      req: { transactionID },
    })

    if (existingResult.totalDocs > 0) {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    const waitlistedSubs = await payload.find({
      collection: 'pool-subscriptions',
      where: { and: [{ cycle: { equals: cycleId } }, { status: { equals: 'waitlisted' } }] },
      limit: 1000,
      req: { transactionID },
    })

    const maxPosition = waitlistedSubs.docs.reduce((max, sub) => {
      const pos = (sub as PoolSubscription).waitlistPosition ?? 0
      return pos > max ? pos : max
    }, 0)

    const newPosition = maxPosition + 1

    const response = await payload.create({
      collection: 'pool-subscriptions',
      data: {
        athlete: user.id,
        cycle: cycleId,
        status: 'waitlisted',
        paymentStatus: 'pending',
        waitlistPosition: newPosition,
      },
      req: { transactionID },
    })

    await payload.db.commitTransaction(transactionID)
    ;(async () => {
      try {
        const { default: PoolWaitlistConfirmationEmail } = await import(
          '@/email/poolWaitlistConfirmation'
        )
        const emailHtml = await render(
          React.createElement(PoolWaitlistConfirmationEmail, {
            subscription: response as PoolSubscription,
          }),
        )
        const athlete = user as User
        if (athlete.email) {
          await sendEmail({
            to: athlete.email,
            subject: 'Pool waitlist confirmed',
            emailHtml,
          })
        }
      } catch (emailError) {
        payload.logger.error(`[joinPoolWaitlist] Email failed: ${JSON.stringify(emailError)}`)
      }
    })()

    return { success: true, subscriptionId: response.id, waitlistPosition: newPosition }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    payload.logger.error(`[joinPoolWaitlist] Error: ${JSON.stringify(error)}`)
    return { success: false, message: t('Common.unexpectedError') }
  }
}

/**
 * Deletes a pending (unpaid) subscription created by createPendingPoolSubscription.
 * Called when the user closes/cancels the payment form before completing payment.
 * Only works on subscriptions owned by the current user with paymentStatus === 'pending'.
 */
export async function deletePendingPoolSubscription(
  subscriptionId: string,
): Promise<{ success: boolean }> {
  const payload = await getPayload({ config })
  const { user } = await getMeUser()
  if (!user) return { success: false }

  try {
    const sub = (await payload.findByID({
      collection: 'pool-subscriptions',
      id: subscriptionId,
      depth: 0,
    })) as PoolSubscription

    const athleteId = typeof sub.athlete === 'string' ? sub.athlete : sub.athlete.id
    if (athleteId !== user.id) return { success: false }
    if (sub.paymentStatus !== 'pending') return { success: false }

    await payload.delete({ collection: 'pool-subscriptions', id: subscriptionId })
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function cancelPoolSubscription(
  subscriptionId: string,
): Promise<{ success: boolean; message?: string }> {
  const t = await getTranslations()
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user) {
    return { success: false, message: t('Common.unexpectedError') }
  }

  const transactionID = await payload.db.beginTransaction()

  if (!transactionID) {
    return { success: false, message: t('Common.unexpectedError') }
  }

  try {
    const subscription = (await payload.findByID({
      collection: 'pool-subscriptions',
      id: subscriptionId,
      depth: 1,
      req: { transactionID },
    })) as PoolSubscription

    if (!subscription) {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    const athleteId =
      typeof subscription.athlete === 'string' ? subscription.athlete : subscription.athlete.id

    if (athleteId !== user.id && user.role !== 'admin') {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    const cycleId =
      typeof subscription.cycle === 'string' ? subscription.cycle : subscription.cycle.id

    await payload.update({
      collection: 'pool-subscriptions',
      id: subscriptionId,
      data: { status: 'cancelled' },
      req: { transactionID },
    })

    await payload.db.commitTransaction(transactionID)
    ;(async () => {
      try {
        const { default: PoolCancellationConfirmationEmail } = await import(
          '@/email/poolCancellationConfirmation'
        )
        const emailHtml = await render(
          React.createElement(PoolCancellationConfirmationEmail, {
            subscription,
          }),
        )
        const athlete =
          typeof subscription.athlete === 'string' ? user : (subscription.athlete as User)
        if (athlete.email) {
          await sendEmail({
            to: athlete.email,
            subject: 'Pool subscription cancelled',
            emailHtml,
          })
        }
      } catch (emailError) {
        payload.logger.error(`[cancelPoolSubscription] Email failed: ${JSON.stringify(emailError)}`)
      }
    })()
    ;(async () => {
      try {
        await notifyWaitlist(cycleId)
      } catch (notifyError) {
        payload.logger.error(
          `[cancelPoolSubscription] notifyWaitlist failed: ${JSON.stringify(notifyError)}`,
        )
      }
    })()

    return { success: true }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    payload.logger.error(`[cancelPoolSubscription] Error: ${JSON.stringify(error)}`)
    return { success: false, message: t('Common.unexpectedError') }
  }
}

export async function selectPoolSlots(
  subscriptionId: string,
  slotIds: string[],
): Promise<{ success: boolean; message?: string }> {
  const t = await getTranslations()
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user) {
    return { success: false, message: t('Common.unexpectedError') }
  }

  try {
    const subscription = (await payload.findByID({
      collection: 'pool-subscriptions',
      id: subscriptionId,
      depth: 1,
    })) as PoolSubscription

    if (
      !subscription ||
      subscription.status !== 'active' ||
      subscription.paymentStatus !== 'paid'
    ) {
      return { success: false, message: t('Common.unexpectedError') }
    }

    const athleteId =
      typeof subscription.athlete === 'string' ? subscription.athlete : subscription.athlete.id
    if (athleteId !== user.id && user.role !== 'admin') {
      return { success: false, message: t('Common.unexpectedError') }
    }

    const cycleId =
      typeof subscription.cycle === 'string' ? subscription.cycle : subscription.cycle.id

    const cycle = (await payload.findByID({ collection: 'pool-cycles', id: cycleId })) as PoolCycle
    if (!cycle) {
      return { success: false, message: t('Common.unexpectedError') }
    }

    const allSlots: Array<{
      slotId: string
      dateTime: string
      duration: number
      maxAttendance: number
    }> = []
    const weeks = (cycle as any).weeks ?? []
    for (const week of weeks) {
      for (const slot of week.slots ?? []) {
        allSlots.push({
          slotId: slot.slotId,
          dateTime: slot.dateTime,
          duration: slot.duration ?? 60,
          maxAttendance: slot.maxAttendance ?? 0,
        })
      }
    }
    for (const slot of (cycle.availableSlots ?? []) as any[]) {
      if (slot.slotId)
        allSlots.push({
          slotId: slot.slotId,
          dateTime: slot.dateTime ?? '',
          duration: slot.duration ?? 60,
          maxAttendance: slot.maxAttendance ?? 0,
        })
    }

    const existingRegs = await payload.find({
      collection: 'pool-slot-registrations',
      where: { cycle: { equals: cycleId } },
      limit: 10000,
      pagination: false,
      depth: 0,
    })

    const countsBySlotId: Record<string, number> = {}
    const athleteRegBySlotId: Record<string, string> = {}

    for (const reg of existingRegs.docs as any[]) {
      const sid: string = reg.slotId
      if (!sid) continue
      countsBySlotId[sid] = (countsBySlotId[sid] ?? 0) + 1
      const regAthleteId = typeof reg.athlete === 'string' ? reg.athlete : reg.athlete?.id
      if (regAthleteId === athleteId) {
        athleteRegBySlotId[sid] = reg.id
      }
    }

    const previousSlotIds = Object.keys(athleteRegBySlotId)
    const toAcquire = slotIds.filter((sid) => !previousSlotIds.includes(sid))
    const toRelease = previousSlotIds.filter((sid) => !slotIds.includes(sid))

    for (const sid of toAcquire) {
      const slotDef = allSlots.find((s) => s.slotId === sid)
      if (!slotDef) {
        return { success: false, message: t('PoolSubscription.slotNotFound') }
      }
      const taken = countsBySlotId[sid] ?? 0
      if (taken >= (slotDef.maxAttendance ?? 0)) {
        return { success: false, message: t('PoolSubscription.slotFullError') }
      }
    }

    for (const sid of toAcquire) {
      const slotDef = allSlots.find((s) => s.slotId === sid)!

      const freshCount = await payload.find({
        collection: 'pool-slot-registrations',
        where: { and: [{ cycle: { equals: cycleId } }, { slotId: { equals: sid } }] },
        limit: 0,
        pagination: false,
      })
      if (freshCount.totalDocs >= (slotDef.maxAttendance ?? 0)) {
        for (const acquiredSid of toAcquire.slice(0, toAcquire.indexOf(sid))) {
          const newReg = await payload.find({
            collection: 'pool-slot-registrations',
            where: {
              and: [
                { cycle: { equals: cycleId } },
                { slotId: { equals: acquiredSid } },
                { athlete: { equals: athleteId } },
              ],
            },
            limit: 1,
          })
          if (newReg.docs[0]) {
            await payload.delete({ collection: 'pool-slot-registrations', id: newReg.docs[0].id })
          }
        }
        return { success: false, message: t('PoolSubscription.slotFullError') }
      }

      await payload.create({
        collection: 'pool-slot-registrations',
        data: {
          athlete: athleteId,
          cycle: cycleId,
          slotId: sid,
          slotDay: formatSlotDay(slotDef.dateTime),
          slotTime: formatSlotTime(slotDef.dateTime, slotDef.duration),
        } as any,
      })
    }

    for (const sid of toRelease) {
      const regId = athleteRegBySlotId[sid]
      if (regId) {
        await payload.delete({ collection: 'pool-slot-registrations', id: regId })
      }
    }

    await payload.update({
      collection: 'pool-subscriptions',
      id: subscriptionId,
      data: {
        selectedSlots: slotIds.map((sid) => {
          const slotDef = allSlots.find((s) => s.slotId === sid)
          const idx = allSlots.findIndex((s) => s.slotId === sid)
          return {
            slotIndex: idx,
            day: slotDef ? formatSlotDay(slotDef.dateTime) : '',
            time: slotDef ? formatSlotTime(slotDef.dateTime, slotDef.duration) : '',
          }
        }),
      },
    })

    revalidatePath('/[locale]/(profileUser)/pool/my-subscription', 'page')
    return { success: true }
  } catch (error) {
    payload.logger.error(`[selectPoolSlots] Error: ${JSON.stringify(error)}`)
    return { success: false, message: t('Common.unexpectedError') }
  }
}

export async function joinSlotWaitlist(
  cycleId: string,
  slotId: string,
  slotDateTime: string,
  slotDuration: number,
): Promise<{ success: boolean; position?: number; message?: string }> {
  const t = await getTranslations()
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user) return { success: false, message: t('Common.unexpectedError') }

  const subResult = await payload.find({
    collection: 'pool-subscriptions',
    where: {
      and: [
        { cycle: { equals: cycleId } },
        { athlete: { equals: user.id } },
        { status: { equals: 'active' } },
      ],
    },
    limit: 1,
  })
  if (subResult.totalDocs === 0) return { success: false, message: t('Common.unexpectedError') }

  const existing = await payload.find({
    collection: 'pool-slot-waitlist',
    where: {
      and: [
        { cycle: { equals: cycleId } },
        { slotId: { equals: slotId } },
        { athlete: { equals: user.id } },
      ],
    },
    limit: 1,
  })
  if (existing.totalDocs > 0) return { success: false, message: t('Common.unexpectedError') }

  const allEntries = await payload.find({
    collection: 'pool-slot-waitlist',
    where: { and: [{ cycle: { equals: cycleId } }, { slotId: { equals: slotId } }] },
    limit: 0,
  })
  const position = allEntries.totalDocs + 1

  await payload.create({
    collection: 'pool-slot-waitlist',
    data: {
      athlete: user.id,
      cycle: cycleId,
      slotId,
      slotDay: formatSlotDay(slotDateTime),
      slotTime: formatSlotTime(slotDateTime, slotDuration),
      position,
    } as any,
  })

  revalidatePath('/[locale]/(profileUser)/pool/my-subscription', 'page')
  return { success: true, position }
}

export async function leaveSlotWaitlist(
  cycleId: string,
  slotId: string,
): Promise<{ success: boolean; message?: string }> {
  const t = await getTranslations()
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user) return { success: false, message: t('Common.unexpectedError') }

  const existing = await payload.find({
    collection: 'pool-slot-waitlist',
    where: {
      and: [
        { cycle: { equals: cycleId } },
        { slotId: { equals: slotId } },
        { athlete: { equals: user.id } },
      ],
    },
    limit: 1,
  })

  if (existing.totalDocs === 0) return { success: false, message: t('Common.unexpectedError') }

  const entry = existing.docs[0]!
  const removedPosition = (entry as any).position as number

  await payload.delete({ collection: 'pool-slot-waitlist', id: entry.id })

  const later = await payload.find({
    collection: 'pool-slot-waitlist',
    where: {
      and: [
        { cycle: { equals: cycleId } },
        { slotId: { equals: slotId } },
        { position: { greater_than: removedPosition } },
      ],
    },
    limit: 1000,
  })
  for (const e of later.docs) {
    await payload.update({
      collection: 'pool-slot-waitlist',
      id: e.id,
      data: { position: ((e as any).position as number) - 1 },
    })
  }

  revalidatePath('/[locale]/(profileUser)/pool/my-subscription', 'page')
  return { success: true }
}
