'use server'

import Stripe from 'stripe'

export type CreatePaymentIntentArgs = {
  amount: number // in EUR cents
  currency?: string
  metadata?: Record<string, string>
  description?: string
  customer?: {
    name: string
    email: string
  }
}

export type CreatePaymentIntentResult =
  | { clientSecret: string; paymentIntentId: string; error: undefined }
  | { clientSecret: undefined; paymentIntentId: undefined; error: string }

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not defined')
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
}

export async function createPaymentIntent({
  amount,
  currency = 'eur',
  metadata = {},
  description,
  customer,
}: CreatePaymentIntentArgs): Promise<CreatePaymentIntentResult> {
  try {
    const stripe = getStripe()

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card', 'mb_way'],
      metadata,
      description,
      ...(customer && {
        receipt_email: customer.email,
        metadata: {
          ...metadata,
          customer_name: customer.name,
          customer_email: customer.email,
        },
      }),
    })

    if (!paymentIntent.client_secret) {
      return {
        clientSecret: undefined,
        paymentIntentId: undefined,
        error: 'Failed to create payment intent: no client secret returned',
      }
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      error: undefined,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { clientSecret: undefined, paymentIntentId: undefined, error: message }
  }
}
