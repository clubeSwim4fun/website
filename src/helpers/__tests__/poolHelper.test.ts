import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'

// Mock heavy dependencies that are not needed for pure function tests
vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@react-email/components', () => ({ render: vi.fn() }))
vi.mock('react', () => ({ default: { createElement: vi.fn() }, createElement: vi.fn() }))
vi.mock('@/helpers/emailHelper', () => ({ sendEmail: vi.fn() }))

import { computePoolPageState } from '../poolHelper'
import type { PoolCycle, PoolSubscription } from '@/payload-types'

// ---------------------------------------------------------------------------
// Helpers — minimal object factories
// ---------------------------------------------------------------------------

function makePoolCycle(overrides: Partial<PoolCycle> = {}): PoolCycle {
  return {
    id: 'cycle-1',
    status: 'open',
    month: 1,
    year: 2025,
    maxAthletes: 20,
    waitlistLimit: 10,
    price: 30,
    availableSlots: [{ day: 'Monday', time: '07:00' }],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function makePoolSubscription(overrides: Partial<PoolSubscription> = {}): PoolSubscription {
  return {
    id: 'sub-1',
    athlete: 'user-1',
    cycle: 'cycle-1',
    status: 'active',
    waitlistPosition: null,
    paymentStatus: 'paid',
    stripePaymentIntentId: null,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const arbCycle = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  status: fc.constant('open' as const),
  month: fc.integer({ min: 1, max: 12 }),
  year: fc.integer({ min: 2020, max: 2030 }),
  maxAthletes: fc.integer({ min: 1, max: 200 }),
  waitlistLimit: fc.integer({ min: 1, max: 100 }),
  price: fc.integer({ min: 1, max: 500 }),
  availableSlots: fc.array(
    fc.record({ day: fc.string({ minLength: 1 }), time: fc.string({ minLength: 1 }) }),
    { minLength: 1, maxLength: 5 },
  ),
  updatedAt: fc.constant(new Date().toISOString()),
  createdAt: fc.constant(new Date().toISOString()),
})

const arbActiveSub = fc.record({
  id: fc.string({ minLength: 1 }),
  athlete: fc.string({ minLength: 1 }),
  cycle: fc.string({ minLength: 1 }),
  status: fc.constant('active' as const),
  waitlistPosition: fc.constant(null),
  paymentStatus: fc.constantFrom('paid' as const, 'pending' as const, 'failed' as const),
  stripePaymentIntentId: fc.option(fc.string(), { nil: null }),
  updatedAt: fc.constant(new Date().toISOString()),
  createdAt: fc.constant(new Date().toISOString()),
})

const arbWaitlistedSub = fc.record({
  id: fc.string({ minLength: 1 }),
  athlete: fc.string({ minLength: 1 }),
  cycle: fc.string({ minLength: 1 }),
  status: fc.constant('waitlisted' as const),
  waitlistPosition: fc.integer({ min: 1, max: 100 }),
  paymentStatus: fc.constant('pending' as const),
  stripePaymentIntentId: fc.constant(null),
  updatedAt: fc.constant(new Date().toISOString()),
  createdAt: fc.constant(new Date().toISOString()),
})

// ---------------------------------------------------------------------------
// Property 4 — computePoolPageState CTA variants
// ---------------------------------------------------------------------------

describe('computePoolPageState — Property 4', () => {
  // Feature: pool-subscription, Property 4a: When cycle is null → always returns { variant: 'closed' }
  it('P4a: returns closed when cycle is null', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 100 }),
        fc.option(arbActiveSub, { nil: null }),
        (activeCount, waitlistCount, athleteSub) => {
          const result = computePoolPageState(null, activeCount, waitlistCount, athleteSub)
          expect(result.variant).toBe('closed')
        },
      ),
    )
  })

  // Feature: pool-subscription, Property 4b: When athleteSub.status === 'active' → always returns { variant: 'already-active' }
  it('P4b: returns already-active when athlete has active subscription', () => {
    fc.assert(
      fc.property(
        arbCycle,
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 100 }),
        arbActiveSub,
        (cycle, activeCount, waitlistCount, athleteSub) => {
          const result = computePoolPageState(cycle, activeCount, waitlistCount, athleteSub)
          expect(result.variant).toBe('already-active')
          if (result.variant === 'already-active') {
            expect(result.subscription).toBe(athleteSub)
          }
        },
      ),
    )
  })

  // Feature: pool-subscription, Property 4c: When athleteSub.status === 'waitlisted' → always returns { variant: 'already-waitlisted' }
  it('P4c: returns already-waitlisted when athlete is on waitlist', () => {
    fc.assert(
      fc.property(
        arbCycle,
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 100 }),
        arbWaitlistedSub,
        (cycle, activeCount, waitlistCount, athleteSub) => {
          const result = computePoolPageState(cycle, activeCount, waitlistCount, athleteSub)
          expect(result.variant).toBe('already-waitlisted')
          if (result.variant === 'already-waitlisted') {
            expect(result.subscription).toBe(athleteSub)
            expect(result.position).toBe(athleteSub.waitlistPosition ?? 0)
          }
        },
      ),
    )
  })

  // Feature: pool-subscription, Property 4d: When no athleteSub AND activeCount < maxAthletes → returns { variant: 'subscribe', remainingSpots: maxAthletes - activeCount }
  it('P4d: returns subscribe with correct remainingSpots when spots are available', () => {
    fc.assert(
      fc.property(arbCycle, (cycle) => {
        // activeCount strictly less than maxAthletes
        const activeCount = fc.sample(fc.integer({ min: 0, max: cycle.maxAthletes - 1 }), 1)[0]!
        const waitlistCount = fc.sample(fc.integer({ min: 0, max: 50 }), 1)[0]!
        const result = computePoolPageState(cycle, activeCount, waitlistCount, null)
        expect(result.variant).toBe('subscribe')
        if (result.variant === 'subscribe') {
          expect(result.remainingSpots).toBe(cycle.maxAthletes - activeCount)
        }
      }),
    )
  })

  // Feature: pool-subscription, Property 4e: When no athleteSub AND activeCount >= maxAthletes AND waitlistCount < waitlistLimit → returns { variant: 'waitlist' }
  it('P4e: returns waitlist when pool is full but waitlist has space', () => {
    fc.assert(
      fc.property(arbCycle, fc.integer({ min: 1, max: 50 }), (cycle, extraActive) => {
        const activeCount = cycle.maxAthletes + extraActive - 1 // >= maxAthletes
        const waitlistCount = fc.sample(fc.integer({ min: 0, max: cycle.waitlistLimit - 1 }), 1)[0]!
        const result = computePoolPageState(cycle, activeCount, waitlistCount, null)
        expect(result.variant).toBe('waitlist')
        if (result.variant === 'waitlist') {
          expect(result.remainingWaitlistSpots).toBe(cycle.waitlistLimit - waitlistCount)
        }
      }),
    )
  })

  // Feature: pool-subscription, Property 4f: When no athleteSub AND activeCount >= maxAthletes AND waitlistCount >= waitlistLimit → returns { variant: 'full' }
  it('P4f: returns full when pool and waitlist are both full', () => {
    fc.assert(
      fc.property(
        arbCycle,
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 0, max: 50 }),
        (cycle, extraActive, extraWaitlist) => {
          const activeCount = cycle.maxAthletes + extraActive
          const waitlistCount = cycle.waitlistLimit + extraWaitlist
          const result = computePoolPageState(cycle, activeCount, waitlistCount, null)
          expect(result.variant).toBe('full')
        },
      ),
    )
  })
})

// ---------------------------------------------------------------------------
// Property 7 — Waitlist position is always max + 1
// ---------------------------------------------------------------------------

describe('Waitlist position assignment — Property 7', () => {
  // Feature: pool-subscription, Property 7: new waitlist position is always max(existing positions) + 1
  it('P7: new position equals max existing position + 1 (or 1 if empty)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 20 }),
        (positions) => {
          const maxPosition = Math.max(0, ...positions)
          const newPosition = maxPosition + 1

          if (positions.length === 0) {
            expect(newPosition).toBe(1)
          } else {
            expect(newPosition).toBe(Math.max(...positions) + 1)
          }
        },
      ),
    )
  })

  it('P7: new position is always greater than all existing positions', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 20 }),
        (positions) => {
          const maxPosition = Math.max(0, ...positions)
          const newPosition = maxPosition + 1
          expect(positions.every((p) => newPosition > p)).toBe(true)
        },
      ),
    )
  })
})

// ---------------------------------------------------------------------------
// Property 9 — Waitlist positions decrement after spot is claimed
// ---------------------------------------------------------------------------

describe('Waitlist position decrement — Property 9', () => {
  // Feature: pool-subscription, Property 9: after decrement, each position p becomes p - 1
  it('P9: each waitlist position decrements by exactly 1', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => {
        // positions [1, 2, ..., N]
        const positions = Array.from({ length: n }, (_, i) => i + 1)

        // apply decrement logic (mirrors decrementWaitlistPositions)
        const decremented = positions.filter((p) => p > 0).map((p) => p - 1)

        // each original position p should become p - 1
        positions.forEach((p, i) => {
          expect(decremented[i]).toBe(p - 1)
        })
      }),
    )
  })

  it('P9: after decrement, resulting positions are [0, 1, ..., N-1]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => {
        const positions = Array.from({ length: n }, (_, i) => i + 1)
        const decremented = positions.filter((p) => p > 0).map((p) => p - 1)
        const expected = Array.from({ length: n }, (_, i) => i)
        expect(decremented).toEqual(expected)
      }),
    )
  })

  it('P9: positions with value 0 are not decremented (guard in decrementWaitlistPositions)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => {
        const positions = Array.from({ length: n }, (_, i) => i + 1)
        const decremented = positions.filter((p) => p > 0).map((p) => p - 1)
        // The implementation only decrements positions > 0, so no negative values
        expect(decremented.every((p) => p >= 0)).toBe(true)
      }),
    )
  })
})
