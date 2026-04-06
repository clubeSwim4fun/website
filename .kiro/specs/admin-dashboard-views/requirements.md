# Requirements Document

## Introduction

This feature adds three custom admin dashboard views to the Swim4Fun PayloadCMS admin panel: a Pool Dashboard, a Members Dashboard, and an Events Dashboard. Each view is a pure UI layer registered as a custom PayloadCMS admin view — not a collection, global, or document view. The dashboards are accessible only to users with the `admin` role and display aggregated, read-only data fetched from three dedicated custom REST endpoints. The views follow a shared design system and use PayloadCMS built-in UI components wherever possible.

## Glossary

- **Admin_Panel**: The PayloadCMS admin interface served at `/admin`
- **Dashboard_View**: A custom React component registered under `admin.components.views` in `payload.config.ts`, rendered as a full page inside the Admin_Panel
- **Pool_Dashboard**: The Dashboard_View at path `/dashboard/pool` showing pool cycle and slot statistics
- **Members_Dashboard**: The Dashboard_View at path `/dashboard/members` showing membership and payment statistics
- **Events_Dashboard**: The Dashboard_View at path `/dashboard/events` showing event enrollment statistics
- **Aggregation_Endpoint**: A custom GET endpoint registered under `endpoints` in `payload.config.ts` that queries existing Payload collections and returns aggregated JSON
- **Role_Guard**: A React hook (`useRequireAdmin`) that checks `user.role === 'admin'` and renders an error banner if the check fails
- **Design_System**: The shared visual language (colors, fonts, card styles, badge styles, capacity bar styles) applied consistently across all three Dashboard_Views
- **StatCard**: A shared UI component displaying a single KPI value with a label and optional trend indicator
- **PanelCard**: A shared container component with white background, rounded corners, and a colored left border strip
- **CapacityBar**: A shared progress bar component whose color changes based on fill percentage
- **StatusBadge**: A shared pill-shaped label component with semantic color coding
- **BarChart**: A pure CSS/HTML bar chart component with no external chart library dependency
- **DonutChart**: A pure SVG donut chart component with no external chart library dependency
- **Pool_Cycle**: A document in the `pool-cycles` collection representing one monthly training period with slots and athlete limits
- **Pool_Subscription**: A document in the `pool-subscriptions` collection linking an athlete to a Pool_Cycle with a status of `active`, `waitlisted`, or `cancelled`
- **Pool_Slot_Registration**: A document in the `pool-slot-registrations` collection recording an athlete's booking of a specific training slot within a Pool_Cycle
- **Pool_Slot_Waitlist**: A document in the `pool-slot-waitlist` collection recording an athlete's position in the waitlist for a specific slot
- **Subscription**: A document in the `subscription` collection recording a membership fee payment by a user
- **Order**: A document in the `orders` collection recording a completed ticket purchase for one or more events

---

## Requirements

### Requirement 1: Custom View Registration

**User Story:** As an admin, I want the three dashboard views to be accessible from the PayloadCMS admin panel, so that I can navigate to them without leaving the admin interface.

#### Acceptance Criteria

1. THE `payload.config.ts` SHALL register `PoolDashboard` as a custom admin view at path `/dashboard/pool` pointing to component `./src/admin/views/PoolDashboard`
2. THE `payload.config.ts` SHALL register `MembersDashboard` as a custom admin view at path `/dashboard/members` pointing to component `./src/admin/views/MembersDashboard`
3. THE `payload.config.ts` SHALL register `EventsDashboard` as a custom admin view at path `/dashboard/events` pointing to component `./src/admin/views/EventsDashboard`
4. WHEN an admin user navigates to `/admin/dashboard/pool`, `/admin/dashboard/members`, or `/admin/dashboard/events`, THE Admin_Panel SHALL render the corresponding Dashboard_View without a full page reload
5. THE `payload.config.ts` SHALL register three nav links under a "Dashboards" group label in the admin navigation, each pointing to the corresponding dashboard path, visible only to users whose `role` is `admin`

---

### Requirement 2: Role Guard

**User Story:** As a system administrator, I want dashboard views to be restricted to admin-role users, so that regular members and editors cannot access aggregated club data.

#### Acceptance Criteria

1. THE `src/admin/utils/requireAdmin.ts` file SHALL export a `useRequireAdmin()` hook that reads the current user via `useAuth()` from `@payloadcms/ui` and returns `{ user, isAdmin }` where `isAdmin` is `true` only when `user?.role === 'admin'`
2. THE role check SHALL use strict equality (`user?.role === 'admin'`) against the `role` field on the `users` collection, which is a `select` field with a single string value — not an array; array methods such as `.includes()` SHALL NOT be used
3. WHEN a Dashboard_View is rendered and `useRequireAdmin()` returns `isAdmin === false`, THE Dashboard_View SHALL render a `Banner` component with `type="error"` containing the message "You do not have permission to view this page." and SHALL NOT render any dashboard content
4. WHEN a Dashboard_View is rendered and `useRequireAdmin()` returns `isAdmin === true`, THE Dashboard_View SHALL proceed to render its full content
5. THE Role_Guard check SHALL be applied in all three Dashboard_Views before any data fetching occurs

---

### Requirement 3: Aggregation Endpoints — Authentication & Authorization

**User Story:** As a system administrator, I want the aggregation endpoints to be protected, so that only authenticated admin users can retrieve aggregated club data.

#### Acceptance Criteria

1. THE `payload.config.ts` SHALL register three custom endpoints: `GET /api/dashboard/pool`, `GET /api/dashboard/members`, and `GET /api/dashboard/events`
2. WHEN a request is received at any Aggregation_Endpoint without a valid Payload session cookie, THE Aggregation_Endpoint SHALL return HTTP 403
3. WHEN a request is received at any Aggregation_Endpoint from an authenticated user whose `role` is not `admin`, THE Aggregation_Endpoint SHALL return HTTP 403
4. WHEN a request is received at any Aggregation_Endpoint from an authenticated user whose `role` is `admin`, THE Aggregation_Endpoint SHALL return HTTP 200 with a JSON body
5. THE role check in each Aggregation_Endpoint handler SHALL use `req.user?.role === 'admin'` — not `req.user?.roles?.includes('admin')`

---

### Requirement 4: Pool Aggregation Endpoint

**User Story:** As an admin, I want the pool endpoint to return aggregated pool cycle statistics, so that the Pool_Dashboard can display accurate, up-to-date data.

#### Acceptance Criteria

1. WHEN `GET /api/dashboard/pool` is called by an authorized admin, THE Aggregation_Endpoint SHALL query the `pool-subscriptions`, `pool-cycles`, `pool-slot-registrations`, and `pool-slot-waitlist` collections and return a JSON object with the following top-level keys: `subscribedAthletes`, `confirmedSlotsThisWeek`, `waitlistTotal`, `fullSlotsCount`, `weeklyRegistrations`, `slotFillRate`, `slotTable`, and `waitlist`
2. THE `subscribedAthletes` field SHALL contain the count of Pool_Subscription documents with `status === 'active'` in the currently open Pool_Cycle
3. THE `confirmedSlotsThisWeek` field SHALL contain the count of Pool_Slot_Registration documents whose associated slot falls within the current ISO calendar week
4. THE `waitlistTotal` field SHALL contain the count of Pool_Subscription documents with `status === 'waitlisted'` in the currently open Pool_Cycle
5. THE `fullSlotsCount` field SHALL contain the count of slots in the currently open Pool_Cycle where the number of Pool_Slot_Registration documents equals the slot's `maxAttendance`
6. THE `weeklyRegistrations` field SHALL contain an array of objects, one per week in the current Pool_Cycle, each with `week` (label string) and `count` (number of Pool_Slot_Registration documents created in that week)
7. THE `slotFillRate` field SHALL contain an array of objects, one per day-of-week that has slots, each with `day` (string) and `rate` (number between 0 and 100 representing percentage fill)
8. THE `slotTable` field SHALL contain an array of objects representing each slot in the current Pool_Cycle, each with `slotId`, `day`, `time`, `registered` (current count of Pool_Slot_Registration documents for that slot), `capacity` (the slot's `maxAttendance` value), and `waitlisted` (count of Pool_Slot_Waitlist documents for that slot) — the Pool_Dashboard SHALL derive the display status string (`available`, `limited`, `full`) from `registered` and `capacity` client-side, not from the endpoint
9. THE `waitlist` field SHALL contain an array of objects representing Pool_Subscription documents with `status === 'waitlisted'` in the currently open Pool_Cycle, each with `athleteName` (full name of the related user), `waitlistPosition` (integer, 1-based, ordered by `createdAt` ascending), and `createdAt` (ISO date string)
10. IF no Pool_Cycle with `status === 'open'` exists, THEN THE Aggregation_Endpoint SHALL return HTTP 200 with all numeric fields set to `0` and all array fields set to `[]`

---

### Requirement 5: Members Aggregation Endpoint

**User Story:** As an admin, I want the members endpoint to return aggregated membership statistics, so that the Members_Dashboard can display accurate, up-to-date data.

#### Acceptance Criteria

1. WHEN `GET /api/dashboard/members` is called by an authorized admin, THE Aggregation_Endpoint SHALL query the `users` and `subscription` collections and return a JSON object with the following top-level keys: `newMembersThisMonth`, `feesCollected`, `pendingPayment`, `activeAccounts`, `monthlySignups`, `paymentBreakdown`, and `recentMembers`
2. THE `newMembersThisMonth` field SHALL contain the count of `users` documents whose `createdAt` falls within the current calendar month
3. THE `feesCollected` field SHALL contain the sum of `amount` across all Subscription documents with `paymentStatus === 'paid'` and `type === 'memberFee'` whose `startDate` falls within the current calendar month, expressed as a raw number in EUR (the Members_Dashboard is responsible for formatting it as a currency string)
4. THE `pendingPayment` field SHALL contain the count of `users` documents with `status === 'pendingPayment'`
5. THE `activeAccounts` field SHALL contain the count of `users` documents with `status === 'active'`
6. THE `monthlySignups` field SHALL contain an array of objects, one per calendar month for the past 6 months, each with `month` (short label string, e.g. `"Jan"`) and `count` (number of `users` documents created in that month)
7. THE `paymentBreakdown` field SHALL contain an array of objects derived from Subscription documents grouped by `paymentStatus`, each with `label` (e.g. `"Paid"`, `"Pending"`, `"Failed"`) and `count` (number of Subscription documents with that `paymentStatus`) — this field SHALL be derived from the `subscription` collection, not from user status fields
8. THE `recentMembers` field SHALL contain an array of the 10 most recently created `users` documents sorted by `createdAt` descending, each with the raw fields `id`, `name`, `surname`, `email`, `status`, and `createdAt` — the Members_Dashboard is responsible for deriving all display strings and badge types from `status` client-side

---

### Requirement 6: Events Aggregation Endpoint

**User Story:** As an admin, I want the events endpoint to return aggregated event enrollment statistics, so that the Events_Dashboard can display accurate, up-to-date data.

#### Acceptance Criteria

1. WHEN `GET /api/dashboard/events` is called by an authorized admin, THE Aggregation_Endpoint SHALL query the `events`, `tickets`, and `orders` collections and return a JSON object with the following top-level keys: `activeEvents`, `totalEnrolled`, `upcomingIn30Days`, `totalWaitlisted`, `events`, `enrollmentByEvent`, and `weeklySignups`
2. THE `activeEvents` field SHALL contain the count of `events` documents whose `end` date is in the future
3. THE `totalEnrolled` field SHALL contain the total count of ticket line items across all Order documents with `paymentStatus === 'paid'`
4. THE `upcomingIn30Days` field SHALL contain the count of `events` documents whose `start` date is between now and 30 days from now
5. THE `totalWaitlisted` field SHALL always be `0` — events do not currently have a waitlist mechanism; this field is reserved for future use and SHALL be hardcoded to `0` in the endpoint response
6. THE `events` field SHALL contain an array of event summary objects for all events whose `end` date is in the future, each with `id`, `title`, `start`, `end`, `enrolledCount` (count of paid ticket line items for that event), and `ticketCount` (total number of Ticket documents linked to that event) — the Events_Dashboard SHALL derive the left border bar color and status badge from `enrolledCount` and `ticketCount` client-side
7. THE `enrollmentByEvent` field SHALL contain an array of objects, one per upcoming event, each with `eventTitle` (string) and `enrolled` (count of paid ticket line items for that event)
8. THE `weeklySignups` field SHALL contain an array of objects, one per ISO calendar week for the past 6 weeks, each with `week` (short label string, e.g. `"Apr 7"`) and `count` (number of Order documents with `paymentStatus === 'paid'` created in that week)

---

### Requirement 7: Design System

**User Story:** As an admin, I want all three dashboards to share a consistent visual language, so that the admin panel feels cohesive and professional.

#### Acceptance Criteria

1. THE Design_System SHALL apply a background color of `#fdf8f3` to the outermost wrapper element of every Dashboard_View
2. THE Design_System SHALL import the Syne Google Font via CSS and apply it to all stat values, panel titles, and section headings across all Dashboard_Views
3. THE Design_System SHALL import the DM Sans Google Font via CSS and apply it to all labels, table content, badges, and hint text across all Dashboard_Views
4. THE Design_System SHALL use white background, `border-radius: 14px`, and `border: 2px solid #d4eaf2` for all card components
5. THE Design_System SHALL render a 7px-wide colored left border strip as the leftmost column in a CSS grid on all PanelCard instances, where the color encodes status: blue (`#0e7ea8`) for default, green (`#2ecc71`) for success, amber (`#f0a020`) for warning, coral (`#e85d4a`) for error/full, and purple (`#a78bfa`) for waitlist
6. THE Design_System SHALL render StatCard values using Syne font, weight 800, size 30px, and color `#0a4a6e`
7. THE Design_System SHALL render StatusBadge components as small, uppercase, letter-spacing 0.6px, border-radius 99px pills using semantic background/text color pairs from the primary palette
8. THE Design_System SHALL render CapacityBar components at 5px height, border-radius 99px, green when fill is below 75%, amber when fill is between 75% and 99% inclusive, and coral when fill is 100%
9. THE Design_System SHALL render primary action buttons using `linear-gradient(135deg, #0a4a6e, #0e7ea8)` background, Syne font, white text, and `border-radius: 10px`
10. THE Design_System SHALL NOT use `position: fixed` anywhere within Dashboard_View components

---

### Requirement 8: Data Fetching & Loading States

**User Story:** As an admin, I want dashboards to show a loading indicator while data is being fetched and a clear error message if the fetch fails, so that I always know the state of the data.

#### Acceptance Criteria

1. WHEN a Dashboard_View mounts and data has not yet been received, THE Dashboard_View SHALL render a `LoadingOverlay` component from `@payloadcms/ui`
2. WHEN the fetch to the corresponding Aggregation_Endpoint completes successfully, THE Dashboard_View SHALL replace the `LoadingOverlay` with the populated dashboard content
3. WHEN the fetch to the corresponding Aggregation_Endpoint returns a non-2xx status or a network error occurs, THE Dashboard_View SHALL render a visible error state containing a descriptive message and SHALL NOT render partial data
4. THE Dashboard_View SHALL fetch data client-side on mount using the browser `fetch` API against the corresponding Aggregation_Endpoint path
5. THE Dashboard_View SHALL NOT use `localStorage` or any other client-side storage mechanism to cache or persist fetched data

---

### Requirement 9: Pool Dashboard View

**User Story:** As an admin, I want the Pool Dashboard to display a comprehensive overview of the current pool cycle, so that I can monitor athlete registrations, slot utilization, and waitlist status at a glance.

#### Acceptance Criteria

1. THE Pool_Dashboard SHALL render a page header containing a title, a subtitle, and a gradient pill indicating the current cycle period
2. THE Pool_Dashboard SHALL render a gradient banner (`linear-gradient(135deg, #0a4a6e, #0e7ea8)`, `border-radius: 14px`) with the cycle name on the left in Syne bold and three stat values on the right — subscribed athletes, waitlist total, and pool hours — rendered in Syne 800
3. THE Pool_Dashboard SHALL render a row of 4 StatCard components showing: subscribed athletes (blue bar), confirmed slots this week (green bar), waitlist total (amber bar), and full slots count (coral bar)
4. THE Pool_Dashboard SHALL render a two-column row: left column contains a PanelCard titled "Weekly registrations" with a BarChart using the `weeklyRegistrations` data; right column contains a PanelCard titled "Slot fill rate by day" with a progress row per day using the `slotFillRate` data — each row shows day name, a horizontal fill bar, enrolled count, and fill percentage
5. THE Pool_Dashboard SHALL render a two-column row: left column contains a PanelCard titled "Athletes per slot — this week" with a table using the `slotTable` data and columns Slot, Day, Enrolled, Capacity (CapacityBar), Status (StatusBadge derived client-side); right column contains a PanelCard titled "Waitlist summary" showing each `waitlist` entry as a row with an avatar circle containing the athlete's initials (pale blue `#e0f5fb` background, `#0a4a6e` text), athlete name, and a purple position pill
6. WHEN a slot's `registered` equals `capacity`, THE Pool_Dashboard SHALL render a coral CapacityBar and a coral "Full" StatusBadge for that row
7. WHEN a slot's `registered` is between 75% and 99% of `capacity`, THE Pool_Dashboard SHALL render an amber CapacityBar and an amber "Limited" StatusBadge for that row
8. WHEN a slot's `registered` is below 75% of `capacity`, THE Pool_Dashboard SHALL render a green CapacityBar and a green "Available" StatusBadge for that row

---

### Requirement 10: Members Dashboard View

**User Story:** As an admin, I want the Members Dashboard to display a comprehensive overview of membership registrations and payments, so that I can monitor club growth and financial health.

#### Acceptance Criteria

1. THE Members_Dashboard SHALL render a page header containing a title "Memberships" and the current month and year as the subtitle
2. THE Members_Dashboard SHALL render a row of 4 StatCard components showing: new members this month (blue bar), fees collected this month formatted as `€ X` derived from the raw `feesCollected` number (green bar), pending payment count (amber bar), and active accounts count (green bar)
3. THE Members_Dashboard SHALL render a two-column row: left column contains a PanelCard titled "New registrations — last 6 months" with a BarChart using `monthlySignups` data where the current month bar is rendered in `#0a4a6e` and prior months in `#0e7ea8`; right column contains a PanelCard titled "Payment status breakdown" with a DonutChart using `paymentBreakdown` data with the total member count as the center label
4. THE Members_Dashboard SHALL render a full-width PanelCard titled "Recent registrations" with a badge showing the current month, containing a table with columns: Name (concatenated from `name` and `surname`), Email, Status (StatusBadge), Registration date (formatted from `createdAt`); rows are sorted by `createdAt` descending and limited to 10
5. WHEN a member's `status` is `active`, THE Members_Dashboard SHALL render a green StatusBadge
6. WHEN a member's `status` is `pendingPayment`, THE Members_Dashboard SHALL render an amber StatusBadge
7. WHEN a member's `status` is `pendingAnalysis` or `pendingUpdate`, THE Members_Dashboard SHALL render a blue StatusBadge
8. WHEN a member's `status` is `expired`, THE Members_Dashboard SHALL render a coral StatusBadge
9. THE Members_Dashboard SHALL NOT pass any display formatting to the endpoint — all badge types, currency formatting, and date formatting SHALL be derived client-side from the raw fields returned by the endpoint

---

### Requirement 11: Events Dashboard View

**User Story:** As an admin, I want the Events Dashboard to display a comprehensive overview of upcoming events and ticket enrollments, so that I can monitor event capacity and registration trends.

#### Acceptance Criteria

1. THE Events_Dashboard SHALL render a page header with the title "Events" and a subtitle "Active and upcoming events"
2. THE Events_Dashboard SHALL render a row of 4 StatCard components showing: active events count (blue bar), total enrolled paid tickets (green bar), upcoming events in the next 30 days (amber bar), and total waitlisted hardcoded to `0` with a note "Reserved for future use" (purple bar)
3. THE Events_Dashboard SHALL render a full-width PanelCard titled "Active & upcoming events" containing one PanelCard per event from the `events` array, each showing: event title in Syne bold, start date formatted as a readable string, enrolled count in Syne 800, a CapacityBar derived from `enrolledCount` and `ticketCount`, a footer row with a status badge, percentage full label, and spots remaining count
4. THE Events_Dashboard SHALL render a two-column row: left column contains a PanelCard titled "Enrollment by event" with a BarChart using `enrollmentByEvent` data where each event has two bars side by side — enrolled (mid blue `#0e7ea8`) and total capacity (border color `#d4eaf2`); right column contains a PanelCard titled "Registration timeline" with a BarChart using `weeklySignups` data, bars colored from `#3bb8d8` (oldest) to `#0a4a6e` (most recent)
5. WHEN an event's `enrolledCount` equals `ticketCount`, THE Events_Dashboard SHALL render the event's PanelCard left border strip in coral (`#e85d4a`)
6. WHEN an event's `enrolledCount` is between 75% and 99% of `ticketCount`, THE Events_Dashboard SHALL render the event's PanelCard left border strip in amber (`#f0a020`)
7. WHEN an event's `enrolledCount` is below 75% of `ticketCount`, THE Events_Dashboard SHALL render the event's PanelCard left border strip in blue (`#0e7ea8`)
8. THE Events_Dashboard SHALL derive all border colors, badge types, and display strings from `enrolledCount` and `ticketCount` client-side — the endpoint SHALL NOT return pre-computed status strings for events

---

### Requirement 12: Shared Dashboard Components

**User Story:** As a developer, I want all shared UI components to live in a single directory, so that they can be reused across all three dashboards without duplication.

#### Acceptance Criteria

1. THE `src/admin/components/dashboard/` directory SHALL contain the following component files: `StatCard.tsx`, `PanelCard.tsx`, `CapacityBar.tsx`, `StatusBadge.tsx`, `BarChart.tsx`, and `DonutChart.tsx`
2. THE `BarChart` component SHALL render a bar chart using only CSS and HTML — no external chart library SHALL be installed or imported
3. THE `DonutChart` component SHALL render a donut chart using only inline SVG — no external chart library SHALL be installed or imported
4. THE `StatCard` component SHALL accept `label: string`, `value: string | number`, `sub?: string`, `trend?: string`, `trendType?: 'up' | 'down' | 'flat'`, and `barColor: 'blue' | 'green' | 'amber' | 'coral' | 'purple'` props
5. THE `PanelCard` component SHALL accept `title: string`, `sub?: string`, `badge?: string`, `badgeType?: 'blue' | 'green' | 'amber'`, `borderColor: 'blue' | 'green' | 'amber' | 'coral' | 'purple'`, and `children: ReactNode` props and SHALL render the 7px left border strip in the color mapped from `borderColor`
6. THE `CapacityBar` component SHALL accept `value: number` (current enrolled) and `max: number` (capacity) props and SHALL derive its fill color automatically: green when `value/max < 0.75`, amber when `0.75 <= value/max < 1`, coral when `value/max >= 1`
7. THE `StatusBadge` component SHALL accept `status: string` and `type: 'green' | 'amber' | 'coral' | 'blue' | 'purple' | 'gray'` props and SHALL map each type to the corresponding background/text color pair from the Design_System
8. THE `BarChart` component SHALL accept `data: { label: string, value: number, color?: string }[]` and `height?: number` props and SHALL render bars as flex children with heights proportional to the maximum value in the dataset
9. THE `DonutChart` component SHALL accept `segments: { label: string, count: number, color: string }[]`, `total: number`, and `centerLabel?: string` props and SHALL render using SVG `stroke-dasharray` with a legend to the right

---

### Requirement 13: No Modification of Existing Artifacts

**User Story:** As a developer, I want the dashboard feature to be additive only, so that existing collections, globals, and admin components are not broken.

#### Acceptance Criteria

1. THE implementation SHALL NOT modify any existing collection configuration files under `src/collections/`
2. THE implementation SHALL NOT modify any existing global configuration files (`Header`, `Footer`, `GeneralConfigs`)
3. THE implementation SHALL NOT modify the admin header component
4. THE implementation SHALL NOT create new Payload globals for this feature
5. THE implementation SHALL NOT create Next.js pages or routes outside the Payload admin panel for this feature
6. THE implementation SHALL NOT install Chart.js, Recharts, D3, or any other external chart library
7. THE only file outside `src/admin/` that SHALL be modified is `payload.config.ts`, solely to register the three custom views, three aggregation endpoints, and the nav links
