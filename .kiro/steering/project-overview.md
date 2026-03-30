---
inclusion: always
---

# Project Overview — Swim4Fun Club Website

This is a **swimming club management website** built with **PayloadCMS v3** (headless CMS) and **Next.js 15** (App Router). The project name is `clube-swim4fun`.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **CMS**: PayloadCMS v3 (self-hosted, MongoDB)
- **Database**: MongoDB via Mongoose adapter
- **Storage**: AWS S3 (via `@payloadcms/storage-s3`)
- **Auth**: PayloadCMS built-in JWT auth (HTTP-only cookies, `payload-token`)
- **i18n**: `next-intl` — Portuguese (`pt`, default) and English (`en`)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Email**: Nodemailer + `@react-email/components` for templated emails
- **Payment**: Stripe (card, MB Way via Stripe Payment Element)
- **Rate Limiting**: Upstash Redis
- **Package Manager**: pnpm

## Purpose

Members of the swimming club can:

- Register and have their account approved by admins
- Pay membership fees (monthly/quarterly/yearly)
- Join groups (e.g. competitive team, masters) with optional paid subscriptions
- Browse and register for swimming events by purchasing tickets
- View their profile, orders, and subscription history

Admins/editors manage all of this through the PayloadCMS admin panel at `/admin`.

## Project Structure

```
src/
  app/
    (frontend)/[locale]/   # All public-facing Next.js pages
    (payload)/             # PayloadCMS admin and API routes
  collections/             # All PayloadCMS collection configs
  actions/                 # Next.js Server Actions
  helpers/                 # Business logic helpers
  access/                  # PayloadCMS access control functions
  components/              # React components
  heros/                   # Hero section components
  blocks/                  # Layout builder blocks
  email/                   # React Email templates
  i18n/                    # Locale config and message files
  plugins/                 # PayloadCMS plugin config
  utilities/               # Shared utilities
  helpers/                 # Domain helpers (cart, user, event, stripe, email)
  GeneralConfigs/          # Global CMS config (fees, settings)
  Header/ Footer/          # Global header/footer CMS configs
lib/
  rate-limit.ts            # Upstash rate limiting
```
