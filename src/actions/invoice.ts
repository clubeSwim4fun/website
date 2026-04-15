'use server'

import {
  createDraftInvoice,
  getReceiptByPaymentIntentId,
  GetReceiptResult,
  InvoiceLineItem,
} from '@/helpers/invoiceHelper'
import { getMeUser } from '@/utilities/getMeUser'

export async function fetchReceiptForPaymentIntent(
  paymentIntentId: string,
): Promise<GetReceiptResult> {
  return getReceiptByPaymentIntentId(paymentIntentId)
}

export type CreateBlockInvoiceArgs = {
  stripePaymentIntentId: string
  lineItems: InvoiceLineItem[]
  context: 'form-payment'
}

export async function createBlockInvoice(args: CreateBlockInvoiceArgs): Promise<void> {
  const { user } = await getMeUser()
  if (!user) return
  ;(async () => {
    try {
      const { createDraftInvoice: create } = await import('@/helpers/invoiceHelper')
      await create({
        user: {
          name: user.name ?? '',
          surname: user.surname ?? '',
          email: user.email,
          associateId: user.associateId ?? '',
          nif: user.nif ?? null,
        },
        lineItems: args.lineItems,
        context: args.context,
        stripePaymentIntentId: args.stripePaymentIntentId,
      })
    } catch (err) {
      console.error('[createBlockInvoice] Invoice creation failed:', err)
    }
  })()
}
