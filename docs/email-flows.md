# Email Flows — Swim4Fun

This document covers all email flows in the project: the form builder's configurable email feature and all hardcoded backend email flows.

---

## 1. Form Builder — Configurable Emails

### How it works

The form builder plugin (`@payloadcms/plugin-form-builder`) lets admins configure emails directly in the CMS admin panel under any **Form** document, in the **Emails** tab.

Each email entry has:

| Field       | Description                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| Email To    | Recipient address. Supports `{fieldName}` placeholders and the special `{email}` wildcard.  |
| CC / BCC    | Optional extra recipients                                                                   |
| Reply To    | Optional reply-to address                                                                   |
| Email From  | Sender address (e.g. `"Swim4Fun" <noreply@clube-swim4fun.pt>`)                              |
| Subject     | Email subject. Supports `{fieldName}` placeholders.                                         |
| Message     | Email body (rich text). Supports `{fieldName}` placeholders and `{*table}` for all fields. |

### Field placeholder syntax

Wrap any form field's `name` in double curly braces to inject its submitted value:

```
Hello {firstName}, your registration number is {registrationNumber}.
```

Use `{*table}` to output **all submitted fields** as an HTML table in the message body.

### Special placeholder: `{email}`

In the **Email To** field, use `{email}` to dynamically send the email to the address the user typed into the form's email field:

```
{email}
```

This is resolved in the `beforeEmail` hook in `src/plugins/index.ts` before the email is dispatched.

### Processing pipeline (`src/plugins/index.ts` — `beforeEmail` hook)

1. For each configured email on the form:
   - If `email.to` contains `{email}`, it is replaced with `submissionData.email.value`
   - `replaceFields()` (`src/helpers/emailHelper.ts`) substitutes all `{fieldName}` tokens in the HTML body with the corresponding submitted values
   - The resulting HTML is wrapped in `TemplateEmail` (the shared email wrapper with logo) via `@react-email/components`
2. The processed emails are returned to the plugin, which sends them via Payload's `sendEmail` (Nodemailer SMTP)

### Sample form configuration

Imagine a **Contact Form** with these fields:

| Field name    | Type  | Label         |
| ------------- | ----- | ------------- |
| `firstName`   | text  | First Name    |
| `email`       | email | Email Address |
| `message`     | text  | Message       |

**Email 1 — notify the club**

| Setting   | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Email To  | `contact@clube-swim4fun.pt`                                           |
| Subject   | `New contact from {firstName}`                                        |
| Message   | `{*table}` *(outputs all fields as a table)*                          |

**Email 2 — auto-reply to the submitter**

| Setting   | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Email To  | `{email}` *(resolved to the value of the `email` field)*              |
| Subject   | `We received your message, {firstName}!`                              |
| Message   | `Hi {firstName}, thanks for reaching out. We'll reply shortly.`       |

### Sample submitted data

```json
{
  "firstName": "João",
  "email": "joao@example.com",
  "message": "I'd like to know more about the masters group."
}
```

**Resulting email to the club:**
- To: `contact@clube-swim4fun.pt`
- Subject: `New contact from João`
- Body: HTML table with all three fields

**Resulting auto-reply to the user:**
- To: `joao@example.com`
- Subject: `We received your message, João!`
- Body: `Hi João, thanks for reaching out. We'll reply shortly.`

---

## 2. Hardcoded Backend Email Flows

These emails are sent automatically by the backend without any CMS configuration needed. SMTP must be configured via environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) but no additional setup is required per-flow.

All emails use `sendEmail()` from `src/helpers/emailHelper.ts`, which attaches the club logo (fetched from the Header global) as an inline CID attachment.

---

### 2.1 User status change — `pendingUpdate` or `pendingPayment`

| Property  | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Trigger   | Admin changes a user's `status` to `pendingUpdate` or `pendingPayment` |
| Source    | `src/collections/Users/index.ts` — `afterChange` hook                |
| Template  | `src/email/userRegistration.tsx`                                      |
| To        | The user's email address                                              |
| Subject   | `Email.FixRegistration.subject` or `Email.RegistrationPayment.subject` (from `pt` locale) |

**When it fires:** Every time an admin saves a user record and the `status` field changes to one of those two values. This covers both the "please fix your data" and "please pay your membership" notifications.

---

### 2.2 Password reset

| Property  | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Trigger   | User submits the forgot-password form                                 |
| Source    | `src/actions/login.ts` — `resetPassword` server action               |
| Template  | `src/email/UserResetPassword.tsx`                                     |
| To        | The email address entered in the form                                 |
| Subject   | `Email.ResetPassword.subject` (from `pt` locale)                     |

**Note:** `disableEmail: true` is passed to `payload.forgotPassword()` so Payload's built-in reset email is suppressed — the custom template is used instead.

---

### 2.3 Order confirmation (event tickets)

| Property  | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Trigger   | Successful event ticket checkout (`createOrder` server action)        |
| Source    | `src/actions/order.ts`                                                |
| Template  | `src/email/orderConfirmationEmail.tsx`                                |
| To        | The logged-in user's email (`user.email` from `getMeUser()`)          |
| Subject   | `Email.OrderConfirmation.subject` with `{eventName}` — translated for `pt`/`en` |

---

### 2.4 Membership subscription confirmation

| Property  | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Trigger   | Successful membership fee payment (`createSubscription` server action) |
| Source    | `src/actions/subscription.ts`                                         |
| Template  | `src/email/subscriptionConfirmation.tsx`                              |
| To        | The logged-in user's email                                            |
| Subject   | `Email.SubscriptionConfirmation.subject` — translated for `pt`/`en`  |

Shows subscription period (start → end), amount paid, and payment status. Locale is passed from the action so the email language matches the user's current locale.

---

### 2.5 Pool subscription confirmation

| Property  | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Trigger   | Successful pool subscription payment (`createPoolSubscription`)       |
| Source    | `src/actions/pool-subscription.ts`                                    |
| Template  | `src/email/poolSubscriptionConfirmation.tsx`                          |
| To        | The logged-in user's email                                            |
| Subject   | `'Pool subscription confirmed'` (hardcoded)                           |

**Pattern:** Fire-and-forget — email failure is logged but does not roll back the transaction.

---

### 2.6 Pool waitlist confirmation

| Property  | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Trigger   | User joins a pool cycle waitlist (`joinPoolWaitlist`)                 |
| Source    | `src/actions/pool-subscription.ts`                                    |
| Template  | `src/email/poolWaitlistConfirmation.tsx`                              |
| To        | The logged-in user's email                                            |

---

### 2.7 Pool spot available (waitlist notification)

| Property  | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Trigger   | A pool subscription is cancelled, freeing a spot                      |
| Source    | `src/helpers/poolHelper.ts` — `notifyWaitlist()`                      |
| Template  | `src/email/poolSpotAvailable.tsx`                                     |
| To        | The first user on the waitlist for that cycle                         |

---

### 2.8 Pool subscription cancellation

| Property  | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Trigger   | User cancels their pool subscription (`cancelPoolSubscription`)       |
| Source    | `src/actions/pool-subscription.ts`                                    |
| Template  | `src/email/poolCancellationConfirmation.tsx`                          |
| To        | The logged-in user's email                                            |

---

### 2.9 Membership renewal (annual reset)

| Property  | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Trigger   | Admin triggers the annual reset action                                |
| Source    | `src/actions/annualReset.ts`                                          |
| Template  | `src/email/membershipRenewal.tsx`                                     |
| To        | All users whose status was changed to `expired` during the reset      |
| Subject   | `Email.MembershipRenewal.subject` (from `pt` locale)                  |

**Pattern:** Sent in a loop after the DB transaction commits. Individual email failures are logged but do not affect the reset outcome.

---

## Summary table

| Flow                          | Configurable in CMS? | Auto-sent by BE? | Status         |
| ----------------------------- | -------------------- | ---------------- | -------------- |
| Form builder submission       | ✅ Yes (per form)    | ✅ Yes           | Working        |
| User pendingUpdate/Payment    | ❌ No                | ✅ Yes           | Working        |
| Password reset                | ❌ No                | ✅ Yes           | Working        |
| Order confirmation            | ❌ No                | ✅ Yes           | Working        |
| Membership subscription confirmed | ❌ No                | ✅ Yes           | Working        |
| Pool subscription confirmed   | ❌ No                | ✅ Yes           | Working        |
| Pool waitlist confirmed       | ❌ No                | ✅ Yes           | Working        |
| Pool spot available           | ❌ No                | ✅ Yes           | Working        |
| Pool subscription cancelled   | ❌ No                | ✅ Yes           | Working        |
| Membership renewal            | ❌ No                | ✅ Yes           | Working        |
