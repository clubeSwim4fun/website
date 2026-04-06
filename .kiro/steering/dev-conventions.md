---
inclusion: always
---

# Development Conventions

## Commands

```bash
pnpm dev
pnpm build                        # also runs next-sitemap
pnpm lint / pnpm lint:fix
pnpm payload generate:types       # run after ANY collection/global/field change
pnpm payload generate:importmap   # run after adding admin components
```

## Path Aliases

- `@/` → `src/`
- `@payload-config` → `src/payload.config.ts`
- Never use relative paths traversing more than one level up.

## Server Actions (`src/actions/`)

- Must have `'use server'` at top
- Start with `getMeUser()` to get current user
- Use `payload.db.beginTransaction()` for multi-step writes; always rollback on error
- Return `{ success: boolean, message: string, ...extras }`
- Use `getTranslations()` for all user-facing strings — no hardcoded English

## PayloadCMS

- New collection: create in `src/collections/`, add to `payload.config.ts`, run `generate:types`
- New global: create in `src/` (follow `GeneralConfigs/` pattern), add to `payload.config.ts`, run `generate:types`
- Fetch globals: use `getCachedGlobal()` from `src/utilities/getGlobals.ts`
- Access control: always import from `src/access/` — never inline
- Localized fields: add `localized: true` only to user-facing content (title, description) — not slugs, IDs, system fields

## Frontend

- Navigation: always import `Link`, `redirect`, `useRouter`, `usePathname` from `@/i18n/routing` — never from `next/navigation`
- Current user (server): `const { user } = await getMeUser()` or with `nullUserRedirect`
- Client components: must have `'use client'` + use `.client.tsx` naming convention
- Translations — server: `getTranslations({ locale, namespace })` | client: `useTranslations('Namespace')`
- Add new i18n keys to both `pt.json` and `en.json`
- Toasts: `useToast()` from `src/components/ui/use-toast.ts`

## Styling

- Tailwind only — no custom CSS except `globals.css`
- Conditional classes: `cn()` from `src/utilities/ui.ts`
- New shadcn components: `pnpm dlx shadcn@latest add <component>`

## Email

- Templates in `src/email/` using `@react-email/components`
- Always `render()` template before passing to `sendEmail()` from `src/helpers/emailHelper.ts`

## Known TODOs

- `createOrder` uses `payload.init()` instead of `getPayload()` (`src/actions/order.ts`)
- Order confirmation email `to` is hardcoded as empty string (`src/actions/order.ts`)
- `users` and `carts` read access needs tightening (any authenticated user can read all)
