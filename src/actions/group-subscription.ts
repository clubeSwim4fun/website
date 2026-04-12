'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { Group, User } from '@/payload-types'

type FormSubmission = {
  field: string
  value: any
}

export const createGroupSubscription = async ({
  data,
  groupSlug,
}: {
  data: Record<string, any>
  groupSlug: string
}) => {
  const user = (await getMeUser()).user
  if (!user) {
    throw new Error('User not found')
  }

  const payload = await getPayload({ config })

  try {
    const submitedData: FormSubmission[] = []
    Object.entries(data).forEach(([name, value]) => {
      submitedData.push({
        field: name,
        value,
      })
    })

    const selectedGroup = await payload.find({
      collection: 'groups',
      where: {
        slug: {
          equals: groupSlug,
        },
      },
      limit: 1,
    })

    if (!selectedGroup || !selectedGroup.docs || !selectedGroup.docs[0]) {
      throw new Error('Group not found')
    }

    const { id } = await payload.create({
      collection: 'group-subscription',
      data: {
        group: selectedGroup.docs[0].id,
        user: user.id,
        submissionData: submitedData,
      },
    })

    return {
      error: undefined,
      submissionId: id,
      redirectUrl: `/group-subscription/${groupSlug}/payment`,
    }
  } catch (error) {
    console.error('Error creating group subscription:', error)
    return {
      error: 'Failed to create group subscription',
    }
  }
}

export const updateGroupSubscription = async ({
  id,
  transactionId,
}: {
  id: string
  transactionId: string
}) => {
  const payload = await getPayload({ config })

  try {
    const updatedSubscription = await payload.update({
      collection: 'group-subscription',
      data: {
        transactionId,
      },
      where: {
        id: {
          equals: id,
        },
      },
    })

    // Fire-and-forget invoice creation
    ;(async () => {
      try {
        const { createDraftInvoice } = await import('@/helpers/invoiceHelper')

        const record = await payload.findByID({
          collection: 'group-subscription',
          id,
          depth: 2,
        })

        const group = record.group as Group
        const user = record.user as User

        const fullUser = await payload.findByID({
          collection: 'users',
          id: typeof user === 'string' ? user : user.id,
        })

        const period = group.subscriptionPeriod === 'monthly' ? 'mensal' : 'anual'

        await createDraftInvoice({
          user: {
            name: fullUser.name,
            surname: fullUser.surname,
            email: fullUser.email,
            associateId: fullUser.associateId ?? '',
            nif: fullUser.nif,
          },
          lineItems: [
            {
              name: group.title,
              description: `Subscrição ${period} — ${group.title}`,
              unit_price: group.subscriptionPrice.toFixed(2),
              quantity: 1,
              tax: { name: 'IVA0' },
            },
          ],
          context: 'group-subscription',
          stripePaymentIntentId: transactionId,
        })
      } catch (err) {
        console.error('[updateGroupSubscription] Invoice creation failed:', err)
      }
    })()

    return {
      updatedSubscription,
    }
  } catch (error) {
    console.error('Error updating group subscription:', error)
    return {
      error: 'Failed to update group subscription',
    }
  }
}
