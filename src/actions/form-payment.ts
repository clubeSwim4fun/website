'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { createPaymentIntent } from '@/helpers/stripeHelper'

type AssignToGroup =
  | { relationTo: 'groups'; value: string }
  | { relationTo: 'group-categories'; value: string }

export type CreateFormPaymentArgs = {
  formId?: string | null
  amountEur: number
  description?: string
  assignToGroup?: AssignToGroup | null
  submissionData: { field: string; value: string }[]
}

export type CreateFormPaymentResult =
  | { clientSecret: string; paymentIntentId: string; formPaymentId: string; error: undefined }
  | { clientSecret: undefined; paymentIntentId: undefined; formPaymentId: undefined; error: string }

export async function createFormPayment({
  formId,
  amountEur,
  description,
  assignToGroup,
  submissionData,
}: CreateFormPaymentArgs): Promise<CreateFormPaymentResult> {
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  try {
    const record = await payload.create({
      collection: 'form-payments',
      data: {
        ...(formId ? { form: formId } : {}),
        user: user?.id ?? undefined,
        paymentStatus: 'pending',
        amount: amountEur,
        assignToGroup: assignToGroup ?? undefined,
        submissionData,
      } as any,
    })

    const result = await createPaymentIntent({
      amount: Math.round(amountEur * 100),
      description,
      metadata: { type: 'form-payment', recordId: record.id },
      customer: user
        ? {
            name: `${user.name ?? ''} ${user.surname ?? ''}`.trim(),
            email: user.email,
            taxNumber: user.nif ?? undefined,
          }
        : undefined,
    })

    if (result.error) {
      await payload.delete({ collection: 'form-payments', id: record.id })
      return {
        clientSecret: undefined,
        paymentIntentId: undefined,
        formPaymentId: undefined,
        error: result.error,
      }
    }

    return {
      clientSecret: result.clientSecret!,
      paymentIntentId: result.paymentIntentId!,
      formPaymentId: record.id,
      error: undefined,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return {
      clientSecret: undefined,
      paymentIntentId: undefined,
      formPaymentId: undefined,
      error: message,
    }
  }
}

export async function confirmFormPayment(
  formPaymentId: string,
  stripePaymentIntentId: string,
): Promise<{ success: boolean; error?: string }> {
  const payload = await getPayload({ config })

  try {
    const record = await payload.findByID({
      collection: 'form-payments',
      id: formPaymentId,
      depth: 2,
    })

    if (!record) return { success: false, error: 'Record not found' }

    // Mark as paid
    await payload.update({
      collection: 'form-payments',
      id: formPaymentId,
      data: { paymentStatus: 'paid', stripePaymentIntentId },
    })

    // Assign user to group/subgroup
    const assignToGroup = record.assignToGroup as
      | { relationTo: 'groups' | 'group-categories'; value: { id: string } | string }
      | null
      | undefined

    const userId = typeof record.user === 'string' ? record.user : (record.user as any)?.id

    if (assignToGroup && userId) {
      const user = await payload.findByID({ collection: 'users', id: userId, depth: 0 })

      const existingGroups: { relationTo: string; value: string }[] = (
        (user.groups as any[]) ?? []
      ).map((g: any) =>
        typeof g === 'string'
          ? { relationTo: 'groups', value: g }
          : {
              relationTo: g.relationTo ?? 'groups',
              value: typeof g.value === 'string' ? g.value : g.value?.id,
            },
      )

      const groupId =
        typeof assignToGroup.value === 'string' ? assignToGroup.value : assignToGroup.value?.id

      const alreadyAssigned = existingGroups.some(
        (g) => g.relationTo === assignToGroup.relationTo && g.value === groupId,
      )

      if (!alreadyAssigned) {
        await payload.update({
          collection: 'users',
          id: userId,
          data: {
            groups: [
              ...existingGroups,
              { relationTo: assignToGroup.relationTo, value: groupId },
            ] as any,
          },
        })
      }
    }

    // Invoice creation is handled exclusively by the webhook to avoid duplicates

    return { success: true }
  } catch (err) {
    console.error('[confirmFormPayment] error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
