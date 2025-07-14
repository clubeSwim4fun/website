'use server'

import { getClientSideURL } from '@/utilities/getURL'

export type SibsPaymentTransaction = {
  price: number
  orderID?: string
  description?: string
}

export type SibsTransactionResponse = {
  transactionID: string
  formContext: string
  error?: Error
}

export const generateSibsPaymentTransaction = async ({
  price,
  orderID,
  description,
}: SibsPaymentTransaction): Promise<SibsTransactionResponse> => {
  let transactionID = ''
  let formContext = ''

  try {
    const sibsForm = await fetch(`${getClientSideURL()}/api/sibs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        amount: price,
        merchantTransactionId: orderID,
        description,
      }),
    })

    if (sibsForm) {
      const json = await sibsForm.json()

      transactionID = json.transactionID
      formContext = json.formContext
    }

    return {
      transactionID,
      formContext,
    }
  } catch (error) {
    console.error('Error fetching SIBS form:', error)

    return {
      transactionID: '',
      formContext: '',
      error: new Error('Failed to generate SIBS payment transaction'),
    }
    // TODO - handle error properly, maybe redirect to an error page
  }
}
