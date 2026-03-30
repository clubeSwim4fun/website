# Missing Features — Swim4Fun Club Website

Mapped by comparing the original WordPress site (`clube-swim4fun.pt`) with the current PayloadCMS/Next.js implementation.

---

## 1. Event Detail Page — Missing Fields & UI

### Fields missing from the `events` collection

| Field | Description | Priority |
|---|---|---|
| `promoCode` | Discount code shown on the event (e.g. `SWIM4FUN_TROIA`) | Medium |
| `memberDiscount` | Percentage discount for club members (e.g. "20% de desconto para sócios") | Medium |
| `externalRegistrationUrl` | External link for registrations (e.g. `https://bit.ly/TroiaSwimrun2026`) | High |
| `regulationUrl` | Link to the event regulation PDF/page (currently shows "Em breve") | Medium |
| `location` | Named location (e.g. "Tróia") — currently only raw address fields exist | Low |
| `image` | Event-specific hero image — currently uses static placeholder images | High |

### UI gaps on the event detail page

| Gap | Description |
|---|---|
| Promo code display | Show the discount code and member discount badge prominently |
| External registration link | "INSCRIÇÕES" button linking to external registration URL |
| Regulation link | "REGULAMENTO" button/link per distance category |
| Location name | Show named location (e.g. "Tróia, Grândola") not just raw address |
| Map embed | Original shows a map widget for the event location |
| Distance breakdown detail | Original shows per-distance breakdown: total, swim, run, transitions, elevation, time limit — our model only stores a single `distance` number per ticket |
| Event image | Use a real uploaded image instead of static placeholders |

---

## 2. Distance / Ticket Model — Structural Gap

The original event has **named distance categories** (STANDARD, SPRINT, EXPERIENCE), each with:
- Total distance
- Swim distance
- Run distance
- Number of transitions (swim + run)
- Longest swim segment
- Longest run segment
- Total elevation gain
- Time limit

Our current model stores only a flat `distance` (in meters) on each `Ticket`. This is insufficient for SwimRun-style events.

**Proposed solution:** Add a `distanceDetails` group or array to the `events` collection (or to `tickets`) with these sub-fields, or create a separate `distance-categories` collection that tickets reference.

---

## 3. Registration / Subscription Form

The original site links to an **external registration URL** (`https://bit.ly/TroiaSwimrun2026`). Our platform has a ticket purchase flow (cart → payment), but:

- No support for **external registration links** as an alternative to the internal cart
- No **subscription/registration form** embedded in the event page (like the `group-subscription` form pattern)
- No **waitlist** functionality
- No **team registration** (SwimRun is a pairs sport — registrations are typically for 2 people)

**Missing features:**
- [ ] `externalRegistrationUrl` field on events — when set, show an "INSCRIÇÕES" button instead of (or alongside) the internal ticket flow
- [ ] Optional embedded registration form per event (reuse the form-builder plugin already used for group subscriptions)
- [ ] Team/pair registration support

---

## 4. Payment — Open Items

- `createOrder` action uses `payload.init()` instead of `getPayload()` — needs refactoring
- Order confirmation email `to` field is hardcoded as empty string

---

## 5. Member Discount Logic

The original site advertises "20% de desconto para sócios Swim4fun". There is no discount/pricing logic in the current implementation:

- No `memberDiscount` field on events or tickets
- No price calculation that applies a discount based on `user.groups` membership
- The `canBePurchasedBy` field restricts access but doesn't apply discounts

---

## 6. Event Listing Page

The route `/event` exists (`src/app/(frontend)/[locale]/event/page.tsx`) but needs review:

- No filtering by category, date, or location
- No pagination
- No "past events" vs "upcoming events" separation
- No event image thumbnails in the listing

---

## 7. Admin UX — Event Management

- No bulk ticket creation UI (must create tickets one by one)
- No dorsal number assignment UI beyond manually editing each order
- No participant list export per event
- No capacity/limit field on tickets (no max attendees enforcement)

---

## 8. Email Notifications

- No email sent to user when their ticket order is confirmed after payment
  - `OrderConfirmationEmail` template exists but it's unclear if it's triggered post-payment or just post-order-creation
- No reminder email before the event
- No email when a ticket purchase window opens

---

## 9. SEO / Structured Data

- No `Event` JSON-LD structured data on event detail pages (important for Google search)
- No Open Graph image per event (uses static fallback)

---

## 10. Locations Collection (Nice to Have)

The original WordPress site has a `locations` taxonomy (e.g. `/locations/troia/`). Our model has a raw address group on each event. A reusable `locations` collection would allow:

- Consistent location names across events
- Map coordinates for embed
- Location-based filtering on the event listing

---

## Summary — Priority Order

| # | Feature | Priority |
|---|---|---|
| 1 | External registration URL on events | High |
| 2 | Payment — order action refactor (`payload.init` → `getPayload`) | High |
| 3 | Event image upload | High |
| 4 | Distance detail breakdown per category | Medium |
| 5 | Promo code + member discount | Medium |
| 6 | Regulation URL per distance | Medium |
| 7 | Event listing improvements (filter, pagination) | Medium |
| 8 | Team/pair registration | Low |
| 9 | Locations collection | Low |
| 10 | Event JSON-LD structured data | Low |
| 11 | Ticket capacity/limit | Low |
| 12 | Admin participant export | Low |
