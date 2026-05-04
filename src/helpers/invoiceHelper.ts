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

export type InvoiceLineItem = {
  name: string
  description: string
  unit_price: string // EUR, formatted as "10.00"
  quantity: number
  tax: { name: 'IVA0' }
}

export type CreateDraftInvoiceArgs = {
  user: {
    name: string
    surname: string
    email: string
    associateId: number | string
    nif?: string | null
  }
  lineItems: InvoiceLineItem[]
  context: 'order' | 'subscription' | 'pool-subscription' | 'group-subscription' | 'form-payment'
  stripePaymentIntentId?: string
}

export type CreateDraftInvoiceResult =
  | { invoiceId: number; sequenceNumber: string; error: undefined }
  | { invoiceId: undefined; sequenceNumber: undefined; error: string }

function getInvoiceXpressConfig(): { accountName: string; apiKey: string } {
  const accountName = process.env.INVOICEXPRESS_ACCOUNT_NAME
  const apiKey = process.env.INVOICEXPRESS_API_KEY
  if (!accountName)
    throw new Error('InvoiceXpress is not configured: missing INVOICEXPRESS_ACCOUNT_NAME')
  if (!apiKey) throw new Error('InvoiceXpress is not configured: missing INVOICEXPRESS_API_KEY')
  return { accountName, apiKey }
}

export async function createDraftInvoice(
  args: CreateDraftInvoiceArgs,
): Promise<CreateDraftInvoiceResult> {
  try {
    const { accountName, apiKey } = getInvoiceXpressConfig()

    const hasNif = typeof args.user.nif === 'string' && args.user.nif.length > 0
    const docType = hasNif ? 'invoices' : 'simplified_invoices'

    const client: Record<string, string> = {
      name: `${args.user.name} ${args.user.surname}`,
      code: String(args.user.associateId),
      email: args.user.email,
    }
    if (hasNif) {
      client['fiscal_id'] = args.user.nif!
    }

    const today = new Date()
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`

    const body = {
      invoice: {
        date: dateStr,
        due_date: dateStr,
        tax_exemption: 'M07',
        ...(args.stripePaymentIntentId ? { reference: args.stripePaymentIntentId } : {}),
        client,
        items: args.lineItems.map((item) => ({
          name: item.name,
          description: `${item.description}`,
          unit_price: item.unit_price,
          quantity: item.quantity,
          tax: { name: 'IVA0' },
        })),
      },
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    const url = `https://${accountName}.app.invoicexpress.com/${docType}.json?api_key=${apiKey}`

    let res: Response
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!res.ok) {
      const responseText = await res.text().catch(() => '')
      console.error(
        `[invoiceHelper] ${args.context} invoice failed: HTTP ${res.status} — ${responseText}`,
      )
      return {
        invoiceId: undefined,
        sequenceNumber: undefined,
        error: `HTTP ${res.status}: ${responseText}`,
      }
    }

    const data = await res.json()
    const invoice = data?.invoice
    return {
      invoiceId: invoice.id,
      sequenceNumber: invoice.sequence_number,
      error: undefined,
    }
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    const message = isTimeout
      ? `[invoiceHelper] ${args.context} invoice timed out after 10s`
      : err instanceof Error
        ? err.message
        : String(err)
    console.error(message)
    return { invoiceId: undefined, sequenceNumber: undefined, error: message }
  }
}

/**
 * Fetches the InvoiceXpress invoice for a Stripe PaymentIntent.
 * The PaymentIntent ID is stored directly as the invoice reference.
 */
export async function getReceiptByPaymentIntentId(
  paymentIntentId: string,
): Promise<GetReceiptResult> {
  try {
    const { accountName, apiKey } = getInvoiceXpressConfig()

    const params = new URLSearchParams({
      reference: paymentIntentId,
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
