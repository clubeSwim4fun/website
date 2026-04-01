import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Stripe webhook handler.
 *
 * Listens for payment_intent.succeeded and payment_intent.payment_failed.
 * The PaymentIntent metadata must include:
 *   - type: 'order' | 'subscription' | 'group-subscription' | 'pool-subscription'
 *   - recordId: the Payload document ID to update
 */
export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-03-25.dahlia' })

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    await handlePaymentSuccess(payload, intent)
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    await handlePaymentFailure(payload, intent)
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSuccess(
  payload: Awaited<ReturnType<typeof getPayload>>,
  intent: Stripe.PaymentIntent,
) {
  const { type, recordId } = intent.metadata || {}

  if (!type || !recordId) return

  if (type === 'order') {
    await payload.update({
      collection: 'orders',
      id: recordId,
      data: { paymentStatus: 'paid', stripePaymentIntentId: intent.id },
    })
  }

  if (type === 'subscription') {
    await payload.update({
      collection: 'subscription',
      id: recordId,
      data: { paymentStatus: 'paid', stripePaymentIntentId: intent.id },
    })
  }

  if (type === 'group-subscription') {
    await payload.update({
      collection: 'group-subscription',
      id: recordId,
      data: { transactionId: intent.id },
    })
  }

  if (type === 'pool-subscription') {
    await payload.update({
      collection: 'pool-subscriptions',
      id: recordId,
      data: { paymentStatus: 'paid', status: 'active', stripePaymentIntentId: intent.id },
    })
  }
}

async function handlePaymentFailure(
  payload: Awaited<ReturnType<typeof getPayload>>,
  intent: Stripe.PaymentIntent,
) {
  const { type, recordId } = intent.metadata || {}

  if (!type || !recordId) return

  if (type === 'order') {
    await payload.update({
      collection: 'orders',
      id: recordId,
      data: { paymentStatus: 'failed' },
    })
  }

  if (type === 'subscription') {
    await payload.update({
      collection: 'subscription',
      id: recordId,
      data: { paymentStatus: 'failed' },
    })
  }

  if (type === 'pool-subscription') {
    await payload.update({
      collection: 'pool-subscriptions',
      id: recordId,
      data: { paymentStatus: 'failed' },
    })
  }
}
