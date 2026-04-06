---
inclusion: always
---

# Invoicing — InvoiceXpress

## Rules

- Invoice creation is always **fire-and-forget** — never block or fail the payment flow
- Always wrap in `try/catch` inside an IIFE; log errors with context prefix e.g. `[createOrder]`
- A failed invoice never rolls back a payment
- Do not increase the 10-second timeout in `createDraftInvoice`

## Env Vars

```
INVOICEXPRESS_ACCOUNT_NAME=   # subdomain
INVOICEXPRESS_API_KEY=
```

## `createDraftInvoice()` (`src/helpers/invoiceHelper.ts`)

- User has `nif` → `invoices` (full invoice); no `nif` → `simplified_invoices`
- Always: `tax_exemption: 'M07'`, all line items `tax: { name: 'IVA0' }`
- `stripePaymentIntentId` stored as invoice `reference` (used for receipt lookup)
- Client `code` = `associateId`; client `name` suffixed with `- PAYLOADCMS`
- Returns `{ invoiceId, sequenceNumber, error }` — check `error` before using IDs

## `getReceiptByPaymentIntentId()` (`src/helpers/invoiceHelper.ts`)

Lookup flow: PaymentIntent → `latest_charge` → strip `ch_`/`py_` prefix → search InvoiceXpress by `reference`.
Exposed via `fetchReceiptForPaymentIntent()` in `src/actions/invoice.ts`.

## Trigger Points (both must stay in sync)

| Action                                                          | Context                | Line items                                                           |
| --------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------- |
| `createOrder()` `src/actions/order.ts`                          | `'order'`              | One item per event+ticket pair, quantity aggregated                  |
| `createSubscription()` `src/actions/subscription.ts`            | `'subscription'`       | `'Jóia'` (if first payment) + `'Quota de sócio'` with ISO date range |
| `updateGroupSubscription()` `src/actions/group-subscription.ts` | `'group-subscription'` | Group title + period label                                           |
| pool subscription `src/actions/pool-subscription.ts`            | `'subscription'`       | `'Quota de piscina'` + Portuguese month+year                         |

Webhook (`src/app/(payload)/api/stripe/webhook/route.ts`) mirrors all four for async payments (MB Way, 3DS).

## Line Item Conventions

| Type               | `name`                  | `description`                                  |
| ------------------ | ----------------------- | ---------------------------------------------- |
| Event ticket       | event title (localized) | ticket name (localized)                        |
| Registration fee   | `'Jóia'`                | `'Quota de inscrição (pagamento único anual)'` |
| Membership         | `'Quota de sócio'`      | `'YYYY-MM-DD – YYYY-MM-DD'`                    |
| Group subscription | group title             | `'Subscrição mensal/anual — <group title>'`    |
| Pool subscription  | `'Quota de piscina'`    | `'<Month PT> <Year>'`                          |

`unit_price`: always `(amount).toFixed(2)` (EUR string).

## Adding a New Payment Flow

```ts
;(async () => {
  try {
    const { createDraftInvoice } = await import('@/helpers/invoiceHelper')
    await createDraftInvoice({
      user: { name, surname, email, associateId: associateId ?? '', nif },
      lineItems: [
        { name, description, unit_price: amount.toFixed(2), quantity: 1, tax: { name: 'IVA0' } },
      ],
      context: 'your-context',
      stripePaymentIntentId,
    })
  } catch (err) {
    console.error('[yourAction] Invoice creation failed:', err)
  }
})()
```

Also mirror in the webhook handler and add the new `type` to webhook `metadata` docs.

## Known TODOs

| #   | Issue                                                                                       | Location                       |
| --- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | Duplicate invoices possible for MB Way/3DS (both action + webhook fire)                     | `src/actions/*.ts` + webhook   |
| 2   | Pool-subscription webhook passes `context: 'subscription'` instead of `'pool-subscription'` | webhook route                  |
| 3   | No retry on failed invoice creation                                                         | `src/helpers/invoiceHelper.ts` |
| 4   | `fetchReceiptForPaymentIntent` has no UI caller yet                                         | `src/actions/invoice.ts`       |
