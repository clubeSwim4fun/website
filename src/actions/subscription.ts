'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload, TypedLocale } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { getUserPaymentAmount } from '@/helpers/userHelper'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { GeneralConfig } from '@/payload-types'

type responseType = {
  success: boolean
  message: string
  orderId?: string
  stripePaymentIntentId?: string
}

/**
 * Creates a subscription record in `pending` state and returns its ID.
 * The payment intent metadata must include `{ type: 'subscription', recordId }`.
 * The webhook confirms payment, updates status to `paid`, activates the user, and creates the invoice.
 */
export const createPendingSubscription = async (
  payForCurrentMonth: boolean,
): Promise<{
  success: boolean
  subscriptionId?: string
  amountCents?: number
  message?: string
}> => {
  const t = await getTranslations()
  const locale = await getLocale()
  const payload = await getPayload({ config })
  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig
  const user = (await getMeUser()).user

  if (!user) {
    return { success: false, message: t('Common.unexpectedError') }
  }

  const { amount, startDate, endDate } = await getUserPaymentAmount({
    user,
    payForCurrentMonth,
    fees: globalConfig.associationFees,
  })

  try {
    const response = await payload.create({
      collection: 'subscription',
      data: {
        user: user.id,
        type: 'memberFee',
        amount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        paymentStatus: 'pending',
      },
    })

    return {
      success: true,
      subscriptionId: response.id,
      amountCents: Math.round(amount * 100),
    }
  } catch (error) {
    payload.logger.error(`[createPendingSubscription] Error: ${JSON.stringify(error)}`)
    return { success: false, message: t('Common.unexpectedError') }
  }
}

/**
 * @deprecated Use createPendingSubscription + webhook instead.
 * Kept for backwards compatibility — redirects to the new flow.
 */
export const createSubscription = async (
  payForCurrentMonth: boolean,
  stripePaymentIntentId: string,
): Promise<responseType> => {
  const t = await getTranslations()
  const locale = await getLocale()
  const payload = await getPayload({ config })
  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig
  const user = (await getMeUser()).user

  const { amount, startDate, endDate } = await getUserPaymentAmount({
    user: user,
    payForCurrentMonth,
    fees: globalConfig.associationFees,
  })

  const transactionID = await payload.db.beginTransaction()

  if (!transactionID) {
    return { success: false, message: 'Error creating transaction' }
  }

  try {
    // Create as pending — the webhook will confirm payment, activate user, send email and invoice
    const response = await payload.create({
      collection: 'subscription',
      req: { transactionID },
      data: {
        user: user,
        type: 'memberFee',
        amount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        stripePaymentIntentId,
        paymentStatus: 'pending',
      },
    })

    await payload.db.commitTransaction(transactionID)

    return {
      success: true,
      message: 'subscription added',
      orderId: response.id,
      stripePaymentIntentId,
    }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    payload.logger.error(`error while creating subscription: ${JSON.stringify(error)}`)
    return { success: false, message: t('Common.unexpectedError') }
  }
}
