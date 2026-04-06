---
inclusion: always
---

# Project Overview — Swim4Fun Club Website

Swimming club management site. Project: `clube-swim4fun`.

## Stack

- Next.js 15 (App Router, React 19) + PayloadCMS v3 (self-hosted, MongoDB)
- Storage: AWS S3 | Auth: PayloadCMS JWT (`payload-token` HTTP-only cookie)
- i18n: `next-intl` — `pt` (default), `en`
- Styling: Tailwind CSS + shadcn/ui | Email: Nodemailer + `@react-email/components`
- Payment: Stripe (card + MB Way) | Rate limiting: Upstash Redis | Package manager: pnpm

## Structure

```
src/
  app/(frontend)/[locale]/   # Public Next.js pages
  app/(payload)/             # PayloadCMS admin + API routes
  collections/               # Payload collection configs
  actions/                   # Server Actions ('use server')
  helpers/                   # Business logic
  access/                    # Payload access control functions
  components/                # React components
  blocks/                    # Layout builder blocks
  email/                     # React Email templates
  i18n/                      # Locale config + message files (pt.json, en.json)
  utilities/                 # Shared utilities
  GeneralConfigs/            # Global CMS config (fees, settings)
  Header/ Footer/            # Global header/footer CMS configs
lib/
  rate-limit.ts              # Upstash rate limiting
```
