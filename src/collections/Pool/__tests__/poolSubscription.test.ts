import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

// Mock all external dependencies
vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/utilities/getMeUser', () => ({ getMeUser: vi.fn() }))
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => Promise.resolve((key: string) => key)),
}))
vi.mock('@/helpers/emailHelper', () => ({ sendEmail: vi.fn() }))
vi.mock('@react-email/components', () => ({ render: vi.fn(() => Promise.resolve('<html>')) }))
vi.mock('react', () => ({
  default: { createElement: vi.fn() },
  createElement: vi.fn(),
}))
vi.mock('@/helpers/poolHelper', () => ({
  notifyWaitlist: vi.fn(() => Promise.resolve()),
  getOpenCycle: vi.fn(),
  getActiveCount: vi.fn(),
  getWaitlistCount: vi.fn(),
  getAthleteSubscription: vi.fn(),
  computePoolPageState: vi.fn(),
  decrementWaitlistPositions: vi.fn(),
}))

// Dynamic import mocks for email templates
vi.mock('@/email/poolSubscriptionConfirmation', () => ({ default: vi.fn() }))
vi.mock('@/email/poolWaitlistConfirmation', () => ({ default: vi.fn() }))
vi.mock('@/email/poolCancellationConfirmation', () => ({ default: vi.fn() }))

import { getPayload } from 'payload'
import { getMeUser } from '@/utilities/getMeUser'
import { sendEmail } from '@/helpers/emailHelper'
import { notifyWaitlist } from '@/helpers/poolHelper'
import {
  createPoolSubscription,
  joinPoolWaitlist,
  cancelPoolSubscription,
} from '@/actions/pool-subscription'

// ---------------------------------------------------------------------------
// Helpers — mock factories
// ---------------------------------------------------------------------------

function makeOpenCycle(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cycle-1',
    status: 'open',
    month: 6,
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

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test',
    surname: 'User',
    role: 'default',
    ...overrides,
  }
}

function makeSubscription(overrides: Record<string, unknown> = {}) {
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

function makeMockPayload(overrides: Record<string, unknown> = {}) {
  return {
    db: {
      beginTransaction: vi.fn(() => Promise.resolve('tx-1')),
      commitTransaction: vi.fn(() => Promise.resolve()),
      rollbackTransaction: vi.fn(() => Promise.resolve()),
    },
    findByID: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    logger: { error: vi.fn() },
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Property 5 — createPoolSubscription produces correct initial state
// ---------------------------------------------------------------------------

describe('createPoolSubscription — Property 5', () => {
  // Feature: pool-subscription, Property 5: For any valid cycleId and stripePaymentIntentId,
  // the created subscription should have status: 'active' and paymentStatus: 'paid'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('P5: created subscription has status active and paymentStatus paid for any valid inputs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (cycleId, stripePaymentIntentId) => {
          const mockPayload = makeMockPayload()
          const openCycle = makeOpenCycle({ id: cycleId })
          const createdSub = makeSubscription({
            cycle: cycleId,
            stripePaymentIntentId,
            status: 'active',
            paymentStatus: 'paid',
          })

          mockPayload.findByID.mockResolvedValue(openCycle)
          // First find: active count check → 0 active subs
          // Second find: existing athlete sub check → 0 existing
          mockPayload.find
            .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
            .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
          mockPayload.create.mockResolvedValue(createdSub)

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user: makeUser() } as never)

          const result = await createPoolSubscription(cycleId, stripePaymentIntentId)

          expect(result.success).toBe(true)

          // Verify create was called with correct initial state
          const createCall = mockPayload.create.mock.calls[0]?.[0]
          expect(createCall?.data?.status).toBe('active')
          expect(createCall?.data?.paymentStatus).toBe('paid')
          expect(createCall?.data?.stripePaymentIntentId).toBe(stripePaymentIntentId)
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P5: returned subscriptionId matches the created document id', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (cycleId, paymentIntentId, subId) => {
          const mockPayload = makeMockPayload()
          mockPayload.findByID.mockResolvedValue(makeOpenCycle({ id: cycleId }))
          mockPayload.find
            .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
            .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
          mockPayload.create.mockResolvedValue(makeSubscription({ id: subId }))

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user: makeUser() } as never)

          const result = await createPoolSubscription(cycleId, paymentIntentId)

          expect(result.success).toBe(true)
          expect(result.subscriptionId).toBe(subId)
        },
      ),
      { numRuns: 50 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 2 — Closed cycle blocks subscription creation
// ---------------------------------------------------------------------------

describe('createPoolSubscription — Property 2 (closed cycle)', () => {
  // Feature: pool-subscription, Property 2: For any PoolCycle with status 'closed',
  // attempting to create a PoolSubscription should fail regardless of athlete or capacity

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('P2: returns { success: false } for any cycleId when cycle is closed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (cycleId, paymentIntentId) => {
          const mockPayload = makeMockPayload()
          mockPayload.findByID.mockResolvedValue(makeOpenCycle({ id: cycleId, status: 'closed' }))

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user: makeUser() } as never)

          const result = await createPoolSubscription(cycleId, paymentIntentId)

          expect(result.success).toBe(false)
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P2: rollbackTransaction is called when cycle is closed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (cycleId, paymentIntentId) => {
          const mockPayload = makeMockPayload()
          mockPayload.findByID.mockResolvedValue(makeOpenCycle({ id: cycleId, status: 'closed' }))

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user: makeUser() } as never)

          await createPoolSubscription(cycleId, paymentIntentId)

          expect(mockPayload.db.rollbackTransaction).toHaveBeenCalledWith('tx-1')
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P2: no subscription is created when cycle is closed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (cycleId, paymentIntentId) => {
          const mockPayload = makeMockPayload()
          mockPayload.findByID.mockResolvedValue(makeOpenCycle({ id: cycleId, status: 'closed' }))

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user: makeUser() } as never)

          await createPoolSubscription(cycleId, paymentIntentId)

          expect(mockPayload.create).not.toHaveBeenCalled()
        },
      ),
      { numRuns: 50 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 3 — Athlete uniqueness per cycle
// ---------------------------------------------------------------------------

describe('createPoolSubscription — Property 3 (athlete uniqueness)', () => {
  // Feature: pool-subscription, Property 3: If an athlete already has an active or waitlisted
  // subscription for a cycle, attempting to create a second one should fail

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('P3: returns { success: false } when athlete already has an active subscription', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (cycleId, paymentIntentId) => {
          const mockPayload = makeMockPayload()
          const existingSub = makeSubscription({ cycle: cycleId, status: 'active' })

          mockPayload.findByID.mockResolvedValue(makeOpenCycle({ id: cycleId }))
          // First find: active count check → 0 (cycle has space)
          // Second find: existing athlete sub check → 1 existing active sub
          mockPayload.find
            .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
            .mockResolvedValueOnce({ totalDocs: 1, docs: [existingSub] })

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user: makeUser() } as never)

          const result = await createPoolSubscription(cycleId, paymentIntentId)

          expect(result.success).toBe(false)
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P3: returns { success: false } when athlete already has a waitlisted subscription', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (cycleId, paymentIntentId) => {
          const mockPayload = makeMockPayload()
          const existingSub = makeSubscription({
            cycle: cycleId,
            status: 'waitlisted',
            paymentStatus: 'pending',
            waitlistPosition: 1,
          })

          mockPayload.findByID.mockResolvedValue(makeOpenCycle({ id: cycleId }))
          mockPayload.find
            .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
            .mockResolvedValueOnce({ totalDocs: 1, docs: [existingSub] })

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user: makeUser() } as never)

          const result = await createPoolSubscription(cycleId, paymentIntentId)

          expect(result.success).toBe(false)
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P3: no second subscription is created when one already exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.constantFrom('active' as const, 'waitlisted' as const),
        async (cycleId, paymentIntentId, existingStatus) => {
          const mockPayload = makeMockPayload()
          const existingSub = makeSubscription({ cycle: cycleId, status: existingStatus })

          mockPayload.findByID.mockResolvedValue(makeOpenCycle({ id: cycleId }))
          mockPayload.find
            .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
            .mockResolvedValueOnce({ totalDocs: 1, docs: [existingSub] })

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user: makeUser() } as never)

          await createPoolSubscription(cycleId, paymentIntentId)

          expect(mockPayload.create).not.toHaveBeenCalled()
        },
      ),
      { numRuns: 50 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 8 — Cancellation sets status and triggers notification
// ---------------------------------------------------------------------------

describe('cancelPoolSubscription — Property 8', () => {
  // Feature: pool-subscription, Property 8: After cancelPoolSubscription is called,
  // the subscription status should be 'cancelled' and notifyWaitlist should be triggered

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('P8: returns { success: true } for any active subscription', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (subscriptionId, cycleId) => {
          const mockPayload = makeMockPayload()
          const user = makeUser()
          const sub = makeSubscription({
            id: subscriptionId,
            athlete: user.id,
            cycle: cycleId,
            status: 'active',
          })

          mockPayload.findByID.mockResolvedValue(sub)
          mockPayload.update.mockResolvedValue({ ...sub, status: 'cancelled' })

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user } as never)

          const result = await cancelPoolSubscription(subscriptionId)

          expect(result.success).toBe(true)
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P8: payload.update is called with status: cancelled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (subscriptionId, cycleId) => {
          const mockPayload = makeMockPayload()
          const user = makeUser()
          const sub = makeSubscription({
            id: subscriptionId,
            athlete: user.id,
            cycle: cycleId,
            status: 'active',
          })

          mockPayload.findByID.mockResolvedValue(sub)
          mockPayload.update.mockResolvedValue({ ...sub, status: 'cancelled' })

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user } as never)

          await cancelPoolSubscription(subscriptionId)

          expect(mockPayload.update).toHaveBeenCalledWith(
            expect.objectContaining({
              collection: 'pool-subscriptions',
              id: subscriptionId,
              data: expect.objectContaining({ status: 'cancelled' }),
            }),
          )
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P8: notifyWaitlist is called after cancellation (fire-and-forget)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (subscriptionId, cycleId) => {
          vi.clearAllMocks()
          const mockPayload = makeMockPayload()
          const user = makeUser()
          const sub = makeSubscription({
            id: subscriptionId,
            athlete: user.id,
            cycle: cycleId,
            status: 'active',
          })

          mockPayload.findByID.mockResolvedValue(sub)
          mockPayload.update.mockResolvedValue({ ...sub, status: 'cancelled' })

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user } as never)

          await cancelPoolSubscription(subscriptionId)

          // Flush microtask queue to let fire-and-forget IIFEs run
          await new Promise((resolve) => setTimeout(resolve, 0))

          expect(notifyWaitlist).toHaveBeenCalledWith(cycleId)
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P8: cancellation works for waitlisted subscriptions too', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        async (subscriptionId, cycleId, waitlistPosition) => {
          const mockPayload = makeMockPayload()
          const user = makeUser()
          const sub = makeSubscription({
            id: subscriptionId,
            athlete: user.id,
            cycle: cycleId,
            status: 'waitlisted',
            waitlistPosition,
            paymentStatus: 'pending',
          })

          mockPayload.findByID.mockResolvedValue(sub)
          mockPayload.update.mockResolvedValue({ ...sub, status: 'cancelled' })

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user } as never)

          const result = await cancelPoolSubscription(subscriptionId)

          expect(result.success).toBe(true)
          expect(mockPayload.update).toHaveBeenCalledWith(
            expect.objectContaining({
              data: expect.objectContaining({ status: 'cancelled' }),
            }),
          )
        },
      ),
      { numRuns: 50 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 10 — Email sent on every lifecycle event
// ---------------------------------------------------------------------------

describe('Email notifications — Property 10', () => {
  // Feature: pool-subscription, Property 10: sendEmail should be called for every
  // subscription lifecycle event (create active, create waitlisted, cancel)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('P10: sendEmail is called after successful createPoolSubscription', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (cycleId, paymentIntentId) => {
          vi.clearAllMocks()
          const mockPayload = makeMockPayload()
          const user = makeUser()
          const createdSub = makeSubscription({
            cycle: cycleId,
            stripePaymentIntentId: paymentIntentId,
          })

          mockPayload.findByID.mockResolvedValue(makeOpenCycle({ id: cycleId }))
          mockPayload.find
            .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
            .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
          mockPayload.create.mockResolvedValue(createdSub)

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user } as never)

          const result = await createPoolSubscription(cycleId, paymentIntentId)
          expect(result.success).toBe(true)

          // Flush microtask queue to let fire-and-forget IIFE run
          await new Promise((resolve) => setTimeout(resolve, 0))

          expect(sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
              to: user.email,
              subject: expect.any(String),
              emailHtml: expect.any(String),
            }),
          )
        },
      ),
      { numRuns: 30 },
    )
  })

  it('P10: sendEmail is called after successful joinPoolWaitlist', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1, maxLength: 20 }), async (cycleId) => {
        vi.clearAllMocks()
        const mockPayload = makeMockPayload()
        const user = makeUser()
        const cycle = makeOpenCycle({ id: cycleId, maxAthletes: 5 })
        const createdSub = makeSubscription({
          cycle: cycleId,
          status: 'waitlisted',
          paymentStatus: 'pending',
          waitlistPosition: 1,
        })

        mockPayload.findByID.mockResolvedValue(cycle)
        // active count >= maxAthletes (cycle is full)
        mockPayload.find
          .mockResolvedValueOnce({ totalDocs: 5, docs: [] }) // active count
          .mockResolvedValueOnce({ totalDocs: 0, docs: [] }) // waitlist count
          .mockResolvedValueOnce({ totalDocs: 0, docs: [] }) // existing athlete sub
          .mockResolvedValueOnce({ totalDocs: 0, docs: [] }) // waitlisted subs for position calc
        mockPayload.create.mockResolvedValue(createdSub)

        vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
        vi.mocked(getMeUser).mockResolvedValue({ user } as never)

        const result = await joinPoolWaitlist(cycleId)
        expect(result.success).toBe(true)

        // Flush microtask queue
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(sendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: user.email,
            subject: expect.any(String),
            emailHtml: expect.any(String),
          }),
        )
      }),
      { numRuns: 30 },
    )
  })

  it('P10: sendEmail is called after successful cancelPoolSubscription', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (subscriptionId, cycleId) => {
          vi.clearAllMocks()
          const mockPayload = makeMockPayload()
          const user = makeUser()
          const sub = makeSubscription({
            id: subscriptionId,
            athlete: user.id,
            cycle: cycleId,
            status: 'active',
          })

          mockPayload.findByID.mockResolvedValue(sub)
          mockPayload.update.mockResolvedValue({ ...sub, status: 'cancelled' })

          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
          vi.mocked(getMeUser).mockResolvedValue({ user } as never)

          const result = await cancelPoolSubscription(subscriptionId)
          expect(result.success).toBe(true)

          // Flush microtask queue
          await new Promise((resolve) => setTimeout(resolve, 0))

          expect(sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
              to: user.email,
              subject: expect.any(String),
              emailHtml: expect.any(String),
            }),
          )
        },
      ),
      { numRuns: 30 },
    )
  })
})
