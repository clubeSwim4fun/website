'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { getTranslations } from 'next-intl/server'
import { sendEmail } from '@/helpers/emailHelper'
import { render } from '@react-email/components'
import React from 'react'
import { notifyWaitlist, getSlotAttendanceCounts } from '@/helpers/poolHelper'
import { PoolCycle, PoolSubscription, User } from '@/payload-types'
import { revalidatePath } from 'next/cache'

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
  slotIndexes: number[],
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

    if (!subscription || subscription.status !== 'active') {
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

    const cycle = (await payload.findByID({
      collection: 'pool-cycles',
      id: cycleId,
      req: { transactionID },
    })) as PoolCycle

    if (!cycle) {
      await payload.db.rollbackTransaction(transactionID)
      return { success: false, message: t('Common.unexpectedError') }
    }

    // Re-count attendance inside the transaction, excluding this subscription's current selections
    const attendanceCounts = await getSlotAttendanceCounts(cycleId, transactionID, subscriptionId)

    for (const idx of slotIndexes) {
      const slot = cycle.availableSlots?.[idx]
      if (!slot) {
        await payload.db.rollbackTransaction(transactionID)
        return { success: false, message: t('PoolSubscription.slotNotFound') }
      }
      const count = attendanceCounts[idx] ?? 0
      if (count >= ((slot as any).maxAttendance ?? Infinity)) {
        await payload.db.rollbackTransaction(transactionID)
        return { success: false, message: t('PoolSubscription.slotFullError') }
      }
    }

    await payload.update({
      collection: 'pool-subscriptions',
      id: subscriptionId,
      data: {
        selectedSlots: slotIndexes.map((idx) => ({
          slotIndex: idx,
          day: cycle.availableSlots?.[idx]?.day ?? '',
          time: cycle.availableSlots?.[idx]?.time ?? '',
        })),
      },
      req: { transactionID },
    })

    await payload.db.commitTransaction(transactionID)

    revalidatePath('/[locale]/(profileUser)/pool/my-subscription', 'page')

    return { success: true }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    payload.logger.error(`[selectPoolSlots] Error: ${JSON.stringify(error)}`)
    return { success: false, message: t('Common.unexpectedError') }
  }
}
