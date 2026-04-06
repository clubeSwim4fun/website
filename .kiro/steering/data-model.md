---
inclusion: always
---

# Data Model

## Collections

### `users`

- `name`, `surname`, `email` (auth field)
- `role`: `admin` | `editor` | `default` (in JWT)
- `status`: `pendingAnalysis` | `pendingUpdate` | `pendingPayment` | `active` | `expired`
- `associateId`: auto-incremented member number
- `federationId`: swimming federation ID
- `groups`: relationship → `groups` + `group-categories` (hasMany)
- `nif`, `phone`, `gender`, `disability`, `birthDate`, `nationality`
- `Address`: street, number, state, zipcode
- `identityFile`, `profilePicture`: uploads → `user-media`
- `wantsToBeFederado`, `heardAboutClub` → `aboutClub`, `fieldsToUpdate`
- Hooks: `beforeChange` auto-increments `associateId`; `afterChange` sends email on `pendingUpdate`/`pendingPayment`

### `events`

- `title`, `description` (localized) | `start`, `end` | `slug`
- `category` → `categories` | `isRiver`, `hasTshirt`, `tshirtSizes`
- `distances[]`, `distanceCategories[]` | `address` | `promoCode`, `memberDiscount`
- `externalRegistrationUrl`: when set, hides internal ticket cart
- `tickets`: relationship → `tickets` (filtered to this event)

### `tickets`

- `name` (localized), `price` (EUR), `distance` (meters)
- `start`, `end`: purchase window | `eventFor` → `events`
- `canBePurchasedBy` → `group-categories` (hasMany) — restricts who can buy; empty = anyone

### `carts`

- `user` → `users` | `items[]`: `{ selectedTicket, selectedTshirtSize }` | `totalPrice`

### `orders`

- `user` → `users` | `total` | `stripePaymentIntentId` | `paymentStatus`
- `events[]`: `{ event, tickets[]: { ticket, tshirtSize, ticketPurchased, eventPurchaseId } }`
- `ticketPurchased`: admin marks confirmed | `eventPurchaseId`: dorsal number

### `subscription`

- `user` → `users` | `type`: `memberFee` | `pool`
- `amount`, `startDate`, `endDate` | `stripePaymentIntentId` | `paymentStatus`: `pending` | `paid` | `failed`

### `groups`

- `title` (localized), `badge`, `slug`
- `hasSubscription`, `subscriptionPrice`, `subscriptionPeriod`: `monthly` | `yearly`
- `subscriptionForm` → `forms`

### `group-subscription`

- `group` → `groups` | `user` → `users`
- `status`: `pending` | `approved` | `rejected`
- `transactionId`: Stripe Payment Intent ID | `submissionData[]`: `{ field, value }`

### `group-categories`

Sub-categories within groups (age groups, levels). Used to restrict ticket purchasing.

### `pages`

CMS pages with layout builder. Supports per-block visibility control.

### `posts`

Blog posts with drafts, scheduling, authors, categories, SEO.

### `media` / `user-media`

S3-backed uploads. `user-media` is private (identity docs, profile pictures).

### `federation-history`

Tracks `federationId` changes per user over time.

### `gender`, `disability`, `aboutClub`

Lookup collections synced from `GeneralConfigs` via `updateCollections` hook.

---

## Globals

### `generalConfigs`

Publicly readable. Key tabs:

- **userData**: `genders`, `disabilities`, `aboutClub` options (synced to collections)
- **settings**: `login.registerUrl`, `fixedPages` titles, `myProfile` options
- **associationFees**: `registrationFee` (one-time "Jóia"), `monthlyFee`, `limitDate` (1–31), `periodicity`: `1` | `3` | `12`

### `header` / `footer`

Logo + nav items / contact info + social links + nav.
