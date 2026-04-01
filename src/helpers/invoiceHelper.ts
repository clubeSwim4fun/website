type InvoiceXpressInvoice = {
  id: number
  status: string
  type: string
  sequence_number: string
  date: string
  reference: string
  permalink: string
  total: number
  currency: string
  client: {
    id: number
    name: string
    country: string
  }
}

type InvoiceXpressListResponse = {
  invoices: InvoiceXpressInvoice[]
  pagination: {
    total_entries: number
    current_page: number
    total_pages: number
    per_page: number
  }
}

export type ReceiptResult = {
  id: number
  status: string
  type: string
  sequence_number: string
  date: string
  reference: string
  permalink: string
  total: number
  currency: string
  clientName: string
}

export type GetReceiptResult =
  | { receipt: ReceiptResult; error: undefined }
  | { receipt: undefined; error: string }

function getInvoiceXpressConfig(): { accountName: string; apiKey: string } {
  const accountName = process.env.INVOICEXPRESS_ACCOUNT_NAME
  const apiKey = process.env.INVOICEXPRESS_API_KEY
  if (!accountName || !apiKey) throw new Error('InvoiceXpress is not configured')
  return { accountName, apiKey }
}

/**
 * Fetches the InvoiceXpress invoice for a Stripe PaymentIntent.
 * Flow: PI → expand latest_charge → strip 'ch_'/'py_' prefix → search InvoiceXpress by reference.
 */
export async function getReceiptByPaymentIntentId(
  paymentIntentId: string,
): Promise<GetReceiptResult> {
  try {
    const { accountName, apiKey } = getInvoiceXpressConfig()

    // Step 1: resolve the charge ID from Stripe
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) return { receipt: undefined, error: 'Stripe is not configured' }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}?expand[]=latest_charge`,
      { headers: { Authorization: `Bearer ${stripeKey}` } },
    )
    if (!stripeRes.ok) {
      return { receipt: undefined, error: 'Failed to retrieve payment from Stripe' }
    }
    const pi = await stripeRes.json()
    const chargeId: string | undefined = pi.latest_charge?.id ?? pi.latest_charge
    if (!chargeId) {
      return { receipt: undefined, error: 'No charge associated with this payment' }
    }

    // Step 2: strip 'ch_' or 'py_' prefix — InvoiceXpress uses the bare charge ID as reference
    const reference = /^(ch_|py_)/.test(chargeId) ? chargeId.slice(3) : chargeId

    // Step 3: search InvoiceXpress
    const params = new URLSearchParams({
      reference,
      non_archived: 'true',
      api_key: apiKey,
    })

    const url = `https://${accountName}.app.invoicexpress.com/invoices.json?${params}`
    const res = await fetch(url, { headers: { accept: 'application/json' } })

    if (!res.ok) {
      return { receipt: undefined, error: `InvoiceXpress error: ${res.status} ${res.statusText}` }
    }

    const data: InvoiceXpressListResponse = await res.json()
    const invoice = data.invoices?.[0]

    if (!invoice) {
      return { receipt: undefined, error: 'No invoice found for this payment' }
    }

    return {
      receipt: {
        id: invoice.id,
        status: invoice.status,
        type: invoice.type,
        sequence_number: invoice.sequence_number,
        date: invoice.date,
        reference: invoice.reference,
        permalink: invoice.permalink,
        total: invoice.total,
        currency: invoice.currency,
        clientName: invoice.client?.name ?? '',
      },
      error: undefined,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { receipt: undefined, error: message }
  }
}
