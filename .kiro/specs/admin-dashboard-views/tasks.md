# Tasks — Admin Dashboard Views

## Task List

- [x] 1. Register views, endpoints, and nav links in payload.config.ts

  - [x] 1.1 Add three custom admin view registrations (PoolDashboard, MembersDashboard, EventsDashboard) under `admin.components.views`
  - [x] 1.2 Add three aggregation endpoint registrations (GET /api/dashboard/pool, /members, /events) to the `endpoints` array
  - [x] 1.3 Add three nav links under a "Dashboards" group label in `admin.components.views` nav config, visible only to admin role

- [x] 2. Implement useRequireAdmin hook

  - [x] 2.1 Create `src/admin/utils/requireAdmin.ts` exporting `useRequireAdmin()` that reads `useAuth()` and returns `{ user, isAdmin }` where `isAdmin = user?.role === 'admin'`

- [x] 3. Implement shared dashboard components

  - [x] 3.1 Create `src/admin/components/dashboard/StatCard.tsx` with props: `label`, `value`, `sub?`, `trend?`, `trendType?`, `barColor`
  - [x] 3.2 Create `src/admin/components/dashboard/PanelCard.tsx` with props: `title`, `sub?`, `badge?`, `badgeType?`, `borderColor`, `children` — renders 7px left border strip
  - [x] 3.3 Create `src/admin/components/dashboard/CapacityBar.tsx` with props: `value`, `max` — derives color: green <75%, amber 75–99%, coral 100%
  - [x] 3.4 Create `src/admin/components/dashboard/StatusBadge.tsx` with props: `status`, `type` — maps type to background/text color pair
  - [x] 3.5 Create `src/admin/components/dashboard/BarChart.tsx` with props: `data`, `height?` — pure CSS/HTML flex bars, no chart library
  - [x] 3.6 Create `src/admin/components/dashboard/DonutChart.tsx` with props: `segments`, `total`, `centerLabel?` — pure SVG stroke-dasharray with legend

- [x] 4. Implement Pool aggregation endpoint

  - [x] 4.1 Create `src/admin/endpoints/dashboardPool.ts` with auth guard (`req.user?.role === 'admin'`)
  - [x] 4.2 Query open pool cycle; return all-zero/empty response if none found
  - [x] 4.3 Compute `subscribedAthletes` (active pool-subscriptions count), `waitlistTotal` (waitlisted count), `confirmedSlotsThisWeek` (registrations in current ISO week), `fullSlotsCount`
  - [x] 4.4 Compute `weeklyRegistrations` array (one entry per week in cycle)
  - [x] 4.5 Compute `slotFillRate` array (one entry per unique day-of-week)
  - [x] 4.6 Compute `slotTable` array (raw registered/capacity/waitlisted per slot, no status strings)
  - [x] 4.7 Compute `waitlist` array (waitlisted subscriptions with athleteName, 1-based position, createdAt)

- [x] 5. Implement Members aggregation endpoint

  - [x] 5.1 Create `src/admin/endpoints/dashboardMembers.ts` with auth guard
  - [x] 5.2 Compute `newMembersThisMonth`, `pendingPayment`, `activeAccounts` from users collection
  - [x] 5.3 Compute `feesCollected` — sum amount from subscription where paymentStatus=paid, type=memberFee, startDate in current month
  - [x] 5.4 Compute `monthlySignups` array (6 months, short month label + count)
  - [x] 5.5 Compute `paymentBreakdown` array from subscription collection grouped by paymentStatus
  - [x] 5.6 Compute `recentMembers` array (10 most recent users, raw fields only, sorted by createdAt desc)

- [x] 6. Implement Events aggregation endpoint

  - [x] 6.1 Create `src/admin/endpoints/dashboardEvents.ts` with auth guard
  - [x] 6.2 Compute `activeEvents` (events with end > now), `upcomingIn30Days`, `totalWaitlisted` (hardcoded 0)
  - [x] 6.3 Compute `totalEnrolled` — count ticket line items from paid orders
  - [x] 6.4 Compute `events` array (future events with enrolledCount from paid orders and ticketCount from tickets collection)
  - [x] 6.5 Compute `enrollmentByEvent` array (one entry per upcoming event)
  - [x] 6.6 Compute `weeklySignups` array (6 ISO weeks, Monday label + paid order count)

- [x] 7. Implement Pool Dashboard view

  - [x] 7.1 Create `src/admin/views/PoolDashboard/index.tsx` as `'use client'` component
  - [x] 7.2 Apply role guard — render error Banner if not admin, LoadingOverlay while fetching, error state on failure
  - [x] 7.3 Render page header with title, subtitle, and gradient cycle period pill
  - [x] 7.4 Render gradient banner with cycle name and three stat values (subscribedAthletes, waitlistTotal, pool hours)
  - [x] 7.5 Render 4 StatCards (subscribedAthletes, confirmedSlotsThisWeek, waitlistTotal, fullSlotsCount)
  - [x] 7.6 Render two-column row: BarChart (weeklyRegistrations) + slot fill rate progress rows (slotFillRate)
  - [x] 7.7 Render two-column row: slot table with CapacityBar and client-side StatusBadge + waitlist summary with avatar initials and purple position pill
  - [x] 7.8 Derive slot status (available/limited/full) and badge/bar color client-side from registered/capacity

- [x] 8. Implement Members Dashboard view

  - [x] 8.1 Create `src/admin/views/MembersDashboard/index.tsx` as `'use client'` component
  - [x] 8.2 Apply role guard, LoadingOverlay, and error state
  - [x] 8.3 Render page header with title "Memberships" and current month/year subtitle
  - [x] 8.4 Render 4 StatCards (newMembersThisMonth, feesCollected formatted as €X, pendingPayment, activeAccounts)
  - [x] 8.5 Render two-column row: BarChart (monthlySignups, current month in #0a4a6e, prior in #0e7ea8) + DonutChart (paymentBreakdown with total center label)
  - [x] 8.6 Render full-width recent registrations table with Name, Email, StatusBadge, Registration date — derive all badge types and formatting client-side

- [x] 9. Implement Events Dashboard view

  - [x] 9.1 Create `src/admin/views/EventsDashboard/index.tsx` as `'use client'` component
  - [x] 9.2 Apply role guard, LoadingOverlay, and error state
  - [x] 9.3 Render page header with title "Events" and subtitle "Active and upcoming events"
  - [x] 9.4 Render 4 StatCards (activeEvents, totalEnrolled, upcomingIn30Days, totalWaitlisted with "Reserved for future use" note)
  - [x] 9.5 Render full-width active events panel — one PanelCard per event with title, start date, CapacityBar, status badge, spots remaining — derive border color and badge client-side
  - [x] 9.6 Render two-column row: dual-bar BarChart (enrollmentByEvent) + gradient BarChart (weeklySignups, oldest #3bb8d8 to newest #0a4a6e)

- [x] 10. Wire up import map

  - [x] 10.1 Run `pnpm payload generate:importmap` to register the three new view components in `src/app/(payload)/admin/importMap.js`

- [ ] 11. Write tests
  - [ ] 11.1 Write unit tests for `useRequireAdmin` — admin role returns isAdmin true, all other roles return false, null user returns false
  - [ ] 11.2 Write unit tests for `CapacityBar` color derivation — green at <75%, amber at 75–99%, coral at 100%
  - [ ] 11.3 Write unit tests for pool endpoint empty-cycle fallback (all zeros/empty arrays)
  - [ ] 11.4 Write unit tests for members endpoint feesCollected filter (excludes non-paid, non-memberFee, out-of-month)
  - [ ] 11.5 Write unit tests for events endpoint totalWaitlisted always 0
  - [ ] 11.6 Write property test for role guard: for any role string, isAdmin === (role === 'admin') [Feature: admin-dashboard-views, Property 1 & 2]
  - [ ] 11.7 Write property test for CapacityBar color invariant: for any value/max pair, color follows three-tier threshold [Feature: admin-dashboard-views, Property 8]
  - [ ] 11.8 Write property test for subscribedAthletes/waitlistTotal counting: for any subscription list, counts match status filter [Feature: admin-dashboard-views, Property 6]
  - [ ] 11.9 Write property test for feesCollected: for any subscription list, sum matches paid+memberFee+currentMonth filter [Feature: admin-dashboard-views, Property 9]
  - [ ] 11.10 Write property test for recentMembers: for any user list, result has ≤10 entries sorted by createdAt desc [Feature: admin-dashboard-views, Property 10]
  - [ ] 11.11 Write property test for totalWaitlisted invariant: always 0 regardless of input [Feature: admin-dashboard-views, Property 11]
  - [ ] 11.12 Write property test for client-side event status derivation: for any enrolledCount/ticketCount, border color matches capacity ratio thresholds [Feature: admin-dashboard-views, Property 13]
