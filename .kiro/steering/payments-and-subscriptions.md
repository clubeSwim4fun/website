---
inclusion: always
---

# Payments & Subscriptions

## Current Payment Gateway: SIBS

SIBS is a Portuguese payment gateway used for Multibanco references. It is the **only active payment integration**. Stripe is planned but not yet implemented.

### SIBS Flow

1. Frontend calls `generateSibsPaymentTransaction()` from `src/helpers/sibsHelper.ts`
2. That hits the internal API route `POST /api/sibs` (`src/app/(payload)/api/sibs/route.ts`)
3. The route calls the SIBS API and returns `{ transactionID, formContext }`
4. `formContext` is used to render the SIBS payment widget in the browser
5. After payment, the `sibsTransactionId` is stored on the relevant record

### SIBS Environment Variables

```
SIBS_TERMINAL_ID=
SIBS_PAYMENT_METHODS=   # comma-separated, e.g. "CARD,MB"
```

### Payment Expiry

SIBS payment references expire 4 minutes after creation (hardcoded in the API route).

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
- Creates a `subscription` record with `paymentStatus: 'pending'`
- **TODO**: payment gateway integration is incomplete — the SIBS transaction ID parameter exists but the confirmation webhook/callback is not yet wired

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
5. Server action `createOrder()` (`src/actions/order.ts`) converts cart to order
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

---

## Future: Stripe Integration

When implementing Stripe:

- Replace or complement the SIBS helper with a Stripe helper
- The `subscription`, `group-subscription`, and `orders` collections already have a `transactionId`/`sibsTransactionId` field — add a `stripePaymentIntentId` or rename as appropriate
- Implement webhook handlers for payment confirmation
- Update `paymentStatus` from `pending` → `paid` | `failed` via webhook
- The `createSubscription` and `createOrder` actions have `// TODO - integrate with payment gateway` comments marking the exact integration points
