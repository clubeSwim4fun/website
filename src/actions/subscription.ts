'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload, TypedLocale } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { getUserPaymentAmount } from '@/helpers/userHelper'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { GeneralConfig, Subscription } from '@/payload-types'
import { sendEmail } from '@/helpers/emailHelper'
import { render } from '@react-email/components'
import React from 'react'

type responseType = {
  success: boolean
  message: string
  orderId?: string
  stripePaymentIntentId?: string
}

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

  // TODO - integrate with payment gateway
  const transactionID = await payload.db.beginTransaction()

  if (!transactionID) {
    return {
      success: false,
      message: 'Error creating transaction',
    }
  }

  try {
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
        paymentStatus: 'paid',
      },
    })

    if (response.id) {
      await payload.update({
        collection: 'users',
        id: user!.id,
        req: { transactionID },
        data: { status: 'active' },
      })

      await payload.db.commitTransaction(transactionID)

      // Fire-and-forget confirmation email
      ;(async () => {
        try {
          const { SubscriptionConfirmationEmail } = await import('@/email/subscriptionConfirmation')
          const emailHtml = await render(
            React.createElement(SubscriptionConfirmationEmail, {
              subscription: response as Subscription,
              locale,
            }),
          )
          const emailT = await getTranslations({
            locale: locale as TypedLocale,
            namespace: 'Email',
          })
          await sendEmail({
            to: user!.email,
            subject: emailT('SubscriptionConfirmation.subject'),
            emailHtml,
          })
        } catch (emailError) {
          payload.logger.error(`[createSubscription] Email failed: ${JSON.stringify(emailError)}`)
        }
      })()

      // Fire-and-forget invoice creation
      ;(async () => {
        try {
          const { createDraftInvoice } = await import('@/helpers/invoiceHelper')
          const fees = globalConfig.associationFees
          const isFirstPayment = user?.status === 'pendingPayment'
          const monthlyAmount =
            amount - (isFirstPayment && fees?.registrationFee ? fees.registrationFee : 0)

          const lineItems: Parameters<typeof createDraftInvoice>[0]['lineItems'] = []

          if (isFirstPayment && fees?.registrationFee) {
            lineItems.push({
              name: 'Jóia',
              description: 'Quota de inscrição (pagamento único anual)',
              unit_price: fees.registrationFee.toFixed(2),
              quantity: 1,
              tax: { name: 'IVA0' },
            })
          }

          lineItems.push({
            name: 'Quota de sócio',
            description: `${startDate.toISOString().slice(0, 10)} – ${endDate.toISOString().slice(0, 10)}`,
            unit_price: monthlyAmount.toFixed(2),
            quantity: 1,
            tax: { name: 'IVA0' },
          })

          await createDraftInvoice({
            user: {
              name: user!.name,
              surname: user!.surname,
              email: user!.email,
              associateId: user!.associateId ?? '',
              nif: user!.nif,
            },
            lineItems,
            context: 'subscription',
            stripePaymentIntentId,
          })
        } catch (err) {
          payload.logger.error(
            `[createSubscription] Invoice creation failed: ${JSON.stringify(err)}`,
          )
        }
      })()

      return {
        success: true,
        message: 'subscription added',
        orderId: response.id,
        stripePaymentIntentId,
      }
    }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)

    payload.logger.error(`error while creating subscription: ${JSON.stringify(error)}`)

    return {
      success: false,
      message: t('Common.unexpectedError'),
    }
  }

  return {
    success: false,
    message: t('Common.unexpectedError'),
  }
}
