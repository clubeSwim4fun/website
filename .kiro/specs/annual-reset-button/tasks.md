# Implementation Plan: Annual Reset Button

## Overview

Implement the Annual Reset Button feature for the Swim4Fun admin panel. The work is split into four incremental steps: email template, server action, UI components, and wiring the component into the Users collection config.

## Tasks

- [x] 1. Create the `MembershipRenewalEmail` template

  - [x] 1.1 Create `src/email/membershipRenewal.tsx`

    - Export an async `MembershipRenewalEmail({ user }: { user: User })` component
    - Wrap content in `TemplateEmail` (same pattern as `UserRegistration`)
    - Include the user's name and a `Button` linking to `${NEXT_PUBLIC_SERVER_URL}/${locale}/subscription`
    - Use `getTranslations` with namespace `Email` for all copy; add keys `MembershipRenewal.title`, `MembershipRenewal.description`, `MembershipRenewal.button` to both `src/i18n/messages/pt.json` and `src/i18n/messages/en.json`
    - _Requirements: 5.2, 5.3, 5.5_

  - [ ]\* 1.2 Write property test for `MembershipRenewalEmail` (Property 8)
    - **Property 8: Renewal email contains required content**
    - Use `fc.record({ name: fc.string(), surname: fc.string(), email: fc.emailAddress() })` to generate arbitrary user objects
    - Render the template with `render()` and assert the output contains the user's name and the subscription URL substring
    - **Validates: Requirements 5.2**

- [x] 2. Implement the `performAnnualReset` server action

  - [x] 2.1 Create `src/actions/annualReset.ts`

    - Add `'use server'` directive
    - Define and export `ResetResult = { success: boolean; message: string; updatedCount?: number }`
    - Verify caller role via `getMeUser()`; return `{ success: false, message: 'Forbidden' }` immediately if `role !== 'admin'`
    - Query `users` where `status in ['active', 'expired']` using `payload.find`
    - Begin a transaction with `payload.db.beginTransaction()`
    - Bulk-update all affected users' `status` to `pendingPayment` using `payload.db.updateMany` (bypasses `afterChange` hook to avoid double-emailing)
    - Commit the transaction; on any DB error rollback and return failure
    - After commit, iterate affected users and call `sendEmail` with a rendered `MembershipRenewalEmail`; log individual email failures via `payload.logger.error` but do not rollback
    - Return `{ success: true, updatedCount }`
    - _Requirements: 2.1, 2.2, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.3, 5.4_

  - [ ]\* 2.2 Write property test for non-admin rejection (Property 2)

    - **Property 2: Non-admin invocation is rejected without side effects**
    - Generate arbitrary non-admin roles (`fc.constantFrom('editor', 'default')`) and mock `getMeUser` to return that role
    - Call `performAnnualReset` and assert `success === false` and that `payload.db.updateMany` was never called
    - **Validates: Requirements 2.1, 2.2**

  - [ ]\* 2.3 Write property test for status partitioning (Property 5)

    - **Property 5: Reset correctly partitions users by status**
    - Generate a random dataset of users with mixed statuses using `fc.array(fc.record({ id: fc.uuid(), status: fc.constantFrom('active', 'expired', 'pendingAnalysis', 'pendingUpdate', 'pendingPayment') }))`
    - Mock `payload.find` and `payload.db.updateMany`; call the action; assert only `active`/`expired` users were passed to `updateMany` and others were untouched
    - **Validates: Requirements 4.2, 4.3**

  - [ ]\* 2.4 Write property test for returned count (Property 6)

    - **Property 6: Returned count equals the number of affected users**
    - Generate random user datasets; assert `updatedCount` equals the number of users whose status was `active` or `expired` before the call
    - **Validates: Requirements 4.4**

  - [ ]\* 2.5 Write property test for email send count (Property 7)
    - **Property 7: Renewal email is sent to every affected user**
    - Generate random sets of affected users; mock `sendEmail`; assert it was called exactly once per affected user
    - **Validates: Requirements 5.1**

- [ ] 3. Checkpoint — Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement the `ConfirmationDialog` component

  - [x] 4.1 Create `src/components/admin/AnnualReset/ConfirmationDialog.tsx`

    - `'use client'` component
    - Accept props: `open`, `onOpenChange`, `affectedCount`, `onConfirm`, `isLoading`
    - Use shadcn/ui `Dialog` primitives (already available)
    - Render a warning message that includes `affectedCount`
    - Render a text input; track its value in local state
    - Enable the confirm button only when input value === `'RESET'` (case-sensitive) AND `isLoading` is false
    - Show a loading spinner on the confirm button while `isLoading` is true
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.3_

  - [ ]\* 4.2 Write property test for confirm button enable/disable (Property 4)

    - **Property 4: Confirm button is enabled if and only if input matches the phrase**
    - Use `fc.string()` to generate arbitrary input strings; render `ConfirmationDialog` with `isLoading=false`; assert button is enabled iff value === `'RESET'`
    - **Validates: Requirements 3.3, 3.4**

  - [ ]\* 4.3 Write property test for loading state (Property 10)

    - **Property 10: Loading state disables the confirm button**
    - Use `fc.string()` with `isLoading=true`; assert confirm button is always disabled regardless of input value
    - **Validates: Requirements 6.3**

  - [ ]\* 4.4 Write property test for affected count display (Property 3)
    - **Property 3: Affected user count is shown in the dialog**
    - Use `fc.integer({ min: 0, max: 10000 })` to generate arbitrary counts; render the dialog; assert the rendered output contains that count
    - **Validates: Requirements 3.1, 3.2**

- [x] 5. Implement the `ResetButton` component

  - [x] 5.1 Create `src/components/admin/AnnualReset/ResetButton.tsx`

    - `'use client'` component
    - Use `useAuth()` from `@payloadcms/ui` to read the current user's role; return `null` if `role !== 'admin'`
    - On button click, fetch the count of `active`/`expired` users via `GET /api/users?where[status][in]=active,expired&limit=0`; on fetch error show an error toast and do not open the dialog
    - Manage `open`, `affectedCount`, and `isLoading` state
    - Render `ConfirmationDialog` with those props
    - On `onConfirm`, call `performAnnualReset()`; on success show a toast with the `updatedCount`; on failure show an error toast
    - After completion (success or error) close the dialog
    - Use `useToast()` from `@/components/ui/use-toast` for notifications
    - _Requirements: 1.1, 1.2, 1.3, 2.3, 3.5, 3.6, 6.1, 6.2, 6.4_

  - [ ]\* 5.2 Write property test for non-admin renders null (Property 1)

    - **Property 1: Non-admin role hides the Reset Button**
    - Use `fc.constantFrom('editor', 'default')` to generate non-admin roles; mock `useAuth()` to return that role; render `ResetButton`; assert the output is null / renders nothing
    - **Validates: Requirements 1.3, 2.3**

  - [ ]\* 5.3 Write property test for success notification count (Property 9)
    - **Property 9: Success notification shows the updated count**
    - Use `fc.integer({ min: 0, max: 10000 })` to generate arbitrary `updatedCount` values; mock `performAnnualReset` to return `{ success: true, updatedCount }`; assert the toast message contains that count
    - **Validates: Requirements 6.1**

- [x] 6. Register the component in the Users collection config and regenerate types

  - [x] 6.1 Add `beforeListTable` to `src/collections/Users/index.ts`

    - Add `components: { beforeListTable: ['src/components/admin/AnnualReset/ResetButton'] }` inside the `admin` block of the `Users` collection config
    - _Requirements: 1.1, 1.2_

  - [x] 6.2 Regenerate the Payload import map
    - Run `pnpm payload generate:importmap` so the new admin component path is registered
    - _Requirements: 1.1_

- [ ] 7. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `payload.db.updateMany` is used deliberately to bypass the existing `afterChange` hook on the `users` collection and avoid double-emailing affected users
- After any change to the Users collection config, run `pnpm payload generate:types` and `pnpm payload generate:importmap`
- Property tests use fast-check; each test runs a minimum of 100 iterations
- All i18n copy must be added to both `src/i18n/messages/pt.json` and `src/i18n/messages/en.json`
