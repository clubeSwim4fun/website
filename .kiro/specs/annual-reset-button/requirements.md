# Requirements Document

## Introduction

This feature adds an Annual Reset Button to the PayloadCMS admin panel for the Swim4Fun club website. Each January, club administrators perform a manual membership renewal cycle by resetting all active and expired members back to `pendingPayment` status, triggering the renewal flow. The button must be accessible only to admin-role users, require double confirmation to prevent accidental execution, and notify all affected users by email after the reset is performed.

## Glossary

- **Admin_Panel**: The PayloadCMS admin interface accessible at `/admin`
- **Annual_Reset**: The operation that transitions all users with status `active` or `expired` to `pendingPayment`, initiating the membership renewal cycle
- **Reset_Button**: The custom admin UI component that triggers the Annual Reset
- **Confirmation_Dialog**: The first-step modal that warns the admin about the consequences of the reset and requests a second confirmation
- **Confirmation_Phrase**: The text string the admin must type to confirm the reset (e.g. `RESET`)
- **Affected_User**: A user whose `status` is `active` or `expired` at the time the Annual Reset is executed
- **Renewal_Email**: The transactional email sent to each Affected_User after the reset, informing them that their membership requires renewal
- **Reset_Action**: The Next.js server action that performs the bulk status update and sends Renewal_Emails
- **Admin_User**: A user with `role === 'admin'`
- **Users_Collection**: The PayloadCMS `users` collection containing all club member records

---

## Requirements

### Requirement 1: Reset Button Placement

**User Story:** As an admin, I want a clearly visible Annual Reset button in the admin panel, so that I can easily find and trigger the membership renewal cycle each January.

#### Acceptance Criteria

1. THE Reset_Button SHALL be rendered as a custom UI component within the Users_Collection admin view in the Admin_Panel.
2. WHEN an Admin_User navigates to the Users_Collection list view in the Admin_Panel, THE Reset_Button SHALL be visible in the page header area.
3. WHILE the logged-in user has a role other than `admin`, THE Admin_Panel SHALL NOT render the Reset_Button.

---

### Requirement 2: Access Control

**User Story:** As a system, I want the Annual Reset to be restricted to admin-role users only, so that editors and regular members cannot accidentally or maliciously trigger it.

#### Acceptance Criteria

1. WHEN the Reset_Action is invoked, THE Reset_Action SHALL verify that the requesting user has `role === 'admin'` before executing any database writes.
2. IF the requesting user does not have `role === 'admin'`, THEN THE Reset_Action SHALL return an error response with HTTP status 403 and a descriptive message without modifying any user records.
3. THE Reset_Button SHALL only be mounted in the Admin_Panel when the current session user has `role === 'admin'`.

---

### Requirement 3: Double Confirmation Flow

**User Story:** As an admin, I want a two-step confirmation before the reset executes, so that I cannot accidentally trigger the annual reset with a single misclick.

#### Acceptance Criteria

1. WHEN an Admin_User clicks the Reset_Button, THE Confirmation_Dialog SHALL open displaying a warning message that describes the consequences of the reset, including the number of Affected_Users.
2. THE Confirmation_Dialog SHALL display the count of users currently in `active` or `expired` status before the admin proceeds.
3. WHEN the Confirmation_Dialog is open, THE Confirmation_Dialog SHALL require the Admin_User to type the Confirmation_Phrase `RESET` into a text input before the final confirm button becomes enabled.
4. WHILE the text input value does not exactly match the Confirmation_Phrase `RESET`, THE Confirmation_Dialog SHALL keep the final confirm button disabled.
5. WHEN the Admin_User types the exact Confirmation_Phrase and clicks the final confirm button, THE Reset_Action SHALL be invoked.
6. WHEN the Admin_User clicks the cancel button or closes the Confirmation_Dialog, THE Reset_Action SHALL NOT be invoked and no user records SHALL be modified.

---

### Requirement 4: Annual Reset Execution

**User Story:** As an admin, I want the reset to update all active and expired members to `pendingPayment` in a single atomic operation, so that the renewal cycle starts consistently for all affected members.

#### Acceptance Criteria

1. WHEN the Reset_Action is invoked by an Admin_User, THE Reset_Action SHALL query the Users_Collection for all users where `status` is `active` or `expired`.
2. WHEN the Reset_Action has identified the Affected_Users, THE Reset_Action SHALL update each Affected_User's `status` field to `pendingPayment`.
3. THE Reset_Action SHALL NOT modify users whose `status` is `pendingAnalysis`, `pendingUpdate`, or `pendingPayment`.
4. WHEN the Reset_Action completes successfully, THE Reset_Action SHALL return a response containing the count of users whose status was updated.
5. IF a database error occurs during the bulk update, THEN THE Reset_Action SHALL rollback all changes and return an error response without partially updating user records.

---

### Requirement 5: Email Notification

**User Story:** As an admin, I want all affected members to receive an email after the reset, so that they are informed that their membership requires renewal and know to complete payment.

#### Acceptance Criteria

1. WHEN the Reset_Action has successfully updated all Affected_Users' statuses to `pendingPayment`, THE Reset_Action SHALL send a Renewal_Email to each Affected_User's email address.
2. THE Renewal_Email SHALL inform the Affected_User that their membership has entered the renewal period and that payment is required to reactivate their account.
3. THE Renewal_Email SHALL use the existing `sendEmail()` helper from `src/helpers/emailHelper.ts` and a dedicated React Email template.
4. IF sending the Renewal_Email to an individual Affected_User fails, THEN THE Reset_Action SHALL log the error and continue sending emails to the remaining Affected_Users without rolling back the status updates.
5. THE Renewal_Email template SHALL be consistent in style with the existing email templates in `src/email/`.

---

### Requirement 6: Admin Feedback

**User Story:** As an admin, I want clear feedback after the reset completes or fails, so that I know whether the operation succeeded and how many users were affected.

#### Acceptance Criteria

1. WHEN the Reset_Action returns a success response, THE Reset_Button component SHALL display a success notification showing the number of users that were reset.
2. WHEN the Reset_Action returns an error response, THE Reset_Button component SHALL display an error notification with a descriptive message.
3. WHILE the Reset_Action is executing, THE Confirmation_Dialog SHALL display a loading state and the confirm button SHALL be disabled to prevent duplicate submissions.
4. WHEN the reset completes (success or error), THE Confirmation_Dialog SHALL close and the Admin_User SHALL remain on the Users_Collection list view.
