---
inclusion: always
---

# Frontend Routes

All routes under `src/app/(frontend)/[locale]/`. Locales: `pt` (default), `en`.

## Public

| Route                                        | Notes                           |
| -------------------------------------------- | ------------------------------- |
| `/`                                          | Home, CMS-driven                |
| `/[slug]`                                    | Dynamic CMS pages               |
| `/sign-in`                                   | Login, supports `?callbackUrl=` |
| `/reset-password`                            | Password reset                  |
| `/posts`, `/posts/[slug]`, `/posts/page/[n]` | Blog                            |
| `/event/[slug]`                              | Event detail + ticket purchase  |
| `/search`                                    | Full-text search                |

## Authenticated (`(profileUser)` group — redirects to sign-in, enforces `status === 'active'`)

| Route                                | Notes                      |
| ------------------------------------ | -------------------------- |
| `/my-profile`                        | Profile view/edit          |
| `/subscription`                      | Pay membership fee         |
| `/subscription/order-generation`     | Subscription confirmation  |
| `/group-subscription/[slug]`         | Group join form            |
| `/group-subscription/[slug]/payment` | Group subscription payment |

## Cart & Checkout

| Route         | Notes                                |
| ------------- | ------------------------------------ |
| `/cart`       | Cart review + T-shirt size selection |
| `/payment`    | Event ticket payment (Stripe)        |
| `/order/[id]` | Order confirmation                   |

## Checkout Flows

```
Events:  /event/[slug] → /cart → /payment → /order/[id]
Members: /subscription → /subscription/order-generation → (Stripe)
Groups:  /group-subscription/[slug] → /group-subscription/[slug]/payment → (Stripe)
```

## Layout (`layout.tsx`)

Wraps all pages with: `NextIntlClientProvider`, `Header`, `Footer`, `AdminBar`, `Cart` drawer, `Toaster`, theme provider.

## Key Components

| Component       | Path                                      | Purpose                       |
| --------------- | ----------------------------------------- | ----------------------------- |
| `Cart`          | `src/components/Cart/`                    | Slide-out cart drawer         |
| `EventDetails`  | `src/components/EventDetails/`            | Event info + ticket UI        |
| `CheckoutSteps` | `src/components/Common/CheckoutSteps.tsx` | Step indicator                |
| `RichText`      | `src/components/RichText/`                | Lexical rich text renderer    |
| `AdminBar`      | `src/components/AdminBar/`                | Payload admin bar for editors |
