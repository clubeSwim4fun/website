'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload, TypedLocale } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { getUserPaymentAmount } from '@/helpers/userHelper'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { GeneralConfig } from '@/payload-types'
import { revalidatePath } from 'next/cache'

type responseType = {
  success: boolean
  message: string
  orderId?: string
}

export const createSubscription = async (payForCurrentMonth: boolean): Promise<responseType> => {
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
      },
    })

    await payload.update({
      collection: 'users',
      where: {
        id: {
          equals: user?.id,
        },
      },
      data: {
        status: 'active',
      },
    })

    if (response.id) {
      await payload.db.commitTransaction(transactionID)

      return {
        success: true,
        message: 'subscription added',
        orderId: response.id,
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
