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
import { getMonthLabel } from '@/collections/Pool/PoolCycles'

export async function createPoolSubscription(
  cycleId: string,
  stripePaymentIntentId: string,
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
    // Fetch and validate the cycle
    const cycle = (await payload.findByID({
      collection: 'pool-cycles',
      id: cycleId,
      req: { transactionID },
    })) as PoolCycle

    if (!cycle || cycle.status !== 'open') {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    // Check active count < maxAthletes
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

    // Check no existing active/waitlisted sub for this athlete+cycle
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

    // Create the subscription
    const response = await payload.create({
      collection: 'pool-subscriptions',
      data: {
        athlete: user.id,
        cycle: cycleId,
        status: 'active',
        paymentStatus: 'paid',
        stripePaymentIntentId,
      },
      req: { transactionID },
    })

    await payload.db.commitTransaction(transactionID)

    // Fire-and-forget confirmation email
    ;(async () => {
      try {
        const { default: PoolSubscriptionConfirmationEmail } = await import(
          '@/email/poolSubscriptionConfirmation'
        )
        const emailHtml = await render(
          React.createElement(PoolSubscriptionConfirmationEmail, {
            subscription: response as PoolSubscription,
          }),
        )
        const athlete = user as User
        if (athlete.email) {
          await sendEmail({
            to: athlete.email,
            subject: 'Pool subscription confirmed',
            emailHtml,
          })
        }
      } catch (emailError) {
        payload.logger.error(`[createPoolSubscription] Email failed: ${JSON.stringify(emailError)}`)
      }
    })()

    // Fire-and-forget invoice creation
    ;(async () => {
      try {
        const { createDraftInvoice } = await import('@/helpers/invoiceHelper')
        const monthLabel = getMonthLabel(cycle.month as string, 'pt')
        await createDraftInvoice({
          user: {
            name: user!.name,
            surname: user!.surname,
            email: user!.email,
            associateId: user!.associateId ?? '',
            nif: user!.nif,
          },
          lineItems: [
            {
              name: 'Quota de piscina',
              description: `${monthLabel} ${cycle.year ?? ''}`,
              unit_price: (cycle.price ?? 0).toFixed(2),
              quantity: 1,
              tax: { name: 'IVA0' },
            },
          ],
          context: 'subscription',
          stripePaymentIntentId,
        })
      } catch (err) {
        payload.logger.error(
          `[createPoolSubscription] Invoice creation failed: ${JSON.stringify(err)}`,
        )
      }
    })()

    return { success: true, subscriptionId: response.id }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    payload.logger.error(`[createPoolSubscription] Error: ${JSON.stringify(error)}`)
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
    // Fetch and validate the cycle
    const cycle = (await payload.findByID({
      collection: 'pool-cycles',
      id: cycleId,
      req: { transactionID },
    })) as PoolCycle

    if (!cycle || cycle.status !== 'open') {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    // Check active count >= maxAthletes (cycle must be full)
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

    // Check waitlist count < waitlistLimit
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

    // Check no existing active/waitlisted sub for this athlete+cycle
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

    // Calculate new waitlist position: max existing position + 1 (or 1 if none)
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

    // Create the waitlisted subscription
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

    // Fire-and-forget waitlist confirmation email
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
    // Fetch the subscription
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

    // Verify ownership or admin
    const athleteId =
      typeof subscription.athlete === 'string' ? subscription.athlete : subscription.athlete.id

    if (athleteId !== user.id && user.role !== 'admin') {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    const cycleId =
      typeof subscription.cycle === 'string' ? subscription.cycle : subscription.cycle.id

    // Update subscription status to cancelled
    await payload.update({
      collection: 'pool-subscriptions',
      id: subscriptionId,
      data: { status: 'cancelled' },
      req: { transactionID },
    })

    await payload.db.commitTransaction(transactionID)

    // Fire-and-forget cancellation email
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

    // Fire-and-forget waitlist notification
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

    if (!subscription || subscription.status !== 'active') {
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

    // Flatten all slots from all weeks for lookup
    const allSlots: Array<{ slotId: string; day: string; time: string; maxAttendance: number }> = []
    const weeks = (cycle as any).weeks ?? []
    for (const week of weeks) {
      for (const slot of week.slots ?? []) {
        allSlots.push({
          slotId: slot.slotId,
          day: slot.day,
          time: slot.time,
          maxAttendance: slot.maxAttendance ?? 0,
        })
      }
    }
    // Also support legacy flat availableSlots
    for (const slot of (cycle.availableSlots ?? []) as any[]) {
      if (slot.slotId) allSlots.push(slot)
    }

    // Fetch all current registrations for this cycle once
    const existingRegs = await payload.find({
      collection: 'pool-slot-registrations',
      where: { cycle: { equals: cycleId } },
      limit: 10000,
      pagination: false,
      depth: 0,
    })

    // Build maps from the single fetch
    const countsBySlotId: Record<string, number> = {}
    const athleteRegBySlotId: Record<string, string> = {} // slotId → registration doc id

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

    // Capacity check for new slots
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

    // Acquire new slots via Payload (handles ObjectIds correctly)
    for (const sid of toAcquire) {
      const slotDef = allSlots.find((s) => s.slotId === sid)!

      // Double-check atomically: re-count just before insert
      const freshCount = await payload.find({
        collection: 'pool-slot-registrations',
        where: { and: [{ cycle: { equals: cycleId } }, { slotId: { equals: sid } }] },
        limit: 0,
        pagination: false,
      })
      if (freshCount.totalDocs >= (slotDef.maxAttendance ?? 0)) {
        // Roll back any already acquired in this loop
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
          slotDay: slotDef.day ?? '',
          slotTime: slotDef.time ?? '',
        } as any,
      })
    }

    // Release deselected slots
    for (const sid of toRelease) {
      const regId = athleteRegBySlotId[sid]
      if (regId) {
        await payload.delete({ collection: 'pool-slot-registrations', id: regId })
      }
    }

    // Keep subscription.selectedSlots in sync for admin visibility
    await payload.update({
      collection: 'pool-subscriptions',
      id: subscriptionId,
      data: {
        selectedSlots: slotIds.map((sid) => {
          const slotDef = allSlots.find((s) => s.slotId === sid)
          const idx = allSlots.findIndex((s) => s.slotId === sid)
          return { slotIndex: idx, day: slotDef?.day ?? '', time: slotDef?.time ?? '' }
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
  slotDay: string,
  slotTime: string,
): Promise<{ success: boolean; position?: number; message?: string }> {
  const t = await getTranslations()
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user) return { success: false, message: t('Common.unexpectedError') }

  // Must have an active subscription for this cycle
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

  // Check not already on waitlist for this slot
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

  // Calculate next position
  const allEntries = await payload.find({
    collection: 'pool-slot-waitlist',
    where: { and: [{ cycle: { equals: cycleId } }, { slotId: { equals: slotId } }] },
    limit: 0,
  })
  const position = allEntries.totalDocs + 1

  await payload.create({
    collection: 'pool-slot-waitlist',
    data: { athlete: user.id, cycle: cycleId, slotId, slotDay, slotTime, position } as any,
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

  // Shift down positions for everyone after the removed entry
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
