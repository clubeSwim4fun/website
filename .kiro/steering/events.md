---
inclusion: always
---

# Events

## Key Fields (`events` collection)

- `title`, `description` (localized) | `start`, `end` | `slug`
- `externalRegistrationUrl`: when set, hides internal cart, shows external "Inscrições" button
- `hasTshirt` + `tshirtSizes`: enables size selection in cart
- `isRiver`: controls fallback image | `memberDiscount`: display-only badge (not applied to prices)
- `distanceCategories[]`: rich per-category breakdown (STANDARD, SPRINT, etc.)
- `tickets`: relationship → `tickets` filtered to this event

## `tickets` collection

- `name` (localized), `price` (EUR), `distance` (meters)
- `start`/`end`: purchase window | `eventFor` → `events`
- `canBePurchasedBy` → `group-categories` (hasMany) — empty = anyone can buy

## Availability Logic (`src/helpers/eventHelper.ts`)

- `isTicketAvailable(ticket)`: `isPastDate(ticket.start) && !isPastDate(ticket.end)`
- `canBuyTickets(event)` returns `false` if: event already started OR no tickets OR all tickets unavailable
- `canBePurchasedBy` check (in `EventRow`): user must have at least one matching `group-categories` entry in `user.groups`

## Ticket Section Visibility

Rendered only when: user is logged in AND `canBuyTickets()` is true AND no `externalRegistrationUrl`.
No `user.status` check on event page — status is only enforced on `(profileUser)` routes.

## Checkout Flow

```
/event/[slug] → addToCart() → /cart → (T-shirt size) → /payment → createOrder() → /order/[id]
```

- Cart load: `removeExpiredTickets()` runs automatically, silently drops stale items
- `createOrder()` (`src/actions/order.ts`): creates order, clears cart, sends confirmation email, fires invoice creation

## Cart Helper (`src/helpers/cartHelper.ts`)

All functions are server actions with `revalidatePath` after mutations.

| Function                     | Description                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| `getMyCart()`                | Find or create cart; runs `removeExpiredTickets()`               |
| `addToCart({ ticket })`      | Push ticket, increment `totalPrice`                              |
| `removeFromCart({ ticket })` | Splice ticket, decrement `totalPrice`                            |
| `updateCart(sizes[])`        | Update `selectedTshirtSize` per item (format: `"ticketId-SIZE"`) |
| `removeExpiredTickets(cart)` | Re-fetch ticket dates, remove unavailable                        |

## Admin Post-Order Fields

Inside `orders.events[].tickets[]`:

- `ticketPurchased`: mark when physical ticket confirmed
- `eventPurchaseId`: assign dorsal number

## Known TODOs

| #   | Issue                                                                                               | Location                            |
| --- | --------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 1   | `createOrder` uses `payload.init()` instead of `getPayload()`                                       | `src/actions/order.ts`              |
| 2   | Order confirmation email `to` is hardcoded as empty string                                          | `src/actions/order.ts`              |
| 3   | `memberDiscount` not applied to prices                                                              | `src/collections/Events/Events.ts`  |
| 4   | `canBuyTickets` checks `event.start` not `event.end` — multi-day past events may still show tickets | `src/helpers/eventHelper.ts`        |
| 5   | No ticket capacity enforcement                                                                      | `src/collections/Events/Tickets.ts` |
