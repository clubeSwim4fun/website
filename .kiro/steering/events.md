# Events — Logic, Rules & Flows

This document covers everything about events: the data model, business rules, ticket availability logic, the full checkout flow, and known limitations.

---

## Data Model

### `events` collection (`src/collections/Events/Events.ts`)

| Field                     | Type                                           | Notes                                                                         |
| ------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| `title`                   | text (localized)                               | Required                                                                      |
| `description`             | richText (localized)                           | Required, Lexical editor                                                      |
| `start`                   | date+time                                      | Required — event start datetime                                               |
| `end`                     | date+time                                      | Required — event end datetime                                                 |
| `timeToBeConfirmed`       | checkbox                                       | Shows "(a confirmar)" next to the time on the detail page                     |
| `image`                   | upload → `media`                               | Optional hero image; falls back to static placeholders if absent              |
| `category`                | relationship → `categories`                    | Required                                                                      |
| `isRiver`                 | checkbox                                       | Controls which static fallback image is used when no `image` is set           |
| `hasTshirt`               | checkbox                                       | Enables T-shirt size selection in the cart                                    |
| `tshirtSizes`             | select (hasMany)                               | XS / S / M / L / XL / XXL / XXXL                                              |
| `distances`               | array of `{ distance: number }`                | Legacy flat distances in meters, shown in the sidebar                         |
| `distanceCategories`      | array (see below)                              | Rich per-category breakdown (STANDARD, SPRINT, EXPERIENCE, etc.)              |
| `promoCode`               | text                                           | Displayed as a badge on the event detail sidebar                              |
| `memberDiscount`          | number (0–100)                                 | Percentage discount badge — display only, not yet applied to prices           |
| `externalRegistrationUrl` | text                                           | When set, shows an "Inscrições" button and **hides the internal ticket cart** |
| `address`                 | group: street, number, state, zipcode, country | Shown in the sidebar                                                          |
| `tickets`                 | relationship → `tickets` (hasMany)             | Filtered to tickets whose `eventFor` matches this event                       |
| `slug`                    | auto-generated                                 | Used in the URL `/event/[slug]`                                               |

### `distanceCategories` array fields

Each entry represents one race category (e.g. STANDARD, SPRINT, EXPERIENCE):

| Field             | Type                                       |
| ----------------- | ------------------------------------------ |
| `name`            | text (localized)                           |
| `totalDistance`   | number (meters)                            |
| `swimDistance`    | number (meters)                            |
| `runDistance`     | number (meters)                            |
| `transitions`     | text (e.g. "6 Natação / 7 Corrida")        |
| `longestSwim`     | number (meters)                            |
| `longestRun`      | number (meters)                            |
| `elevationGain`   | number (D+)                                |
| `timeLimit`       | text (localized, e.g. "6 Horas")           |
| `regulationUrl`   | text (external URL)                        |
| `registrationUrl` | text (external URL, per-category override) |

### `tickets` collection (`src/collections/Events/Tickets.ts`)

| Field              | Type                                        | Notes                                                                    |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------------ |
| `name`             | text (localized)                            | Required                                                                 |
| `price`            | number                                      | Required, in EUR                                                         |
| `distance`         | number (meters)                             | Required — the distance this ticket covers                               |
| `start`            | date+time                                   | Required — purchase window opens                                         |
| `end`              | date+time                                   | Required — purchase window closes                                        |
| `eventFor`         | relationship → `events`                     | Required — which event this ticket belongs to                            |
| `canBePurchasedBy` | relationship → `group-categories` (hasMany) | Optional — if set, restricts purchase to users in those group-categories |

---

## Ticket Availability Rules (`src/helpers/eventHelper.ts`)

### `isTicketAvailable(ticket)`

A ticket is available for purchase when **both** conditions are true:

- `ticket.start` is in the past (purchase window has opened)
- `ticket.end` is in the future (purchase window has not closed)

```
isTicketAvailable = isPastDate(ticket.start) && !isPastDate(ticket.end)
```

### `canBuyTickets(event)`

Returns `false` (tickets section hidden entirely) when **any** of these is true:

- `event.start` is in the past — the event has already happened
- The event has no tickets at all
- Every ticket on the event fails `isTicketAvailable` (all windows closed)

Returns `true` only when the event is upcoming AND at least one ticket is within its purchase window.

### `canBePurchasedBy` restriction

Checked in `EventRow` (`src/components/EventTickets/event-row.tsx`):

- If `ticket.canBePurchasedBy` is empty → anyone can buy
- If set → the logged-in user must have at least one matching entry in `user.groups` (comparing `group.value.id` against the group-category IDs)
- If the user doesn't qualify, the price cell is replaced with a warning icon and a tooltip explaining which groups can buy

---

## Who Sees the Ticket Section

The `EventTickets` component is only rendered when **all** of these are true:

1. A user is logged in (`user` prop is truthy — passed from `getMeUser()` on the server)
2. `canBuyTickets(event)` returns `true`
3. `externalRegistrationUrl` is **not** set on the event

If `externalRegistrationUrl` is set, the internal cart is hidden and replaced with an "Inscrições" button linking to the external URL.

> Note: there is no check on `user.status` at the event page level. A user with `status: 'expired'` or `status: 'pendingPayment'` will still see the ticket section as long as they are logged in. Status enforcement only applies to the `(profileUser)` protected routes (subscription, my-profile, etc.).

---

## Checkout Flow — Event Tickets

```
/event/[slug]
  → user clicks "Add to cart" (AddToCart component)
  → cartHelper.addToCart() server action
  → /cart
  → user selects T-shirt sizes (if hasTshirt)
  → cartHelper.updateCart() server action
  → /payment
  → user clicks "Pay" → createOrder() server action
  → /order/[id]
```

### Step 1 — Event page (`/event/[slug]`)

- Server fetches event by slug with locale
- Server fetches the current user's existing order for this event (to detect already-purchased tickets)
- Server fetches all `group-categories` (for `canBePurchasedBy` checks)
- `EventDetails` sidebar shows date, time, location, distances, category, add-to-calendar, and optionally the "Inscrições" button
- `EventTickets` shows a table of available tickets; each row has Add/Remove cart buttons

### Step 2 — Cart (`/cart`)

- `getMyCart()` fetches or creates the user's cart
- On load, `removeExpiredTickets()` runs automatically — any ticket whose purchase window has closed is silently removed from the cart
- Cart is grouped by event for display
- If `event.hasTshirt` is true, a T-shirt size selector appears per ticket
- "Proceed to payment" button navigates to `/payment`

### Step 3 — Payment (`/payment`)

- Renders `PaymentForm` with `StripePaymentForm`
- On success, calls `createOrder()` which sets `paymentStatus: 'paid'`
- Stripe webhook at `/api/stripe/webhook` handles async confirmation (MB Way, 3DS)

### Step 4 — Order confirmation (`/order/[id]`)

- `createOrder()` server action (`src/actions/order.ts`):
  - Reads the user's cart
  - Groups tickets by event
  - Creates an `orders` document
  - Clears the cart (sets `items: []`, `totalPrice: 0`)
  - Sends an `OrderConfirmationEmail` (email `to` field is currently empty — **TODO**)
  - Returns `{ success, orderId }`
- Order page shows a summary table and total spent

---

## Cart Helper (`src/helpers/cartHelper.ts`)

| Function                           | Description                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `getMyCart()`                      | Finds the user's cart or creates one. Runs `removeExpiredTickets()` on load.                    |
| `addToCart({ ticket })`            | Pushes ticket to `cart.items`, increments `totalPrice`.                                         |
| `removeFromCart({ ticket })`       | Splices ticket from `cart.items`, decrements `totalPrice`.                                      |
| `updateCart(selectedTshirtSize[])` | Updates `selectedTshirtSize` per item. Size format: `"ticketId-SIZE"`.                          |
| `removeExpiredTickets(cart)`       | Iterates items, re-fetches each ticket's dates, removes any where `isTicketAvailable` is false. |

All cart helpers are server actions (`'use server'`). After mutations they call `revalidatePath` on the event page to bust the Next.js cache.

---

## Admin Responsibilities

After an order is created, admins manage it in the PayloadCMS admin panel:

| Field             | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| `ticketPurchased` | Admin marks `true` when the physical ticket/bib is confirmed |
| `eventPurchaseId` | Admin assigns the dorsal number                              |

These are per-ticket fields inside `orders.events[].tickets[]`.

---

## Known Issues & TODOs

| #   | Issue                                                                                                   | Location                                            |
| --- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | `createOrder` uses `payload.init()` instead of `getPayload()` — should be refactored                    | `src/actions/order.ts`                              |
| 2   | Order confirmation email `to` field is hardcoded as empty string                                        | `src/actions/order.ts`                              |
| 3   | `memberDiscount` field is display-only — not applied to ticket prices                                   | `src/collections/Events/Events.ts`                  |
| 4   | `canBuyTickets` checks `event.start` but not `event.end` — past multi-day events may still show tickets | `src/helpers/eventHelper.ts`                        |
| 5   | Group-categories are fetched on every event page load with a TODO to move into context                  | `src/app/(frontend)/[locale]/event/[slug]/page.tsx` |
| 6   | No ticket capacity / max attendees enforcement                                                          | `src/collections/Events/Tickets.ts`                 |
