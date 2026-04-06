# Requirements Document

## Introduction

Newsletter management feature for the Swim4Fun club website. Allows admins to compose and send newsletters to targeted subsets of users via email, with full GDPR compliance enforced at the system level. Built on top of the existing Next.js 15 + PayloadCMS v3 + MongoDB stack, using Nodemailer and `@react-email/components` for delivery.

## Glossary

- **Newsletter**: A broadcast email composed by an admin, with a subject and rich-text content, sent to a filtered set of eligible users.
- **Newsletter_Manager**: The PayloadCMS admin panel section responsible for composing, targeting, previewing, and sending newsletters.
- **Recipient_Filter**: A set of criteria (account status, role, groups/group-categories, or individual users) used to select the target audience for a newsletter.
- **Eligible_User**: A user whose `emailNotificationsEnabled` field is `true` and who has not unsubscribed from email communications.
- **Consent_Gate**: The system-level rule that unconditionally excludes any user without explicit email consent from newsletter delivery, regardless of admin-selected filters.
- **Newsletter_Collection**: The PayloadCMS collection (`newsletters`) storing newsletter documents.
- **NewsletterRecipient**: A record linking a sent newsletter to a specific recipient user, storing delivery metadata.
- **Email_Template**: A React Email component used to render the newsletter HTML before sending via `sendEmail()`.
- **Draft**: A newsletter with `status: 'draft'` that has been saved but not yet sent.
- **Sent_Newsletter**: A newsletter with `status: 'sent'`, including `sentAt` timestamp and `recipientCount`.

---

## Requirements

### Requirement 1: Email Consent Field on Users

**User Story:** As a club member, I want to explicitly opt in to email communications during registration, so that I only receive newsletters I have consented to.

#### Acceptance Criteria

1. THE `users` collection SHALL include a boolean field `emailNotificationsEnabled` with a default value of `false`.
2. WHEN a user registers, THE Registration_Form SHALL present the `emailNotificationsEnabled` opt-in checkbox as an explicit, unchecked-by-default consent field.
3. WHEN a user updates their profile, THE Profile_Form SHALL allow the user to change the value of `emailNotificationsEnabled`.
4. THE `users` collection SHALL persist the `emailNotificationsEnabled` value across all user status transitions without modification.

---

### Requirement 2: Newsletter Data Model

**User Story:** As an admin, I want a structured data model for newsletters, so that I can store, track, and audit all sent communications.

#### Acceptance Criteria

1. THE Newsletter_Collection SHALL store the following fields: `subject` (text, required), `content` (Payload rich text / lexical), `status` (`draft` | `sent`), `createdAt`, `sentAt` (date, nullable), `recipientCount` (number, nullable).
2. THE Newsletter_Collection SHALL store a `recipientFilter` group field containing: `userIds` (relationship to `users`, hasMany), `statuses` (multiselect of user status values), `roles` (multiselect of user role values), `groups` (relationship to `groups` and `group-categories`, hasMany).
3. THE Newsletter_Collection SHALL store a `recipients` array field containing, for each delivery: `user` (relationship to `users`), `email` (text snapshot), `deliveredAt` (date).
4. WHEN a newsletter `status` is `sent`, THE Newsletter_Collection SHALL set `sentAt` to the timestamp of the send operation and `recipientCount` to the number of recipients to whom delivery was attempted.

---

### Requirement 3: Recipient Filtering

**User Story:** As an admin, I want to select newsletter recipients by combining filters (status, role, groups, or individual users), so that I can target the right audience.

#### Acceptance Criteria

1. WHEN an admin configures a `recipientFilter`, THE Newsletter_Manager SHALL resolve the union of all users matching any of the specified `userIds`, `statuses`, `roles`, or `groups`/`group-categories`.
2. WHEN no filter criteria are specified, THE Newsletter_Manager SHALL treat the target audience as all users in the system (subject to the Consent_Gate).
3. WHEN a `groups` or `group-categories` filter is applied, THE Newsletter_Manager SHALL include users whose `groups` relationship contains at least one of the specified values.
4. THE Newsletter_Manager SHALL deduplicate the resolved recipient list so that each user appears at most once, regardless of how many filter criteria match them.

---

### Requirement 4: GDPR Consent Gate

**User Story:** As a club administrator, I want the system to enforce GDPR consent rules automatically, so that newsletters are never sent to users who have not opted in, even if they are included in an admin-selected filter.

#### Acceptance Criteria

1. WHEN the Newsletter_Manager resolves the final recipient list, THE Consent_Gate SHALL remove all users whose `emailNotificationsEnabled` field is not `true`.
2. THE Consent_Gate SHALL be applied after all other recipient filters, as the final step before delivery, and SHALL NOT be bypassable by any admin action or filter configuration.
3. WHEN the resolved recipient list after consent filtering is empty, THE Newsletter_Manager SHALL abort the send operation and return an error indicating no eligible recipients were found.
4. THE Newsletter_Manager SHALL NOT expose or log the email addresses of users excluded by the Consent_Gate.

---

### Requirement 5: Compose and Send Newsletter

**User Story:** As an admin, I want to compose a newsletter with a subject and rich-text content and send it to the resolved recipient list, so that I can communicate with club members.

#### Acceptance Criteria

1. THE Newsletter_Manager SHALL provide a compose form with a `subject` text field and a `content` Payload lexical rich-text field supporting blocks and inline components.
2. WHEN an admin submits the send action, THE Newsletter_Manager SHALL resolve the recipient list, apply the Consent_Gate, render the Email_Template with the newsletter content, and invoke `sendEmail()` from `src/helpers/emailHelper.ts` for each eligible recipient.
3. WHEN `sendEmail()` fails for an individual recipient, THE Newsletter_Manager SHALL log the error with the recipient's user ID (not email) and continue sending to remaining recipients.
4. WHEN the send operation completes, THE Newsletter_Manager SHALL update the newsletter `status` to `sent`, set `sentAt`, and set `recipientCount` to the number of recipients for whom `sendEmail()` was invoked.
5. WHEN an admin triggers the send action on a newsletter with `status: 'sent'`, THE Newsletter_Manager SHALL reject the request and return an error indicating the newsletter has already been sent.

---

### Requirement 6: Draft Management

**User Story:** As an admin, I want to save a newsletter as a draft before sending, so that I can review and edit it before delivery.

#### Acceptance Criteria

1. THE Newsletter_Manager SHALL allow saving a newsletter with `status: 'draft'` without triggering any email delivery.
2. WHEN a draft newsletter is saved, THE Newsletter_Manager SHALL persist all fields including `subject`, `content`, and `recipientFilter`.
3. WHEN an admin opens a draft newsletter, THE Newsletter_Manager SHALL display all previously saved fields in an editable form.
4. WHEN an admin sends a draft newsletter, THE Newsletter_Manager SHALL transition `status` from `draft` to `sent` as part of the send operation.

---

### Requirement 7: Newsletter Preview

**User Story:** As an admin, I want to preview the rendered newsletter before sending, so that I can verify the content and formatting.

#### Acceptance Criteria

1. THE Newsletter_Manager SHALL provide a preview action that renders the Email_Template with the current `subject` and `content` and returns the rendered HTML.
2. WHEN an admin requests a preview, THE Newsletter_Manager SHALL display the rendered newsletter HTML without sending any emails.
3. WHEN an admin requests a preview, THE Newsletter_Manager SHALL also display the estimated recipient count based on the current `recipientFilter` after applying the Consent_Gate.

---

### Requirement 8: Email Template

**User Story:** As a club member, I want to receive newsletters in a consistent, branded format, so that communications look professional and recognisable.

#### Acceptance Criteria

1. THE Email_Template SHALL render the newsletter `subject` as the email subject line and the `content` rich text as the email body, wrapped in the existing `TemplateEmail` layout from `src/email/template.tsx`.
2. THE Email_Template SHALL include the club logo via the `cid:logo` attachment mechanism already used by `sendEmail()`.
3. THE Email_Template SHALL render rich-text `content` as HTML, converting Payload lexical nodes to HTML before passing to the template.

---

### Requirement 9: Access Control

**User Story:** As a system administrator, I want newsletter management to be restricted to admin users only, so that only authorised personnel can send mass emails.

#### Acceptance Criteria

1. THE Newsletter_Collection SHALL restrict `create`, `update`, and `delete` operations to users with `role === 'admin'` using the `isAdmin` access function from `src/access/isAdmin.ts`.
2. THE Newsletter_Collection SHALL restrict `read` operations to users with `role === 'admin'` or `role === 'editor'` using the `isAdminOrEditor` access function from `src/access/isAdminOrEditor.ts`.
3. THE send server action SHALL verify the current user has `role === 'admin'` before executing and SHALL return an unauthorised error if the check fails.

---

### Requirement 10: Edge Case Handling

**User Story:** As an admin, I want the system to handle edge cases gracefully, so that invalid operations do not cause data corruption or silent failures.

#### Acceptance Criteria

1. IF the resolved recipient list after all filters and the Consent_Gate contains zero users, THEN THE Newsletter_Manager SHALL return a descriptive error and SHALL NOT create any delivery records or update the newsletter `status`.
2. IF a `recipientFilter` references a `userId`, `group`, or `group-category` that does not exist, THEN THE Newsletter_Manager SHALL ignore the invalid reference and continue resolving the remaining filter criteria.
3. THE Newsletter_Manager SHALL deduplicate recipient email addresses so that no user receives more than one copy of the same newsletter.
4. IF the `subject` field is empty when the send action is triggered, THEN THE Newsletter_Manager SHALL return a validation error and SHALL NOT proceed with sending.
