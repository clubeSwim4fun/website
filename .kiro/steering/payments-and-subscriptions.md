---
inclusion: always
---

# Payments & Subscriptions

## Current Payment Gateway: Stripe

Stripe is the active payment integration for all payment flows.

### Stripe Flow

1. Frontend renders `StripePaymentForm` from `src/components/StripePayment/index.tsx`
2. On mount, it calls `createPaymentIntent()` from `src/helpers/stripeHelper.ts` to get a `clientSecret`
3. The Stripe Elements widget collects card/MB Way details
4. On submit, `stripe.confirmPayment()` is called
5. On success, the `onSuccess(paymentIntentId)` callback fires — the calling page stores the intent ID and updates the record
6. Stripe webhooks (`POST /api/stripe/webhook`) handle async confirmation for MB Way and 3DS flows, updating `paymentStatus` to `paid` or `failed`

### Stripe Environment Variables

```
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Webhook Handler

`src/app/(payload)/api/stripe/webhook/route.ts` handles:

- `payment_intent.succeeded` → sets `paymentStatus: 'paid'` and stores `stripePaymentIntentId`
- `payment_intent.payment_failed` → sets `paymentStatus: 'failed'`

The PaymentIntent `metadata` must include:

- `type`: `'order'` | `'subscription'` | `'group-subscription'`
- `recordId`: the Payload document ID to update

---

## Membership Subscriptions (`subscription` collection)

Handles club membership fees paid by individual users.

### Server Action: `createSubscription` (`src/actions/subscription.ts`)

- Gets current user via `getMeUser()`
- Reads fee config from `GeneralConfigs.associationFees`
- Calls `getUserPaymentAmount()` from `src/helpers/userHelper.ts` to calculate:
  - `amount`: based on `monthlyFee` × `periodicity`
  - `startDate` / `endDate`: based on `limitDate` cutoff logic
    - If today ≤ `limitDate`: covers current month
    - If today > `limitDate`: starts from next month
- Creates a `subscription` record with `paymentStatus: 'paid'` and stores `stripePaymentIntentId`
- Updates `user.status` to `active`

### Subscription Types

- `memberFee`: standard club membership
- `pool`: pool access fee (separate from membership)

### Fee Configuration (in `GeneralConfigs`)

- `registrationFee`: one-time joining fee ("Jóia"), charged on first subscription
- `monthlyFee`: base monthly amount
- `limitDate`: day-of-month cutoff (1–31)
- `periodicity`: `1` | `3` | `12` months

---

## Group Subscriptions (`group-subscription` collection)

Handles paid membership to specific groups (e.g. competitive team).

### Server Action: `createGroupSubscription` (`src/actions/group-subscription.ts`)

- Looks up the group by slug
- Creates a `group-subscription` record with `status: 'pending'`
- Stores form submission data in `submissionData[]`
- Returns `redirectUrl` pointing to the payment page

### Server Action: `updateGroupSubscription` (`src/actions/group-subscription.ts`)

- Called after successful Stripe payment
- Stores the `stripePaymentIntentId` in `transactionId` field
- Admin manually approves/rejects via the admin panel

### Group Subscription Config (on `groups` collection)

- `hasSubscription`: enables paid subscription for the group
- `subscriptionPrice` + `subscriptionPeriod`: `monthly` | `yearly`
- `subscriptionForm`: a form-builder form users fill out when subscribing

---

## Event Ticket Orders (`orders` collection)

Handles ticket purchases for swimming events.

### Flow

1. User browses event page (`/event/[slug]`)
2. User adds tickets to cart via `cartHelper.ts`
3. Cart page (`/cart`) shows items with T-shirt size selection
4. Checkout goes to payment page (`/payment`)
5. `StripePaymentForm` collects payment; on success calls `createOrder()` (`src/actions/order.ts`)
6. Order confirmation email sent via `OrderConfirmationEmail` template
7. Admin assigns dorsal numbers (`eventPurchaseId`) and marks `ticketPurchased`

### Cart Helper (`src/helpers/cartHelper.ts`)

Key functions:

- `getMyCart()`: fetch current user's cart
- `addToCart()`: add ticket, validates availability window
- `removeFromCart()`: remove item
- `removeExpiredTickets()`: cleans up tickets past their purchase window

### Ticket Availability (`src/helpers/eventHelper.ts`)

`isTicketAvailable(ticket)` checks:

- Current date is between `ticket.start` and `ticket.end`

### Ticket Purchase Restrictions

Tickets have `canBePurchasedBy` (relationship to `group-categories`). If set, only users belonging to those group-categories can purchase. If empty, anyone can buy.
