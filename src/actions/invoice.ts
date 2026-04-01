'use server'

import { getReceiptByPaymentIntentId, GetReceiptResult } from '@/helpers/invoiceHelper'

export async function fetchReceiptForPaymentIntent(
  paymentIntentId: string,
): Promise<GetReceiptResult> {
  return getReceiptByPaymentIntentId(paymentIntentId)
}
