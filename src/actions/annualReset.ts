'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import { render } from '@react-email/components'
import React from 'react'
import { getMeUser } from '@/utilities/getMeUser'
import { sendEmail } from '@/helpers/emailHelper'
import { MembershipRenewalEmail } from '@/email/membershipRenewal'
import { getTranslations } from 'next-intl/server'
import { User } from '@/payload-types'

export type ResetResult = {
  success: boolean
  message: string
  updatedCount?: number
}

export async function performAnnualReset(): Promise<ResetResult> {
  const t = await getTranslations()
  const { user } = await getMeUser()

  if (!user || user.role !== 'admin') {
    return { success: false, message: t('Common.notAuthorized') }
  }

  const payload = await getPayload({ config })

  // Find all users to reset
  const result = await payload.find({
    collection: 'users',
    limit: 0,
    pagination: false,
    where: {
      status: {
        in: ['active', 'expired'],
      },
    },
  })

  const affectedUsers = result.docs as User[]
  const updatedCount = affectedUsers.length

  if (updatedCount === 0) {
    return { success: true, message: 'No users to reset.', updatedCount: 0 }
  }

  const transactionID = await payload.db.beginTransaction()

  if (!transactionID) {
    return { success: false, message: t('Common.transactionError') }
  }

  try {
    // Bulk update bypassing afterChange hooks to avoid double-emailing
    await payload.db.updateMany({
      collection: 'users',
      req: { transactionID } as any,
      where: {
        status: {
          in: ['active', 'expired'],
        },
      },
      data: { status: 'pendingPayment' },
    })

    await payload.db.commitTransaction(transactionID)
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    payload.logger.error(`Annual reset DB error: ${JSON.stringify(error)}`)
    return { success: false, message: t('Common.unexpectedError') }
  }

  // Send renewal emails — failures are logged but do not roll back the status updates
  const emailT = await getTranslations({ locale: 'pt', namespace: 'Email' })

  for (const affectedUser of affectedUsers) {
    try {
      const emailHtml = await render(
        React.createElement(MembershipRenewalEmail, { user: affectedUser }),
      )
      await sendEmail({
        emailHtml,
        subject: emailT('MembershipRenewal.subject'),
        to: affectedUser.email,
      })
    } catch (emailError) {
      payload.logger.error(
        `Annual reset: failed to send email to ${affectedUser.email}: ${JSON.stringify(emailError)}`,
      )
    }
  }

  return { success: true, message: 'Annual reset completed.', updatedCount }
}
