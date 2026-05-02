import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockConstructEvent = vi.hoisted(() => vi.fn())

vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('stripe', () => {
  function MockStripe() {
    return { webhooks: { constructEvent: mockConstructEvent } }
  }
  return { default: MockStripe }
})
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data: unknown, init?: { status?: number }) => ({
      data,
      status: init?.status ?? 200,
    })),
  },
}))

import { getPayload } from 'payload'
import { POST } from '../route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockPayload() {
  return {
    update: vi.fn(() => Promise.resolve({})),
    logger: { error: vi.fn() },
  }
}

function makeMockRequest(body: string, signature: string) {
  return {
    text: vi.fn(() => Promise.resolve(body)),
    headers: {
      get: vi.fn((key: string) => (key === 'stripe-signature' ? signature : null)),
    },
  }
}

function makePaymentIntent(recordId: string, intentId: string, type = 'pool-subscription') {
  return { id: intentId, metadata: { type, recordId } }
}

function makeStripeEvent(eventType: string, paymentIntent: object) {
  return { type: eventType, data: { object: paymentIntent } }
}

// ---------------------------------------------------------------------------
// Property 11 — Webhook correctly updates pool subscription on payment success
// ---------------------------------------------------------------------------

describe('Webhook — Property 11: payment success updates pool subscription', () => {
  // Feature: pool-subscription, Property 11: For any payment_intent.succeeded event
  // with metadata.type === 'pool-subscription' and a valid metadata.recordId,
  // the corresponding PoolSubscription should have paymentStatus updated to 'paid'
  // and status updated to 'active'.

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'sk_test_key'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  })

  it('P11: payload.update called with paymentStatus paid, status active, and correct id for any recordId', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (recordId, intentId) => {
          vi.clearAllMocks()

          const mockPayload = makeMockPayload()
          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)

          const intent = makePaymentIntent(recordId, intentId)
          mockConstructEvent.mockReturnValue(makeStripeEvent('payment_intent.succeeded', intent))

          await POST(makeMockRequest('{}', 'sig_test') as never)

          expect(mockPayload.update).toHaveBeenCalledWith(
            expect.objectContaining({
              collection: 'pool-subscriptions',
              id: recordId,
              data: expect.objectContaining({
                paymentStatus: 'paid',
                status: 'active',
                stripePaymentIntentId: intentId,
              }),
            }),
          )
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P11: update targets pool-subscriptions collection (not orders or subscription)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (recordId, intentId) => {
          vi.clearAllMocks()

          const mockPayload = makeMockPayload()
          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)

          mockConstructEvent.mockReturnValue(
            makeStripeEvent('payment_intent.succeeded', makePaymentIntent(recordId, intentId)),
          )

          await POST(makeMockRequest('{}', 'sig_test') as never)

          const calls = mockPayload.update.mock.calls as unknown as Array<[{ collection: string }]>
          expect(calls[0]?.[0]?.collection).toBe('pool-subscriptions')
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P11: stripePaymentIntentId in update data matches the intent id', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (recordId, intentId) => {
          vi.clearAllMocks()

          const mockPayload = makeMockPayload()
          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)

          mockConstructEvent.mockReturnValue(
            makeStripeEvent('payment_intent.succeeded', makePaymentIntent(recordId, intentId)),
          )

          await POST(makeMockRequest('{}', 'sig_test') as never)

          const calls = mockPayload.update.mock.calls as unknown as Array<
            [{ data: Record<string, unknown> }]
          >
          expect(calls[0]?.[0]?.data?.stripePaymentIntentId).toBe(intentId)
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P11: non-pool-subscription types do not update pool-subscriptions collection', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.constantFrom('order', 'subscription', 'group-subscription'),
        async (recordId, intentId, otherType) => {
          vi.clearAllMocks()

          const mockPayload = makeMockPayload()
          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)

          mockConstructEvent.mockReturnValue(
            makeStripeEvent(
              'payment_intent.succeeded',
              makePaymentIntent(recordId, intentId, otherType),
            ),
          )

          await POST(makeMockRequest('{}', 'sig_test') as never)

          const calls = mockPayload.update.mock.calls as unknown as Array<[{ collection: string }]>
          const poolCalls = calls.filter((c) => c[0]?.collection === 'pool-subscriptions')
          expect(poolCalls).toHaveLength(0)
        },
      ),
      { numRuns: 50 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 12 — Webhook correctly marks failure on payment failure
// ---------------------------------------------------------------------------

describe('Webhook — Property 12: payment failure marks pool subscription as failed', () => {
  // Feature: pool-subscription, Property 12: For any payment_intent.payment_failed event
  // with metadata.type === 'pool-subscription' and a valid metadata.recordId,
  // the corresponding PoolSubscription should have paymentStatus updated to 'failed'.

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'sk_test_key'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  })

  it('P12: payload.update called with paymentStatus failed for any recordId', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (recordId, intentId) => {
          vi.clearAllMocks()

          const mockPayload = makeMockPayload()
          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)

          mockConstructEvent.mockReturnValue(
            makeStripeEvent('payment_intent.payment_failed', makePaymentIntent(recordId, intentId)),
          )

          await POST(makeMockRequest('{}', 'sig_test') as never)

          expect(mockPayload.update).toHaveBeenCalledWith(
            expect.objectContaining({
              collection: 'pool-subscriptions',
              id: recordId,
              data: expect.objectContaining({ paymentStatus: 'failed' }),
            }),
          )
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P12: failure update does not set status to active', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (recordId, intentId) => {
          vi.clearAllMocks()

          const mockPayload = makeMockPayload()
          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)

          mockConstructEvent.mockReturnValue(
            makeStripeEvent('payment_intent.payment_failed', makePaymentIntent(recordId, intentId)),
          )

          await POST(makeMockRequest('{}', 'sig_test') as never)

          const calls = mockPayload.update.mock.calls as unknown as Array<
            [{ data: Record<string, unknown> }]
          >
          expect(calls[0]?.[0]?.data?.status).not.toBe('active')
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P12: failure update targets pool-subscriptions collection with correct id', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (recordId, intentId) => {
          vi.clearAllMocks()

          const mockPayload = makeMockPayload()
          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)

          mockConstructEvent.mockReturnValue(
            makeStripeEvent('payment_intent.payment_failed', makePaymentIntent(recordId, intentId)),
          )

          await POST(makeMockRequest('{}', 'sig_test') as never)

          const calls = mockPayload.update.mock.calls as unknown as Array<
            [{ collection: string; id: string }]
          >
          expect(calls[0]?.[0]?.collection).toBe('pool-subscriptions')
          expect(calls[0]?.[0]?.id).toBe(recordId)
        },
      ),
      { numRuns: 50 },
    )
  })

  it('P12: non-pool-subscription types do not update pool-subscriptions on failure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.constantFrom('order', 'subscription'),
        async (recordId, intentId, otherType) => {
          vi.clearAllMocks()

          const mockPayload = makeMockPayload()
          vi.mocked(getPayload).mockResolvedValue(mockPayload as never)

          mockConstructEvent.mockReturnValue(
            makeStripeEvent(
              'payment_intent.payment_failed',
              makePaymentIntent(recordId, intentId, otherType),
            ),
          )

          await POST(makeMockRequest('{}', 'sig_test') as never)

          const calls = mockPayload.update.mock.calls as unknown as Array<[{ collection: string }]>
          const poolCalls = calls.filter((c) => c[0]?.collection === 'pool-subscriptions')
          expect(poolCalls).toHaveLength(0)
        },
      ),
      { numRuns: 50 },
    )
  })
})
