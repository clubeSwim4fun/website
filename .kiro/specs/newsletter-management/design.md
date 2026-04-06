# Design Document — Newsletter Management

## Overview

Newsletter management for the Swim4Fun club admin panel. Admins compose newsletters with a subject and Payload lexical rich-text body, target recipients via a filter (status, role, groups, or explicit user IDs), and send via the existing `sendEmail()` helper. GDPR consent is enforced unconditionally at the system level: only users with `emailNotificationsEnabled: true` receive emails, regardless of filter configuration.

The feature lives entirely in the PayloadCMS admin panel — no new frontend routes. It adds:

- A `emailNotificationsEnabled` checkbox to the `users` collection
- A new `newsletters` PayloadCMS collection
- A `sendNewsletter` server action
- A `NewsletterEmail` React Email template
- A `resolveRecipients` helper for filter + consent logic

---

## Architecture

```mermaid
flowchart TD
    Admin["Admin (Payload UI)"] -->|compose + save| NewsletterDoc["newsletters collection\n(MongoDB)"]
    Admin -->|send action| SendAction["sendNewsletter()\nsrc/actions/newsletter.ts"]
    SendAction -->|resolveRecipients()| FilterHelper["src/helpers/newsletterHelper.ts\nresolveRecipients()"]
    FilterHelper -->|query users| MongoDB[(MongoDB)]
    FilterHelper -->|apply consent gate| ConsentGate["emailNotificationsEnabled === true"]
    SendAction -->|render template| EmailTemplate["NewsletterEmail\nsrc/email/newsletter.tsx"]
    SendAction -->|per recipient| SendEmail["sendEmail()\nsrc/helpers/emailHelper.ts"]
    SendAction -->|update doc| NewsletterDoc
```

The send flow is:

1. Admin triggers send from Payload admin UI (custom endpoint or server action)
2. `sendNewsletter()` validates the newsletter is not already sent and subject is non-empty
3. `resolveRecipients()` queries MongoDB for matching users, deduplicates, applies consent gate
4. If zero eligible recipients → abort with error
5. For each recipient: render `NewsletterEmail`, call `sendEmail()`, log failures by user ID only
6. Update newsletter document: `status: 'sent'`, `sentAt`, `recipientCount`, populate `recipients[]`

---

## Components and Interfaces

### `src/collections/Newsletters/index.ts`

PayloadCMS collection config for `newsletters`. Registered in `payload.config.ts`.

### `src/helpers/newsletterHelper.ts`

```ts
export async function resolveRecipients(
  filter: RecipientFilter,
  payload: Payload,
): Promise<ResolvedRecipient[]>
// Returns deduplicated list of { userId, email } for users matching filter AND emailNotificationsEnabled === true
```

### `src/actions/newsletter.ts`

```ts
'use server'
export async function sendNewsletter(newsletterId: string): Promise<ActionResponse>
export async function previewNewsletter(newsletterId: string): Promise<PreviewResponse>
// previewResponse: { html: string, estimatedCount: number }
```

### `src/email/newsletter.tsx`

```ts
export async function NewsletterEmail({
  subject,
  contentHtml,
}: {
  subject: string
  contentHtml: string // pre-converted from lexical
}): Promise<JSX.Element>
// Wraps content in TemplateEmail layout
```

### Lexical → HTML conversion

Uses `@payloadcms/richtext-lexical`'s `convertLexicalToHTML()` (or the `consolidateHTMLConverters` + `convertLexicalToHTML` utilities from the package) to convert the stored lexical JSON to an HTML string before passing to the email template.

---

## Data Models

### `users` collection — new field

```ts
{
  name: 'emailNotificationsEnabled',
  type: 'checkbox',
  defaultValue: false,
  label: { en: 'Email notifications', pt: 'Notificações por email' },
  admin: { position: 'sidebar' },
}
```

### `newsletters` collection

```ts
{
  slug: 'newsletters',
  fields: [
    { name: 'subject', type: 'text', required: true },
    { name: 'content', type: 'richText' },  // Payload lexical
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: ['draft', 'sent'],
    },
    { name: 'sentAt', type: 'date' },
    { name: 'recipientCount', type: 'number' },
    {
      name: 'recipientFilter',
      type: 'group',
      fields: [
        { name: 'userIds', type: 'relationship', relationTo: 'users', hasMany: true },
        {
          name: 'statuses',
          type: 'select',
          hasMany: true,
          options: ['pendingAnalysis','pendingUpdate','pendingPayment','active','expired'],
        },
        {
          name: 'roles',
          type: 'select',
          hasMany: true,
          options: ['admin', 'editor', 'default'],
        },
        {
          name: 'groups',
          type: 'relationship',
          relationTo: ['groups', 'group-categories'],
          hasMany: true,
        },
      ],
    },
    {
      name: 'recipients',
      type: 'array',
      fields: [
        { name: 'user', type: 'relationship', relationTo: 'users' },
        { name: 'email', type: 'text' },   // snapshot at send time
        { name: 'deliveredAt', type: 'date' },
      ],
    },
  ],
}
```

### `ResolvedRecipient` (internal type)

```ts
type ResolvedRecipient = {
  userId: string
  email: string
}
```

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: emailNotificationsEnabled persists across status transitions

_For any_ user with any value of `emailNotificationsEnabled`, transitioning that user through any sequence of status values (`pendingAnalysis`, `pendingUpdate`, `pendingPayment`, `active`, `expired`) SHALL leave `emailNotificationsEnabled` unchanged.

**Validates: Requirements 1.4**

---

### Property 2: Send operation sets sentAt and recipientCount

_For any_ newsletter that is successfully sent to a non-empty recipient list, the resulting document SHALL have `status: 'sent'`, a non-null `sentAt` timestamp, and `recipientCount` equal to the number of recipients for whom `sendEmail()` was invoked.

**Validates: Requirements 2.4, 5.4**

---

### Property 3: Recipient filter resolves correct union

_For any_ combination of `userIds`, `statuses`, `roles`, and `groups` filter criteria applied to any user dataset, `resolveRecipients()` SHALL return exactly the set of users that match at least one criterion — no more, no fewer (before consent gate).

**Validates: Requirements 3.1, 3.2, 3.3**

---

### Property 4: Recipient list is deduplicated

_For any_ filter configuration where a user matches multiple criteria simultaneously, that user SHALL appear exactly once in the resolved recipient list.

**Validates: Requirements 3.4, 10.3**

---

### Property 5: Consent gate removes non-consented users and cannot be bypassed

_For any_ resolved recipient list (including lists where non-consented users are explicitly named in `userIds`), after the consent gate is applied, no user with `emailNotificationsEnabled !== true` SHALL appear in the final delivery list.

**Validates: Requirements 4.1, 4.2**

---

### Property 6: Send pipeline invokes sendEmail() exactly once per consented recipient

_For any_ newsletter send operation with any filter configuration and any user dataset, the number of `sendEmail()` invocations SHALL equal the number of users who pass both the recipient filter and the consent gate.

**Validates: Requirements 5.2**

---

### Property 7: Send resilience — individual failure does not stop remaining deliveries

_For any_ recipient list where a random subset of `sendEmail()` calls fail, the remaining recipients (those whose calls do not fail) SHALL still receive the email, and `recipientCount` SHALL reflect the total number of attempted deliveries.

**Validates: Requirements 5.3**

---

### Property 8: Re-sending an already-sent newsletter is rejected

_For any_ newsletter document with `status: 'sent'`, invoking `sendNewsletter()` SHALL return an error and SHALL NOT modify the document or send any emails.

**Validates: Requirements 5.5**

---

### Property 9: Draft round-trip persists all fields

_For any_ newsletter draft with any combination of `subject`, `content`, and `recipientFilter` values, saving and then reading the document SHALL return identical field values.

**Validates: Requirements 6.2**

---

### Property 10: Newsletter template renders subject and content in HTML output

_For any_ newsletter `subject` string and `contentHtml` string, rendering `NewsletterEmail` SHALL produce an HTML string that contains both the subject text and the content HTML, wrapped in the `TemplateEmail` layout.

**Validates: Requirements 7.1, 8.1**

---

### Property 11: Lexical rich-text converts to valid HTML

_For any_ valid Payload lexical document stored in `content`, the lexical-to-HTML conversion SHALL produce a non-empty, well-formed HTML string that preserves the text content of all leaf nodes.

**Validates: Requirements 8.3**

---

### Property 12: Non-admin users are rejected by the send action

_For any_ user whose `role` is not `'admin'`, invoking `sendNewsletter()` SHALL return an unauthorized error without sending any emails or modifying any documents.

**Validates: Requirements 9.3**

---

### Property 13: Invalid filter references are ignored gracefully

_For any_ `recipientFilter` containing a mix of valid and non-existent user IDs, group IDs, or group-category IDs, `resolveRecipients()` SHALL return only the users that correspond to valid references, without throwing an error.

**Validates: Requirements 10.2**

---

### Property 14: Preview estimated count matches consented users

_For any_ `recipientFilter` and user dataset, the `estimatedCount` returned by `previewNewsletter()` SHALL equal the number of users who pass both the filter and the consent gate.

**Validates: Requirements 7.3**

---

## Error Handling

| Scenario                                    | Behaviour                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| `subject` is empty on send                  | Return validation error, abort — no emails sent, no status change        |
| Zero eligible recipients after consent gate | Return descriptive error, abort — no `recipients[]` records created      |
| Newsletter already has `status: 'sent'`     | Return "already sent" error, no-op                                       |
| Caller is not `role: 'admin'`               | Return 401 unauthorized                                                  |
| `sendEmail()` throws for a recipient        | Log `{ newsletterId, userId }` (never email), continue to next recipient |
| Invalid IDs in `recipientFilter`            | Silently ignore, continue resolving valid references                     |
| Lexical-to-HTML conversion fails            | Log error, abort send — do not send malformed emails                     |

All errors from `sendNewsletter()` follow the existing `{ success: boolean, message: string }` action response shape.

---

## Testing Strategy

### Unit / Example tests

- Registration form renders `emailNotificationsEnabled` checkbox unchecked by default
- Profile form allows toggling `emailNotificationsEnabled`
- Draft save does not call `sendEmail()`
- Preview does not call `sendEmail()`
- Template includes `cid:logo` in rendered output
- Empty subject triggers validation error
- Empty recipient list after consent gate triggers abort error

### Property-based tests (using [fast-check](https://github.com/dubzzz/fast-check), minimum 100 iterations each)

Each test is tagged: `Feature: newsletter-management, Property N: <property text>`

| Property                                    | What varies                               | What's verified                      |
| ------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| P1: emailNotificationsEnabled persists      | user data, status sequence                | field unchanged after transitions    |
| P2: sentAt and recipientCount set correctly | newsletter content, recipient count       | doc fields match post-send           |
| P3: Filter resolves correct union           | user dataset, filter combos               | result = correct union               |
| P4: Deduplication                           | users matching multiple criteria          | each user appears once               |
| P5: Consent gate                            | mixed consent user sets, explicit userIds | no non-consented user in output      |
| P6: sendEmail() call count                  | filter + user dataset                     | calls = consented recipient count    |
| P7: Send resilience                         | random failure subsets                    | non-failing recipients still receive |
| P8: Re-send rejection                       | any sent newsletter                       | error returned, no side effects      |
| P9: Draft round-trip                        | random newsletter content                 | saved = read back                    |
| P10: Template renders subject + content     | random subjects + HTML content            | both present in output               |
| P11: Lexical to HTML                        | random lexical documents                  | valid HTML, text preserved           |
| P12: Non-admin rejection                    | users with non-admin roles                | unauthorized error                   |
| P13: Invalid references ignored             | mixed valid/invalid IDs                   | only valid users returned            |
| P14: Preview count accuracy                 | filter + user dataset                     | estimatedCount = consented matches   |

### Integration tests

- Access control: non-admin cannot create/update/delete newsletters (SMOKE)
- Access control: editor can read newsletters, default user cannot (SMOKE)
- `emailNotificationsEnabled` field exists with `defaultValue: false` (SMOKE)
- Newsletter collection schema has all required fields (SMOKE)
