---
inclusion: always
---

# Authentication & Access Control

## Auth

- JWT via PayloadCMS, stored in HTTP-only cookie `payload-token`
- Login/logout: `src/actions/login.ts`, `src/actions/logout.ts`
- Current user: `getMeUser()` from `src/utilities/getMeUser.ts` (5-min module-level cache, keyed by token)
- Middleware (`src/middleware.ts`): handles locale routing only — auth is enforced at page level via `getMeUser()`

## User Status Flow

```
pendingAnalysis → pendingUpdate (email sent) → pendingPayment (email sent) → active → expired
```

- `verifyUserStatus()` in `src/helpers/userHelper.ts` enforces status-based redirects on login
- Non-active users are blocked from `(profileUser)` routes

## Roles (stored in JWT)

- `admin`: full access | `editor`: manage content, read users, no delete | `default`: club member

## Access Functions (`src/access/`)

| Function                   | Logic                                 |
| -------------------------- | ------------------------------------- |
| `anyone`                   | always true                           |
| `authenticated`            | logged in                             |
| `isAdmin`                  | `role === 'admin'`                    |
| `isAdminOrEditor`          | admin or editor                       |
| `isAdminOrSelfOrPublished` | admin all; user own; public published |
| `isAdminEditorOrPublished` | editor all; public published          |
| `associated`               | user in `socio` group                 |

## Collection Access

| Collection                        | create          | read                     | update          | delete          |
| --------------------------------- | --------------- | ------------------------ | --------------- | --------------- |
| users                             | anyone          | authenticated            | authenticated   | isAdmin         |
| events / tickets                  | isAdminOrEditor | anyone                   | isAdminOrEditor | isAdminOrEditor |
| carts / orders                    | authenticated   | authenticated            | authenticated   | isAdmin         |
| groups                            | isAdmin         | isAdminOrEditor          | isAdmin         | isAdmin         |
| group-subscription / subscription | via action      | authenticated            | authenticated   | —               |
| pages                             | isAdminOrEditor | custom                   | isAdminOrEditor | isAdminOrEditor |
| posts                             | isAdminOrEditor | isAdminEditorOrPublished | isAdminOrEditor | isAdminOrEditor |

## Protected Routes

Under `src/app/(frontend)/[locale]/(profileUser)/` — call `getMeUser({ nullUserRedirect: '...' })`:

- `/my-profile`, `/subscription`, `/subscription/order-generation`
- `/group-subscription/[slug]`, `/group-subscription/[slug]/payment`

## Known TODOs

- `users` and `carts` read access is `authenticated` but needs tightening (accessible via Postman)
