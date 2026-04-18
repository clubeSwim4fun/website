---
inclusion: fileMatch
fileMatchPattern: 'src/actions/{subscription,pool-subscription,group-subscription,order,form-payment}.ts,src/components/StripePayment/**,src/app/(frontend)/[locale]/(profileUser)/subscription/**,src/app/(frontend)/[locale]/group-subscription/**,src/app/(frontend)/[locale]/payment/**,src/app/(payload)/api/stripe/**'
---

# Payments & Subscriptions

## Stripe Flow

1. `StripePaymentForm` (`src/components/StripePayment/index.tsx`) calls `createPaymentIntent()` on mount
2. Stripe Elements collects card/MB Way details
3. `stripe.confirmPayment()` → `onSuccess(paymentIntentId)` callback fires
4. Webhook (`POST /api/stripe/webhook`) handles async methods (MB Way, 3DS)

**PaymentIntent `metadata` must include:**

- `type`: `'order'` | `'subscription'` | `'group-subscription'` | `'pool-subscription'`
- `recordId`: Payload document ID to update

**Webhook events:**

- `payment_intent.succeeded` → `paymentStatus: 'paid'`, stores `stripePaymentIntentId`
- `payment_intent.payment_failed` → `paymentStatus: 'failed'`

## Membership Subscriptions (`subscription` collection)

`createSubscription()` (`src/actions/subscription.ts`):

- Reads fees from `GeneralConfigs.associationFees`
- `getUserPaymentAmount()` calculates `amount`, `startDate`, `endDate` based on `limitDate` cutoff
- Creates `subscription` record with `paymentStatus: 'paid'`, updates `user.status` to `active`

Fee config fields: `registrationFee` (one-time "Jóia"), `monthlyFee`, `limitDate` (1–31), `periodicity` (`1`|`3`|`12`)

## Group Subscriptions (`group-subscription` collection)

- `createGroupSubscription()`: creates record with `status: 'pending'`, stores form `submissionData[]`, returns `redirectUrl`
- `updateGroupSubscription()`: stores `stripePaymentIntentId` in `transactionId` after payment
- Admin manually approves/rejects in admin panel

## Event Ticket Orders (`orders` collection)

`createOrder()` (`src/actions/order.ts`): reads cart → creates order → clears cart → sends confirmation email → fires invoice creation (fire-and-forget).

Cart functions in `src/helpers/cartHelper.ts`: `getMyCart()`, `addToCart()`, `removeFromCart()`, `removeExpiredTickets()`.

Ticket restriction: `canBePurchasedBy` → `group-categories`. Empty = anyone can buy.
