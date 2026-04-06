# Missing Features — Swim4Fun Club Website

Mapped by comparing the original WordPress site (`clube-swim4fun.pt`) with the current PayloadCMS/Next.js implementation.

---

## 1. Event Detail Page — Missing Fields & UI ✅ DONE

### Fields missing from the `events` collection

| Field | Description | Priority | Status |
|---|---|---|---|
| `promoCode` | Discount code shown on the event (e.g. `SWIM4FUN_TROIA`) | Medium | ✅ Done |
| `memberDiscount` | Percentage discount for club members (e.g. "20% de desconto para sócios") | Medium | ✅ Done (display only) |
| `externalRegistrationUrl` | External link for registrations (e.g. `https://bit.ly/TroiaSwimrun2026`) | High | ✅ Done |
| `regulationUrl` | Link to the event regulation PDF/page — per distance category | Medium | ✅ Done (inside `distanceCategories[].regulationUrl`) |
| `location` | Named location — currently only raw address fields exist | Low | ❌ Not done |
| `image` | Event-specific hero image | High | ✅ Done |

### UI gaps on the event detail page

| Gap | Description | Status |
|---|---|---|
| Promo code display | Show the discount code and member discount badge prominently | ✅ Done |
| External registration link | "INSCRIÇÕES" button linking to external registration URL | ✅ Done |
| Regulation link | "REGULAMENTO" button/link per distance category | ✅ Done |
| Location name | Show named location (e.g. "Tróia, Grândola") not just raw address | ❌ Not done |
| Map embed | Original shows a map widget for the event location | ❌ Not done |
| Distance breakdown detail | Per-distance breakdown: total, swim, run, transitions, elevation, time limit | ✅ Done (`distanceCategories` array + `EventDistanceCategories` component) |
| Event image | Use a real uploaded image instead of static placeholders | ✅ Done |

---

## 2. Distance / Ticket Model — Structural Gap ✅ DONE

`distanceCategories[]` array added to `events` collection with all sub-fields (totalDistance, swimDistance, runDistance, transitions, longestSwim, longestRun, elevationGain, timeLimit, regulationUrl, registrationUrl). `EventDistanceCategories` component renders them on the event detail page.

---

## 3. Registration / Subscription Form

| Feature | Status |
|---|---|
| `externalRegistrationUrl` field on events — shows "INSCRIÇÕES" button instead of internal cart | ✅ Done |
| Optional embedded registration form per event | ❌ Not done |
| Waitlist functionality | ❌ Not done |
| Team/pair registration support | ❌ Not done |

---

## 4. Payment — ✅ Done

| Issue | Status |
|---|---|
| `createOrder` uses `payload.init()` instead of `getPayload()` | ✅ Fixed |
| Order confirmation email `to` field hardcoded as empty string | ✅ Fixed — uses `user?.email ?? ''` |

---

## 5. Member Discount Logic

- `memberDiscount` field exists on events and is displayed as a badge ✅
- No actual price calculation applying the discount — display only ❌
- `canBePurchasedBy` restricts access but doesn't apply discounts ❌

---

## 6. Event Listing Page

- Route `/event` now shows a calendar view (`CalendarBlock`) ✅
- No filtering by category, date, or location ❌
- No pagination ❌
- No "past events" vs "upcoming events" separation ❌
- No event image thumbnails in the listing ❌

---

## 7. Admin UX — Event Management

- No bulk ticket creation UI ❌
- No dorsal number assignment UI beyond manually editing each order ❌
- No participant list export per event ❌
- No capacity/limit field on tickets (no max attendees enforcement) ❌

---

## 8. Email Notifications

- Order confirmation email sent post-order-creation ✅ (`OrderConfirmationEmail` triggered in `createOrder`)
- Subscription confirmation email sent ✅ (`SubscriptionConfirmationEmail` triggered in `createSubscription`)
- Annual membership renewal email sent via `performAnnualReset()` ✅
- No reminder email before the event ❌
- No email when a ticket purchase window opens ❌

---

## 9. SEO / Structured Data

- No `Event` JSON-LD structured data on event detail pages ❌
- No Open Graph image per event (uses static fallback) ❌

---

## 10. Locations Collection (Nice to Have)

❌ Not done. Events still use a raw address group. No reusable `locations` collection.

---

## 11. Blog — Comments and Reactions

❌ Not done. No comments or reactions on blog posts.

---

## 12. Subscription Periodicity

- Subscription periodicity is configurable via `GeneralConfigs.associationFees.periodicity` (`1` | `3` | `12`) ✅
- Annual reset flow exists via `performAnnualReset()` admin action ✅
- The feature request to "change to annual" is covered by setting `periodicity: '12'` in the admin panel — no code change needed ✅

---

## 13. Newsletter Feature

❌ Not done. No newsletter collection, subscription form, or email broadcast capability.

---

## Summary — Priority Order

| # | Feature | Priority | Status |
|---|---|---|---|
| 1 | External registration URL on events | High | ✅ Done |
| 2 | Payment — order action refactor (`payload.init` → `getPayload`) | High | ❌ Open |
| 3 | Event image upload | High | ✅ Done |
| 4 | Distance detail breakdown per category | Medium | ✅ Done |
| 5 | Promo code + member discount display | Medium | ✅ Done (display only) |
| 6 | Member discount applied to prices | Medium | ❌ Open |
| 7 | Regulation URL per distance | Medium | ✅ Done |
| 8 | Event listing improvements (filter, pagination) | Medium | ❌ Open |
| 9 | Team/pair registration | Low | ❌ Open |
| 10 | Locations collection | Low | ❌ Open |
| 11 | Event JSON-LD structured data | Low | ❌ Open |
| 12 | Ticket capacity/limit | Low | ❌ Open |
| 13 | Admin participant export | Low | ❌ Open |
| 14 | Blog comments & reactions | Low | ❌ Open |
| 15 | Newsletter | Low | ❌ Open |
