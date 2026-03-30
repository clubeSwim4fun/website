---
inclusion: always
---

# Development Conventions

## Commands

```bash
pnpm dev                    # Start dev server
pnpm build                  # Production build (also runs next-sitemap)
pnpm lint                   # ESLint
pnpm lint:fix               # ESLint with auto-fix
pnpm payload generate:types # Regenerate payload-types.ts after collection changes
pnpm payload generate:importmap # Regenerate import map after adding admin components
```

> After any change to a PayloadCMS collection, global, or field, run `pnpm payload generate:types` to keep `src/payload-types.ts` in sync.

## Path Aliases

Configured in `tsconfig.json`:

- `@/` → `src/`
- `@payload-config` → `src/payload.config.ts`

Always use `@/` imports, never relative paths that traverse up more than one level.

## Server Actions

All server actions live in `src/actions/` and must have `'use server'` at the top.

Conventions:

- Always get the current user via `getMeUser()` at the start
- Use `payload.db.beginTransaction()` for multi-step writes, always rollback on error
- Return a typed response object `{ success: boolean, message: string, ...extras }`
- Use `getTranslations()` for user-facing error messages (never hardcode English strings)

## PayloadCMS Patterns

### Adding a new collection

1. Create the config in `src/collections/`
2. Import and add it to the `collections` array in `src/payload.config.ts`
3. Run `pnpm payload generate:types`

### Adding a new global

1. Create the config in `src/` (follow `GeneralConfigs/` pattern)
2. Import and add it to the `globals` array in `src/payload.config.ts`
3. Run `pnpm payload generate:types`

### Fetching globals on the frontend

Use `getCachedGlobal()` from `src/utilities/getGlobals.ts` — it uses Next.js `cache()` for ISR:

```ts
const config = (await getCachedGlobal(
  'generalConfigs',
  1,
  locale as TypedLocale,
)()) as GeneralConfig
```

### Access control

Always import from `src/access/` — never inline access logic in collection configs.

### Localized fields

Add `localized: true` to any field that needs translation. The CMS handles the rest.
Only localize user-facing content fields (title, description, etc.), not IDs, slugs, or system fields.

## Frontend Patterns

### Navigation

Always use locale-aware navigation from `src/i18n/routing.ts`:

```ts
import { Link, redirect, useRouter, usePathname } from '@/i18n/routing'
```

Never import these from `next/navigation` directly.

### Getting the current user (server components)

```ts
const { user } = await getMeUser()
// or with redirect:
const { user } = await getMeUser({ nullUserRedirect: `/${locale}/sign-in` })
```

### Client components

Files that use hooks or browser APIs must have `'use client'` and follow the `.client.tsx` naming convention (e.g. `page.client.tsx`).

### Translations

Server components:

```ts
const t = await getTranslations({ locale, namespace: 'MyNamespace' })
```

Client components:

```ts
const t = useTranslations('MyNamespace')
```

Add new keys to both `src/i18n/messages/pt.json` and `src/i18n/messages/en.json`.

### Toast notifications

Use the `useToast()` hook from `src/components/ui/use-toast.ts` for user feedback.

## Email

Email templates live in `src/email/` and use `@react-email/components`.
Send via `sendEmail()` from `src/helpers/emailHelper.ts`.
Always render templates with `render()` from `@react-email/components` before passing to `sendEmail`.

## Styling

- Tailwind CSS utility classes only — no custom CSS files except `globals.css`
- Use `cn()` from `src/utilities/ui.ts` for conditional class merging (wraps `clsx` + `tailwind-merge`)
- shadcn/ui components live in `src/components/ui/` — add new ones via `pnpm dlx shadcn@latest add <component>`
- `components.json` configures shadcn/ui

## Environment Variables

Key variables (see `.env` for full list):

```
DATABASE_URI=              # MongoDB connection string
PAYLOAD_SECRET=            # PayloadCMS secret
NEXT_PUBLIC_SERVER_URL=    # Public URL (used for API calls)
S3_BUCKET=                 # AWS S3 bucket name
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
SMTP_HOST=                 # Nodemailer SMTP
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SIBS_TERMINAL_ID=          # SIBS payment gateway
SIBS_PAYMENT_METHODS=
UPSTASH_REDIS_REST_URL=    # Rate limiting
UPSTASH_REDIS_REST_TOKEN=
```

## Docker

`Dockerfile` and `docker-compose.yml` are present for containerized deployment.
Build: `docker compose up --build`

## Known TODOs / Open Work

- Payment confirmation webhooks not implemented (SIBS callback not wired)
- Stripe integration planned — see `payments-and-subscriptions.md`
- `users` and `carts` read access needs tightening (currently any authenticated user can read all)
- `createOrder` action uses `payload.init()` instead of `getPayload()` — should be refactored
- Some pages may need additional status checks beyond just `authenticated`
