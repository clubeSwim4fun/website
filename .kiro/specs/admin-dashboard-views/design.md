# Design Document — Admin Dashboard Views

## Overview

This feature adds three read-only admin dashboard views to the Swim4Fun PayloadCMS admin panel: Pool Dashboard, Members Dashboard, and Events Dashboard. Each view is a client-side React component registered as a custom PayloadCMS admin view. Data is fetched from three dedicated aggregation endpoints that query existing Payload collections server-side and return pre-aggregated JSON. All views share a common design system and a set of reusable UI components.

The implementation is strictly additive: only `payload.config.ts` is modified outside `src/admin/`. No existing collections, globals, or admin components are touched.

---

## Architecture

```mermaid
graph TD
  subgraph Admin Panel (browser)
    NAV[Nav Links — Dashboards group]
    PD[PoolDashboard view]
    MD[MembersDashboard view]
    ED[EventsDashboard view]
    GUARD[useRequireAdmin hook]
    SHARED[Shared components\nStatCard · PanelCard · CapacityBar\nStatusBadge · BarChart · DonutChart]
  end

  subgraph payload.config.ts
    VIEWS[admin.components.views]
    ENDPOINTS[endpoints array]
    NAVLINKS[admin nav links]
  end

  subgraph Aggregation Endpoints (server)
    EP1[GET /api/dashboard/pool]
    EP2[GET /api/dashboard/members]
    EP3[GET /api/dashboard/events]
  end

  subgraph MongoDB Collections
    PC[pool-cycles]
    PS[pool-subscriptions]
    PSR[pool-slot-registrations]
    PSW[pool-slot-waitlist]
    US[users]
    SUB[subscription]
    EV[events]
    TK[tickets]
    OR[orders]
  end

  NAV --> PD
  NAV --> MD
  NAV --> ED
  PD --> GUARD
  MD --> GUARD
  ED --> GUARD
  PD --> SHARED
  MD --> SHARED
  ED --> SHARED
  PD -->|fetch on mount| EP1
  MD -->|fetch on mount| EP2
  ED -->|fetch on mount| EP3
  EP1 --> PC & PS & PSR & PSW
  EP2 --> US & SUB
  EP3 --> EV & TK & OR
  VIEWS --> PD & MD & ED
  ENDPOINTS --> EP1 & EP2 & EP3
  NAVLINKS --> NAV
```

### Key Design Decisions

- **Client-side fetch, server-side aggregation**: Views are `'use client'` components that call the aggregation endpoints on mount. All MongoDB queries and aggregation logic live in the endpoint handlers, keeping views thin.
- **No chart libraries**: BarChart uses CSS flexbox with proportional heights; DonutChart uses inline SVG `stroke-dasharray`. This avoids any new dependencies.
- **Role guard at view level**: `useRequireAdmin()` wraps `useAuth()` from `@payloadcms/ui` and is called before any fetch. Non-admin users see an error banner; no data is fetched.
- **Status derivation is client-side**: Endpoints return raw numeric fields (`registered`, `capacity`, `enrolledCount`, `ticketCount`). Views derive display strings, badge types, and bar colors from these values. This keeps endpoints stable and views flexible.
- **No `position: fixed`**: All layout uses normal document flow to avoid conflicts with the PayloadCMS admin chrome.

---

## Components and Interfaces

### File Layout

```
src/admin/
  utils/
    requireAdmin.ts                  # useRequireAdmin hook
  views/
    PoolDashboard/index.tsx          # Pool Dashboard view
    MembersDashboard/index.tsx       # Members Dashboard view
    EventsDashboard/index.tsx        # Events Dashboard view
  components/
    dashboard/
      StatCard.tsx
      PanelCard.tsx
      CapacityBar.tsx
      StatusBadge.tsx
      BarChart.tsx
      DonutChart.tsx
  endpoints/
    dashboardPool.ts                 # GET /api/dashboard/pool handler
    dashboardMembers.ts              # GET /api/dashboard/members handler
    dashboardEvents.ts               # GET /api/dashboard/events handler
```

### `useRequireAdmin` Hook

```ts
// src/admin/utils/requireAdmin.ts
'use client'
import { useAuth } from '@payloadcms/ui'

export function useRequireAdmin() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' // strict equality, never .includes()
  return { user, isAdmin }
}
```

### Shared Component Props

```ts
// StatCard
interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: string
  trendType?: 'up' | 'down' | 'flat'
  barColor: 'blue' | 'green' | 'amber' | 'coral' | 'purple'
}

// PanelCard
interface PanelCardProps {
  title: string
  sub?: string
  badge?: string
  badgeType?: 'blue' | 'green' | 'amber'
  borderColor: 'blue' | 'green' | 'amber' | 'coral' | 'purple'
  children: ReactNode
}

// CapacityBar
interface CapacityBarProps {
  value: number // current enrolled / registered
  max: number // capacity
}

// StatusBadge
interface StatusBadgeProps {
  status: string
  type: 'green' | 'amber' | 'coral' | 'blue' | 'purple' | 'gray'
}

// BarChart
interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
}

// DonutChart
interface DonutChartProps {
  segments: { label: string; count: number; color: string }[]
  total: number
  centerLabel?: string
}
```

### Dashboard View Pattern

Each view follows the same structure:

```tsx
'use client'
export default function XxxDashboard() {
  const { isAdmin } = useRequireAdmin()
  const [data, setData] = useState<XxxData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/dashboard/xxx')
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (!isAdmin) return <Banner type="error">You do not have permission to view this page.</Banner>
  if (loading) return <LoadingOverlay />
  if (error || !data) return <div className="error-state">{error}</div>
  return <div style={{ background: '#fdf8f3' }}>...</div>
}
```

---

## Data Models

### Pool Endpoint Response

```ts
interface PoolDashboardData {
  subscribedAthletes: number
  confirmedSlotsThisWeek: number
  waitlistTotal: number
  fullSlotsCount: number
  weeklyRegistrations: { week: string; count: number }[]
  slotFillRate: { day: string; rate: number }[]
  slotTable: {
    slotId: string
    day: string
    time: string
    registered: number
    capacity: number
    waitlisted: number
  }[]
  waitlist: {
    athleteName: string
    waitlistPosition: number
    createdAt: string
  }[]
}
```

**Aggregation logic (server):**

1. Find the single `pool-cycles` document with `status === 'open'`. If none, return all-zero/empty response.
2. `subscribedAthletes`: `pool-subscriptions.countDocuments({ cycle: cycleId, status: 'active' })`
3. `waitlistTotal`: `pool-subscriptions.countDocuments({ cycle: cycleId, status: 'waitlisted' })`
4. `confirmedSlotsThisWeek`: `pool-slot-registrations.countDocuments({ cycle: cycleId, createdAt: { $gte: weekStart, $lte: weekEnd } })` where weekStart/weekEnd are the Monday–Sunday boundaries of the current ISO week.
5. `fullSlotsCount`: iterate all slots across all weeks in the cycle; for each `slotId`, count registrations; count slots where `registrations === slot.maxAttendance`.
6. `weeklyRegistrations`: for each week in `cycle.weeks`, count `pool-slot-registrations` with `createdAt` between `week.startDate` and `week.endDate`.
7. `slotFillRate`: group all slots by `day`; for each day, compute `(totalRegistered / totalCapacity) * 100`.
8. `slotTable`: for each slot across all weeks, fetch registration count and waitlist count by `slotId`.
9. `waitlist`: find `pool-subscriptions` with `status === 'waitlisted'` for the cycle, populate `athlete` (name + surname), sort by `createdAt` ascending, assign 1-based position.

### Members Endpoint Response

```ts
interface MembersDashboardData {
  newMembersThisMonth: number
  feesCollected: number // raw EUR number, no formatting
  pendingPayment: number
  activeAccounts: number
  monthlySignups: { month: string; count: number }[]
  paymentBreakdown: { label: string; count: number }[]
  recentMembers: {
    id: string
    name: string
    surname: string
    email: string
    status: string
    createdAt: string
  }[]
}
```

**Aggregation logic (server):**

1. `newMembersThisMonth`: `users.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } })`
2. `feesCollected`: `subscription.aggregate` — sum `amount` where `paymentStatus === 'paid'`, `type === 'memberFee'`, `startDate` within current month.
3. `pendingPayment`: `users.countDocuments({ status: 'pendingPayment' })`
4. `activeAccounts`: `users.countDocuments({ status: 'active' })`
5. `monthlySignups`: for each of the past 6 calendar months (including current), count `users` created in that month. Label as short month name (e.g. `"Jan"`).
6. `paymentBreakdown`: `subscription.aggregate` — group by `paymentStatus`, map values to display labels (`paid` → `"Paid"`, `pending` → `"Pending"`, `failed` → `"Failed"`).
7. `recentMembers`: `users.find({}).sort({ createdAt: -1 }).limit(10)` — return raw fields only.

### Events Endpoint Response

```ts
interface EventsDashboardData {
  activeEvents: number
  totalEnrolled: number
  upcomingIn30Days: number
  totalWaitlisted: 0 // always 0, reserved for future use
  events: {
    id: string
    title: string
    start: string
    end: string
    enrolledCount: number
    ticketCount: number
  }[]
  enrollmentByEvent: { eventTitle: string; enrolled: number }[]
  weeklySignups: { week: string; count: number }[]
}
```

**Aggregation logic (server):**

1. `activeEvents`: `events.countDocuments({ end: { $gt: now } })`
2. `upcomingIn30Days`: `events.countDocuments({ start: { $gte: now, $lte: now+30days } })`
3. `totalEnrolled`: count all ticket line items across `orders` where `paymentStatus === 'paid'`. Each order has `events[].tickets[]`; sum the length of all `tickets` arrays across all paid orders.
4. `events`: find all events with `end > now`. For each, count paid ticket line items from `orders` (enrolledCount) and count `tickets` documents with `eventFor === eventId` (ticketCount).
5. `enrollmentByEvent`: same events, return `{ eventTitle, enrolled }`.
6. `weeklySignups`: for each of the past 6 ISO weeks, count `orders` with `paymentStatus === 'paid'` and `createdAt` within that week. Label as `"Apr 7"` (Monday of the week).

### Endpoint Auth Pattern

All three endpoint handlers share the same auth guard:

```ts
export const dashboardXxx: Endpoint = {
  path: '/dashboard/xxx',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if (req.user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
    // ... aggregation queries using req.payload
    return Response.json(data)
  },
}
```

Payload populates `req.user` from the `payload-token` cookie automatically for requests made within the admin panel.

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Role guard blocks non-admin users

_For any_ authenticated user whose `role` is not `'admin'`, calling `useRequireAdmin()` should return `isAdmin === false`, and the dashboard view should render the error banner without fetching any data.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 2: Role guard admits admin users

_For any_ authenticated user whose `role` is exactly `'admin'`, calling `useRequireAdmin()` should return `isAdmin === true`.

**Validates: Requirements 2.1, 2.4**

### Property 3: Endpoint rejects unauthenticated requests

_For any_ request to any aggregation endpoint without a valid session, the endpoint should return HTTP 403.

**Validates: Requirements 3.2**

### Property 4: Endpoint rejects non-admin authenticated requests

_For any_ authenticated user whose `role` is not `'admin'`, a request to any aggregation endpoint should return HTTP 403.

**Validates: Requirements 3.3, 3.5**

### Property 5: Pool endpoint empty-cycle fallback

_For any_ state of the database where no `pool-cycles` document has `status === 'open'`, the pool endpoint should return HTTP 200 with all numeric fields equal to `0` and all array fields equal to `[]`.

**Validates: Requirements 4.10**

### Property 6: Pool subscribedAthletes counts only active subscriptions

_For any_ set of pool subscriptions in the open cycle, `subscribedAthletes` should equal the count of subscriptions with `status === 'active'` — subscriptions with `status === 'waitlisted'` or `'cancelled'` must not be counted.

**Validates: Requirements 4.2**

### Property 7: Pool waitlistTotal counts only waitlisted subscriptions

_For any_ set of pool subscriptions in the open cycle, `waitlistTotal` should equal the count of subscriptions with `status === 'waitlisted'` — active or cancelled subscriptions must not be counted.

**Validates: Requirements 4.4**

### Property 8: CapacityBar color invariant

_For any_ `value` and `max` passed to `CapacityBar`, the rendered bar color should be green when `value/max < 0.75`, amber when `0.75 <= value/max < 1`, and coral when `value/max >= 1`.

**Validates: Requirements 7.8, 9.6, 9.7, 9.8**

### Property 9: Members feesCollected sums only paid memberFee subscriptions in current month

_For any_ set of subscription documents, `feesCollected` should equal the sum of `amount` only for documents where `paymentStatus === 'paid'`, `type === 'memberFee'`, and `startDate` falls within the current calendar month — subscriptions of other types or statuses must not contribute.

**Validates: Requirements 5.3**

### Property 10: Members recentMembers returns at most 10 records sorted by createdAt descending

_For any_ set of user documents, `recentMembers` should contain at most 10 entries, and for any two entries `a` and `b` where `a` appears before `b`, `a.createdAt >= b.createdAt`.

**Validates: Requirements 5.8**

### Property 11: Events totalWaitlisted is always 0

_For any_ state of the database, the events endpoint should return `totalWaitlisted === 0`.

**Validates: Requirements 6.5**

### Property 12: Events endpoint enrolledCount counts only paid ticket line items

_For any_ set of orders, `totalEnrolled` and per-event `enrolledCount` should count only ticket line items from orders with `paymentStatus === 'paid'` — pending or failed orders must not be counted.

**Validates: Requirements 6.3, 6.6**

### Property 13: Client-side status derivation is consistent with capacity ratio

_For any_ event with `enrolledCount` and `ticketCount`, the derived border color and status badge should be coral when `enrolledCount === ticketCount`, amber when `enrolledCount / ticketCount >= 0.75 && enrolledCount < ticketCount`, and blue otherwise — matching the same thresholds as CapacityBar.

**Validates: Requirements 11.5, 11.6, 11.7**

---

## Error Handling

| Scenario                                  | Behavior                                                                                 |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| No open pool cycle                        | Endpoint returns 200 with all-zero/empty payload; view renders normally with zero values |
| Unauthenticated request to endpoint       | 403 JSON response                                                                        |
| Non-admin authenticated request           | 403 JSON response                                                                        |
| Fetch returns non-2xx                     | View renders error state with message; no partial data shown                             |
| Network error during fetch                | Caught in `.catch()`; view renders error state                                           |
| `useAuth()` returns null user             | `isAdmin` is `false`; error banner shown; no fetch initiated                             |
| Empty collections (no events, no members) | Endpoints return 200 with zeros and empty arrays; views render gracefully                |

---

## Testing Strategy

### Unit Tests

Focus on specific examples, edge cases, and pure functions:

- `useRequireAdmin()` with `role === 'admin'` → `isAdmin: true`
- `useRequireAdmin()` with `role === 'editor'` → `isAdmin: false`
- `useRequireAdmin()` with `role === 'default'` → `isAdmin: false`
- `useRequireAdmin()` with `user === null` → `isAdmin: false`
- `CapacityBar` renders green at 0/10, amber at 8/10, coral at 10/10
- `StatusBadge` renders correct color class for each type
- Pool endpoint returns all-zero response when no open cycle exists
- Members endpoint `feesCollected` excludes `type === 'pool'` subscriptions
- Events endpoint always returns `totalWaitlisted: 0`

### Property-Based Tests

Use **fast-check** (already compatible with the TypeScript/Node stack; no new runtime dependency for production).

Configure each test to run a minimum of **100 iterations**.

Each test is tagged with a comment in the format:
`// Feature: admin-dashboard-views, Property N: <property text>`

**Property 1 & 2 — Role guard**

```
// Feature: admin-dashboard-views, Property 1 & 2: role guard admits/blocks based on role
// For any string role value, isAdmin === (role === 'admin')
fc.property(fc.string(), (role) => {
  const result = computeIsAdmin(role)
  return result === (role === 'admin')
})
```

**Property 8 — CapacityBar color invariant**

```
// Feature: admin-dashboard-views, Property 8: CapacityBar color invariant
// For any value in [0, max], color follows the three-tier threshold
fc.property(fc.nat(100), fc.nat({ min: 1, max: 100 }), (value, max) => {
  const color = deriveCapacityColor(value, max)
  const ratio = value / max
  if (ratio >= 1) return color === 'coral'
  if (ratio >= 0.75) return color === 'amber'
  return color === 'green'
})
```

**Property 6 — Pool subscribedAthletes**

```
// Feature: admin-dashboard-views, Property 6: subscribedAthletes counts only active
// For any list of subscriptions, count(active) === subscribedAthletes
fc.property(fc.array(fc.record({ status: fc.constantFrom('active', 'waitlisted', 'cancelled') })), (subs) => {
  const result = countSubscribedAthletes(subs)
  return result === subs.filter(s => s.status === 'active').length
})
```

**Property 9 — feesCollected**

```
// Feature: admin-dashboard-views, Property 9: feesCollected sums only paid memberFee in current month
fc.property(fc.array(subscriptionArbitrary), (subs) => {
  const result = computeFeesCollected(subs, currentMonthStart, currentMonthEnd)
  const expected = subs
    .filter(s => s.paymentStatus === 'paid' && s.type === 'memberFee' && inCurrentMonth(s.startDate))
    .reduce((sum, s) => sum + s.amount, 0)
  return result === expected
})
```

**Property 10 — recentMembers ordering**

```
// Feature: admin-dashboard-views, Property 10: recentMembers at most 10, sorted desc
fc.property(fc.array(userArbitrary, { minLength: 0, maxLength: 50 }), (users) => {
  const result = selectRecentMembers(users)
  if (result.length > 10) return false
  for (let i = 1; i < result.length; i++) {
    if (result[i].createdAt > result[i - 1].createdAt) return false
  }
  return true
})
```

**Property 13 — Client-side event status derivation**

```
// Feature: admin-dashboard-views, Property 13: event border color matches capacity ratio
fc.property(fc.nat(100), fc.nat({ min: 1, max: 100 }), (enrolled, total) => {
  const color = deriveEventBorderColor(enrolled, total)
  if (enrolled >= total) return color === 'coral'
  if (enrolled / total >= 0.75) return color === 'amber'
  return color === 'blue'
})
```
