---
inclusion: always
---

# Data Model — Collections & Globals

## Collections

### Users (`users`)

The core auth collection. Users register themselves (anyone can create), but accounts require admin approval before becoming active.

Key fields:

- `name`, `surname`, `email` (auth)
- `role`: `admin` | `editor` | `default` (saved to JWT)
- `status`: `pendingAnalysis` → `pendingUpdate` | `pendingPayment` → `active` | `expired`
- `associateId`: auto-incremented member number
- `federationId`: swimming federation ID
- `groups`: relationship to `groups` and `group-categories` (hasMany)
- `gender`, `disability`, `birthDate`, `nationality`, `nif`, `phone`
- `Address`: street, number, state, zipcode
- `identityFile`, `profilePicture`: uploads to `user-media`
- `wantsToBeFederado`: checkbox for federation registration
- `heardAboutClub`: relationship to `aboutClub`
- `fieldsToUpdate`: admin can flag which fields need correction (used in `pendingUpdate` flow)

Hooks:

- `beforeChange`: auto-increment `associateId`, save federation history
- `afterChange`: send email when status changes to `pendingUpdate` or `pendingPayment`

### Events (`events`)

Swimming events (races, competitions).

Key fields:

- `title` (localized), `description` (localized richText)
- `start`, `end`: event dates
- `distances`: array of distances in meters
- `category`: relationship to `categories`
- `hasTshirt`, `tshirtSizes`: optional merchandise
- `isRiver`: boolean (river vs pool)
- `address`: street, number, state, zipcode, country
- `tickets`: relationship to `tickets` (filtered to this event)
- `slug`

### Tickets (`tickets`)

Ticket types for events. Each ticket is tied to one event and one distance.

Key fields:

- `name` (localized), `price`, `distance` (meters)
- `start`, `end`: purchase window dates
- `eventFor`: relationship to `events`
- `canBePurchasedBy`: relationship to `group-categories` (hasMany) — restricts who can buy

### Carts (`carts`)

One cart per user, holds items before checkout.

Key fields:

- `user`: relationship to `users`
- `items`: array of `{ selectedTicket, selectedTshirtSize }`
- `totalPrice`: computed
- `eventKey`, `hasTshirt`: metadata

### Orders (`orders`)

Completed purchases. Created from cart on checkout.

Key fields:

- `user`: relationship to `users`
- `events`: array of `{ event, tickets: [{ ticket, tshirtSize, ticketPurchased, eventPurchaseId }] }`
- `total`: total amount paid
- `ticketPurchased`: admin marks when physically confirmed
- `eventPurchaseId`: dorsal number assigned by admin

### Subscription (`subscription`)

Tracks membership fee payments per user.

Key fields:

- `user`: relationship to `users`
- `type`: `memberFee` | `pool`
- `amount`, `startDate`, `endDate`
- `sibsTransactionId`: SIBS payment reference
- `paymentStatus`: `pending` | `paid` | `failed`

### Groups (`groups`)

Club groups (e.g. competitive team, masters, socio).

Key fields:

- `title` (localized), `badge` (media upload)
- `hasSubscription`: boolean
- `subscriptionPrice`, `subscriptionPeriod`: `monthly` | `yearly`
- `subscriptionForm`: relationship to `forms` (form-builder plugin)
- `slug`

### GroupSubscription (`group-subscription`)

Tracks a user's request to join a paid group.

Key fields:

- `group`: relationship to `groups`
- `user`: relationship to `users`
- `status`: `pending` | `approved` | `rejected`
- `transactionId`: SIBS transaction ID
- `submissionData`: array of `{ field, value }` from the group's form

### GroupCategories (`group-categories`)

Sub-categories within groups (e.g. age groups, levels). Used to restrict ticket purchasing.

### Pages (`pages`)

CMS-managed pages with layout builder. Supports visibility control per group.

### Posts (`posts`)

Blog posts with drafts, scheduling, authors, categories, SEO.

### Media (`media`)

Public media files stored on S3.

### UserMedia (`user-media`)

Private user uploads (identity documents, profile pictures) stored on S3.

### FederationHistory (`federation-history`)

Tracks changes to a user's `federationId` over time.

### Gender, Disability, AboutClub

Lookup collections synced from `GeneralConfigs` global via `updateCollections` hook.

---

## Globals

### GeneralConfigs (`generalConfigs`)

The main site configuration. Publicly readable.

Tabs:

- **userData**: configurable options for `genders`, `disabilities`, `aboutClub` (synced to their collections)
- **settings**:
  - `login.registerUrl`: page relationship for registration link
  - `fixedPages`: titles for cart, myProfile, subscription, payment, blog pages
  - `myProfile.useBadges`, `myProfile.avatar`
- **associationFees**:
  - `registrationFee`: one-time joining fee ("Jóia")
  - `monthlyFee`: recurring fee amount
  - `limitDate`: day of month cutoff for current-month payment
  - `periodicity`: `1` (monthly) | `3` (quarterly) | `12` (yearly)

### Header (`header`)

Logo, navigation items.

### Footer (`footer`)

Contact info (email, phone, WhatsApp), social media links, navigation.
