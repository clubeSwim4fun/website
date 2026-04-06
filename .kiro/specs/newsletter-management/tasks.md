# Implementation Plan: Newsletter Management

## Overview

Implement newsletter management in the PayloadCMS admin panel: add email consent to users, create the `newsletters` collection, build the recipient resolver, send action, preview action, and React Email template.

## Tasks

- [x] 1. Add `emailNotificationsEnabled` field to the `users` collection

  - Add a `checkbox` field `emailNotificationsEnabled` with `defaultValue: false` to `src/collections/Users/Users.ts`, positioned in the sidebar
  - Add i18n labels to both `pt.json` and `en.json` (key: `emailNotificationsEnabled`)
  - Run `pnpm payload generate:types` after the field change
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]\* 1.1 Write property test for emailNotificationsEnabled persistence across status transitions

  - **Property 1: emailNotificationsEnabled persists across status transitions**
  - **Validates: Requirements 1.4**

- [x] 2. Create the `Newsletters` PayloadCMS collection

  - Create `src/collections/Newsletters/index.ts` with all fields from the design: `subject`, `content` (lexical richText), `status` (draft/sent), `sentAt`, `recipientCount`, `recipientFilter` group, `recipients` array
  - Apply access control: `create`/`update`/`delete` → `isAdmin`, `read` → `isAdminOrEditor`
  - Register the collection in `src/payload.config.ts`
  - Run `pnpm payload generate:types`
  - _Requirements: 2.1, 2.2, 2.3, 9.1, 9.2_

- [ ]\* 2.1 Write property test for draft round-trip field persistence

  - **Property 9: Draft round-trip persists all fields**
  - **Validates: Requirements 6.2**

- [x] 3. Implement `resolveRecipients()` helper

  - Create `src/helpers/newsletterHelper.ts` exporting `resolveRecipients(filter, payload)`
  - Query users matching any of: explicit `userIds`, `statuses`, `roles`, or `groups`/`group-categories` relationships
  - Deduplicate results by user ID
  - Apply consent gate: filter to `emailNotificationsEnabled === true` only
  - Return `ResolvedRecipient[]` (`{ userId, email }`)
  - Silently ignore invalid/non-existent IDs in the filter
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 10.2, 10.3_

- [ ]\* 3.1 Write property test for recipient filter union resolution

  - **Property 3: Recipient filter resolves correct union**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [ ]\* 3.2 Write property test for recipient deduplication

  - **Property 4: Recipient list is deduplicated**
  - **Validates: Requirements 3.4, 10.3**

- [ ]\* 3.3 Write property test for consent gate enforcement

  - **Property 5: Consent gate removes non-consented users and cannot be bypassed**
  - **Validates: Requirements 4.1, 4.2**

- [ ]\* 3.4 Write property test for invalid filter references being ignored

  - **Property 13: Invalid filter references are ignored gracefully**
  - **Validates: Requirements 10.2**

- [x] 4. Create the `NewsletterEmail` React Email template

  - Create `src/email/newsletter.tsx` exporting `NewsletterEmail({ subject, contentHtml })`
  - Wrap content in `TemplateEmail` from `src/email/template.tsx`, passing `subject` as `title`
  - Render `contentHtml` via `dangerouslySetInnerHTML` (already supported by `TemplateEmail` when children is a string)
  - _Requirements: 8.1, 8.2_

- [ ]\* 4.1 Write property test for template rendering subject and content

  - **Property 10: Newsletter template renders subject and content in HTML output**
  - **Validates: Requirements 7.1, 8.1**

- [x] 5. Implement `sendNewsletter()` and `previewNewsletter()` server actions

  - Create `src/actions/newsletter.ts` with `'use server'`
  - `sendNewsletter(newsletterId)`:
    - Call `getMeUser()`, verify `role === 'admin'`, return 401 otherwise
    - Fetch newsletter doc; reject if `status === 'sent'` or `subject` is empty
    - Call `resolveRecipients()`; abort if result is empty
    - Convert `content` lexical to HTML using `convertLexicalToHTML` from `@payloadcms/richtext-lexical`; abort on conversion failure
    - For each recipient: `render(NewsletterEmail)`, call `sendEmail()`, log failures by `userId` only (never email), continue on error
    - Update doc: `status: 'sent'`, `sentAt`, `recipientCount`, populate `recipients[]`
    - Return `{ success, message }`
  - `previewNewsletter(newsletterId)`:
    - Verify `role === 'admin'`
    - Convert lexical to HTML, render `NewsletterEmail`, call `resolveRecipients()` for count
    - Return `{ html, estimatedCount }` without sending any emails
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 9.3, 10.1, 10.4_

- [ ]\* 5.1 Write property test for send operation setting sentAt and recipientCount

  - **Property 2: Send operation sets sentAt and recipientCount**
  - **Validates: Requirements 2.4, 5.4**

- [ ]\* 5.2 Write property test for sendEmail() call count matching consented recipients

  - **Property 6: Send pipeline invokes sendEmail() exactly once per consented recipient**
  - **Validates: Requirements 5.2**

- [ ]\* 5.3 Write property test for send resilience on partial failures

  - **Property 7: Send resilience — individual failure does not stop remaining deliveries**
  - **Validates: Requirements 5.3**

- [ ]\* 5.4 Write property test for re-send rejection

  - **Property 8: Re-sending an already-sent newsletter is rejected**
  - **Validates: Requirements 5.5**

- [ ]\* 5.5 Write property test for non-admin rejection

  - **Property 12: Non-admin users are rejected by the send action**
  - **Validates: Requirements 9.3**

- [ ]\* 5.6 Write property test for preview estimated count accuracy

  - **Property 14: Preview estimated count matches consented users**
  - **Validates: Requirements 7.3**

- [ ]\* 5.7 Write property test for lexical-to-HTML conversion

  - **Property 11: Lexical rich-text converts to valid HTML**
  - **Validates: Requirements 8.3**

- [x] 6. Checkpoint — Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Wire send action to the Payload admin UI via a custom endpoint

  - Create a custom Payload endpoint (e.g. `POST /api/newsletters/:id/send`) in `src/collections/Newsletters/index.ts` that calls `sendNewsletter(id)` and returns the result
  - Create a custom Payload endpoint `GET /api/newsletters/:id/preview` that calls `previewNewsletter(id)` and returns `{ html, estimatedCount }`
  - Run `pnpm payload generate:importmap` if any admin components are added
  - _Requirements: 5.1, 5.2, 7.1, 7.2, 7.3_

- [x] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests use [fast-check](https://github.com/dubzzz/fast-check), minimum 100 iterations each
- `pnpm payload generate:types` must be run after tasks 1 and 2
- The consent gate (task 3) is unconditional — no admin action can bypass it
- `sendEmail()` failures are logged with `{ newsletterId, userId }` only — never the recipient email
