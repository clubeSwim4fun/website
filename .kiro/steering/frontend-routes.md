---
inclusion: always
---

# Frontend Routes & Pages

All frontend routes live under `src/app/(frontend)/[locale]/`. The `[locale]` segment is `pt` (default) or `en`.

## Public Routes

| Route                      | File                               | Notes                                |
| -------------------------- | ---------------------------------- | ------------------------------------ |
| `/`                        | `page.tsx`                         | Home page, CMS-driven                |
| `/[slug]`                  | `[slug]/page.tsx`                  | Dynamic CMS pages                    |
| `/sign-in`                 | `sign-in/page.tsx`                 | Login form, supports `?callbackUrl=` |
| `/reset-password`          | `reset-password/page.tsx`          | Password reset                       |
| `/posts`                   | `posts/page.tsx`                   | Blog listing                         |
| `/posts/[slug]`            | `posts/[slug]/page.tsx`            | Blog post detail                     |
| `/posts/page/[pageNumber]` | `posts/page/[pageNumber]/page.tsx` | Paginated blog                       |
| `/event/[slug]`            | `event/[slug]/page.tsx`            | Event detail + ticket purchase       |
| `/search`                  | `search/page.tsx`                  | Full-text search                     |

## Authenticated Routes (profileUser group)

These routes redirect to sign-in if user is not logged in. They also enforce `user.status === 'active'`.

| Route                                | File                                                       | Notes                            |
| ------------------------------------ | ---------------------------------------------------------- | -------------------------------- |
| `/my-profile`                        | `(profileUser)/my-profile/page.tsx`                        | User profile view/edit           |
| `/subscription`                      | `(profileUser)/subscription/page.tsx`                      | Pay membership fee               |
| `/subscription/order-generation`     | `(profileUser)/subscription/order-generation/page.tsx`     | Generates SIBS payment reference |
| `/group-subscription/[slug]`         | `(profileUser)/group-subscription/[slug]/page.tsx`         | Group join form                  |
| `/group-subscription/[slug]/payment` | `(profileUser)/group-subscription/[slug]/payment/page.tsx` | Group subscription payment       |

## Cart & Checkout Routes

| Route         | File                  | Notes                               |
| ------------- | --------------------- | ----------------------------------- |
| `/cart`       | `cart/page.tsx`       | Cart review, T-shirt size selection |
| `/payment`    | `payment/page.tsx`    | Event ticket payment (SIBS widget)  |
| `/order/[id]` | `order/[id]/page.tsx` | Order confirmation/detail           |

## Sitemap Routes

| Route                | Notes                          |
| -------------------- | ------------------------------ |
| `/pages-sitemap.xml` | Dynamic sitemap for CMS pages  |
| `/posts-sitemap.xml` | Dynamic sitemap for blog posts |

---

## Layout

`src/app/(frontend)/[locale]/layout.tsx` wraps all frontend pages with:

- `NextIntlClientProvider` for translations
- `Header` and `Footer` globals
- `AdminBar` (visible to admin/editor roles)
- `Cart` slide-out component
- `Toaster` for toast notifications
- Theme provider

---

## Key Components

| Component             | Path                                      | Purpose                          |
| --------------------- | ----------------------------------------- | -------------------------------- |
| `Cart`                | `src/components/Cart/`                    | Slide-out cart drawer            |
| `EventDetails`        | `src/components/EventDetails/`            | Event info + ticket purchase UI  |
| `EventHero`           | `src/heros/EventHero/`                    | Event page hero section          |
| `CheckoutSteps`       | `src/components/Common/CheckoutSteps.tsx` | Step indicator for checkout flow |
| `PayloadRedirects`    | `src/components/PayloadRedirects/`        | Handles CMS-managed redirects    |
| `RichText`            | `src/components/RichText/`                | Renders Lexical rich text        |
| `LivePreviewListener` | `src/components/LivePreviewListener/`     | Enables CMS live preview         |
| `AdminBar`            | `src/components/AdminBar/`                | Payload admin bar for editors    |

---

## i18n

- Default locale: `pt` (Portuguese)
- Supported: `pt`, `en`
- Translation files: `src/i18n/messages/pt.json`, `src/i18n/messages/en.json`
- Use `getTranslations()` (server) or `useTranslations()` (client) from `next-intl`
- Use `Link`, `redirect`, `useRouter`, `usePathname` from `src/i18n/routing.ts` (locale-aware wrappers), NOT from `next/navigation` directly

---

## Checkout Flow (Event Tickets)

```
/event/[slug]  →  add to cart  →  /cart  →  /payment  →  /order/[id]
```

## Checkout Flow (Membership)

```
/subscription  →  /subscription/order-generation  →  (SIBS widget)
```

## Checkout Flow (Group Subscription)

```
/group-subscription/[slug]  →  /group-subscription/[slug]/payment  →  (SIBS widget)
```
