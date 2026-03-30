---
inclusion: always
---

# Authentication & Access Control

## Auth System

PayloadCMS built-in JWT auth on the `users` collection.

- Token stored in HTTP-only cookie: `payload-token`
- Login/logout via server actions in `src/actions/login.ts` and `src/actions/logout.ts`
- Current user fetched via `getMeUser()` in `src/utilities/getMeUser.ts`
  - Caches user for 5 minutes (module-level cache, keyed by token)
  - Cache is cleared on logout or token mismatch
  - Accepts `nullUserRedirect` and `validUserRedirect` for route protection

## User Status Workflow

New users start at `pendingAnalysis`. Admin reviews and moves them through:

```
pendingAnalysis
  → pendingUpdate    (admin requests corrections, email sent to user)
  → pendingPayment   (admin approves data, user must pay membership fee, email sent)
  → active           (payment confirmed)
  → expired          (membership lapsed)
```

- `verifyUserStatus()` in `src/helpers/userHelper.ts` is called on every login to enforce status-based redirects
- Users with non-active status are blocked from protected routes

## Roles

Stored in `user.role`, saved to JWT:

- `admin`: full access to everything
- `editor`: can manage content, read users, cannot delete
- `default`: regular club member

## Access Control Functions (`src/access/`)

| Function                   | Logic                                                |
| -------------------------- | ---------------------------------------------------- |
| `anyone`                   | Always `true` — public access                        |
| `authenticated`            | User must be logged in                               |
| `isAdmin`                  | `user.role === 'admin'`                              |
| `isAdminOrEditor`          | `role === 'admin' \|\| role === 'editor'`            |
| `isAdminOrSelfOrPublished` | Admin sees all; user sees own; public sees published |
| `isAdminEditorOrPublished` | Editor sees all; public sees published               |
| `associated`               | User must be in the `socio` group                    |

## Collection Access Summary

| Collection         | create          | read                     | update          | delete          |
| ------------------ | --------------- | ------------------------ | --------------- | --------------- |
| users              | anyone          | authenticated            | authenticated   | isAdmin         |
| events             | isAdminOrEditor | anyone                   | isAdminOrEditor | isAdminOrEditor |
| tickets            | isAdminOrEditor | anyone                   | isAdminOrEditor | isAdminOrEditor |
| carts              | authenticated   | authenticated            | authenticated   | isAdmin         |
| orders             | authenticated   | authenticated            | authenticated   | isAdmin         |
| groups             | isAdmin         | isAdminOrEditor          | isAdmin         | isAdmin         |
| group-subscription | (via action)    | authenticated            | authenticated   | —               |
| subscription       | (via action)    | authenticated            | authenticated   | —               |
| pages              | isAdminOrEditor | (custom)                 | isAdminOrEditor | isAdminOrEditor |
| posts              | isAdminOrEditor | isAdminEditorOrPublished | isAdminOrEditor | isAdminOrEditor |

## Route Protection

Protected frontend routes live under `src/app/(frontend)/[locale]/(profileUser)/`:

- `/my-profile`
- `/subscription` and `/subscription/order-generation`
- `/group-subscription/[slug]` and its `/payment` sub-route

These pages call `getMeUser({ nullUserRedirect: '...' })` to redirect unauthenticated users.

## i18n Middleware

`src/middleware.ts` uses `next-intl` middleware for locale routing. It does NOT handle auth — auth is enforced at the page/component level via `getMeUser()`.

Middleware matcher excludes: `/api`, `/_next`, `/_vercel`, `/admin`, and files with extensions.

## Known Security TODOs in Code

- `users` read access is `authenticated` but noted as needing tightening (accessible via Postman)
- `carts` read access has the same note
- Payment gateway integration is complete — Stripe handles all payment flows via webhook
