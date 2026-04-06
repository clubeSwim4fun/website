// Feature: invoicexpress-integration, Property 4: IVA0 invariant on all line items

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// Stub env vars before any module import
// ---------------------------------------------------------------------------
vi.stubEnv('INVOICEXPRESS_ACCOUNT_NAME', 'test-account')
vi.stubEnv('INVOICEXPRESS_API_KEY', 'test-api-key')

import { createDraftInvoice } from '@/helpers/invoiceHelper'
import type { CreateDraftInvoiceArgs } from '@/helpers/invoiceHelper'

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const arbLineItem = fc.record({
  name: fc.string({ minLength: 1, maxLength: 80 }),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  unit_price: fc.integer({ min: 1, max: 999999 }).map((cents) => (cents / 100).toFixed(2)),
  quantity: fc.integer({ min: 1, max: 100 }),
  tax: fc.constant({ name: 'IVA0' as const }),
})

const arbUser = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  surname: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  associateId: fc.oneof(
    fc.integer({ min: 1, max: 99999 }),
    fc.string({ minLength: 1, maxLength: 10 }),
  ),
  nif: fc.option(fc.stringMatching(/^\d{9}$/), { nil: null }),
})

const arbContext = fc.constantFrom(
  'order' as const,
  'subscription' as const,
  'group-subscription' as const,
)

// ---------------------------------------------------------------------------
// Property 4: IVA0 invariant on all line items
// Validates: Requirements 2.4
// ---------------------------------------------------------------------------

describe('createDraftInvoice — Property 4: IVA0 invariant on all line items', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({ invoice: { id: 1, sequence_number: '2025/1', status: 'draft' } }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        ),
      )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('every item in the constructed request body has tax.name === "IVA0" for any array of line items', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUser,
        fc.array(arbLineItem, { minLength: 1, maxLength: 20 }),
        arbContext,
        async (user, lineItems, context) => {
          fetchSpy.mockClear()

          const args: CreateDraftInvoiceArgs = { user, lineItems, context }
          await createDraftInvoice(args)

          expect(fetchSpy).toHaveBeenCalledOnce()

          const [, init] = fetchSpy.mock.calls[0]!
          const body = JSON.parse(init?.body as string) as {
            invoice: { items: { tax: { name: string } }[] }
          }

          const items = body.invoice.items
          expect(items).toHaveLength(lineItems.length)
          for (const item of items) {
            expect(item.tax.name).toBe('IVA0')
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
