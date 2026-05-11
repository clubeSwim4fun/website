import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getMonthLabel } from '@/collections/Pool/PoolCycles'

/**
 * Stripe webhook handler.
 *
 * Handles:
 *   - payment_intent.succeeded       → mark paid, send email, create invoice
 *   - payment_intent.processing      → mark processing (MB Way async)
 *   - payment_intent.payment_failed  → mark failed
 *   - payment_intent.canceled        → mark failed/canceled
 *
 * PaymentIntent metadata must include:
 *   - type: 'order' | 'subscription' | 'group-subscription' | 'pool-subscription' | 'form-payment'
 *   - recordId: the Payload document ID to update
 */
export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecretKey || !webhookSecret) {
    console.error('[webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-03-25.dahlia' })

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  console.log('[webhook] Received request, signature present:', !!signature)

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook] Signature verification failed:', message)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    )
  }

  console.log('[webhook] Event received:', event.type, (event.data.object as any)?.metadata)

  const payload = await getPayload({ config })

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSuccess(payload, intent)
      break
    }
    case 'payment_intent.processing': {
      // MB Way and other async methods land here first — mark as processing so the record
      // isn't left as pending indefinitely while awaiting bank confirmation.
      const intent = event.data.object as Stripe.PaymentIntent
      await handlePaymentProcessing(payload, intent)
      break
    }
    case 'payment_intent.payment_failed':
    case 'payment_intent.canceled': {
      const intent = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailure(payload, intent)
      break
    }
  }

  return NextResponse.json({ received: true })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function handlePaymentProcessing(
  payload: Awaited<ReturnType<typeof getPayload>>,
  intent: Stripe.PaymentIntent,
) {
  const { type, recordId } = intent.metadata || {}
  if (!type || !recordId) return

  // Add a 'processing' status to collections that support it; others stay pending.
  // Currently only orders and subscriptions have a paymentStatus field.
  if (type === 'order') {
    await payload.update({
      collection: 'orders',
      id: recordId,
      data: { paymentStatus: 'pending' }, // no 'processing' option — leave as pending
    })
  }

  if (type === 'subscription') {
    await payload.update({
      collection: 'subscription',
      id: recordId,
      data: { paymentStatus: 'pending' },
    })
  }

  if (type === 'pool-subscription') {
    await payload.update({
      collection: 'pool-subscriptions',
      id: recordId,
      data: { paymentStatus: 'pending' },
    })
  }

  if (type === 'form-payment') {
    await payload.update({
      collection: 'form-payments',
      id: recordId,
      data: { paymentStatus: 'pending' },
    })
  }

  if (type === 'group-subscription') {
    // group-subscription has no processing state — leave as pending until succeeded
  }
}

async function handlePaymentSuccess(
  payload: Awaited<ReturnType<typeof getPayload>>,
  intent: Stripe.PaymentIntent,
) {
  const { type, recordId } = intent.metadata || {}

  if (!type || !recordId) return

  if (type === 'form-payment') {
    await handleFormPaymentSuccess(payload, intent)
    return
  }

  if (type === 'order') {
    await payload.update({
      collection: 'orders',
      id: recordId,
      data: { paymentStatus: 'paid', stripePaymentIntentId: intent.id },
    })

    // Fire-and-forget: clear cart + send confirmation email + create invoice
    ;(async () => {
      try {
        const order = await payload.findByID({ collection: 'orders', id: recordId, depth: 3 })

        // Clear the cart now that payment is confirmed
        if (order.cartId) {
          try {
            await payload.update({
              collection: 'carts',
              id: order.cartId,
              data: { items: [], totalPrice: 0 },
            })
          } catch (cartErr) {
            console.error('[webhook] Failed to clear cart:', cartErr)
          }
        }

        const user =
          typeof order.user === 'string'
            ? await payload.findByID({ collection: 'users', id: order.user })
            : order.user

        // Confirmation email
        try {
          const React = await import('react')
          const { render } = await import('@react-email/components')
          const { OrderConfirmationEmail } = await import('@/email/orderConfirmationEmail')
          const { sendEmail } = await import('@/helpers/emailHelper')
          const locale = (intent.metadata?.locale as 'pt' | 'en') ?? 'pt'
          const emailHtml = await render(
            React.default.createElement(OrderConfirmationEmail, { order, locale }),
          )
          const subject = locale === 'en' ? 'Order confirmation' : 'Confirmação de encomenda'
          if (user.email) {
            await sendEmail({ emailHtml, subject, to: user.email })
          }
        } catch (emailErr) {
          console.error('[webhook] Order confirmation email failed:', emailErr)
        }

        // Invoice
        const { createDraftInvoice } = await import('@/helpers/invoiceHelper')
        const lineItemMap = new Map<
          string,
          {
            name: string
            description: string
            unit_price: string
            quantity: number
            tax: { name: 'IVA0' }
          }
        >()
        order.events?.forEach((eventEntry) => {
          const event = eventEntry.event as { title?: unknown } | null
          eventEntry.tickets?.forEach((ticketEntry) => {
            const ticket = ticketEntry.ticket as { name?: unknown; price?: number } | null
            if (!event || !ticket) return
            const resolveLocalized = (val: unknown): string => {
              if (typeof val === 'string') return val
              if (val && typeof val === 'object') {
                const obj = val as Record<string, string>
                return obj['pt'] ?? obj['en'] ?? Object.values(obj)[0] ?? ''
              }
              return String(val ?? '')
            }
            const eventTitle = resolveLocalized(event.title)
            const ticketName = resolveLocalized(ticket.name)
            const key = `${eventTitle}__${ticketName}`
            const existing = lineItemMap.get(key)
            if (existing) {
              existing.quantity += 1
            } else {
              lineItemMap.set(key, {
                name: eventTitle,
                description: ticketName,
                unit_price: (ticket.price ?? 0).toFixed(2),
                quantity: 1,
                tax: { name: 'IVA0' },
              })
            }
          })
        })

        await createDraftInvoice({
          user: {
            name: user.name,
            surname: user.surname,
            email: user.email,
            associateId: user.associateId ?? '',
            nif: user.nif,
          },
          lineItems: Array.from(lineItemMap.values()),
          context: 'order',
          stripePaymentIntentId: intent.id,
        })
      } catch (err) {
        console.error('[webhook] Order post-payment tasks failed:', err)
      }
    })()
  }

  if (type === 'subscription') {
    // Activate user + mark paid in a transaction
    const transactionID = await payload.db.beginTransaction()
    if (transactionID) {
      try {
        const subscription = await payload.findByID({
          collection: 'subscription',
          id: recordId,
          depth: 1,
          req: { transactionID },
        })

        await payload.update({
          collection: 'subscription',
          id: recordId,
          data: { paymentStatus: 'paid', stripePaymentIntentId: intent.id },
          req: { transactionID },
        })

        const userId =
          typeof subscription.user === 'string' ? subscription.user : subscription.user?.id
        if (userId) {
          // Find the "socio" group by slug
          const socioGroupResult = await payload.find({
            collection: 'groups',
            where: { slug: { equals: 'socio' } },
            limit: 1,
            req: { transactionID },
          })
          const socioGroup = socioGroupResult.docs[0]

          const userRecord = await payload.findByID({
            collection: 'users',
            id: userId,
            depth: 0,
            req: { transactionID },
          })

          const existingGroups: { relationTo: string; value: string }[] = (
            (userRecord.groups as any[]) ?? []
          ).map((g: any) =>
            typeof g === 'string'
              ? { relationTo: 'groups', value: g }
              : {
                  relationTo: g.relationTo ?? 'groups',
                  value: typeof g.value === 'string' ? g.value : g.value?.id,
                },
          )

          const groupsData =
            socioGroup &&
            !existingGroups.some((g) => g.relationTo === 'groups' && g.value === socioGroup.id)
              ? [...existingGroups, { relationTo: 'groups', value: socioGroup.id }]
              : existingGroups

          await payload.update({
            collection: 'users',
            id: userId,
            data: { status: 'active', groups: groupsData as any },
            req: { transactionID },
          })
        }

        await payload.db.commitTransaction(transactionID)
      } catch (err) {
        await payload.db.rollbackTransaction(transactionID)
        console.error('[webhook] subscription activation failed:', err)
        return
      }
    }

    // Fire-and-forget: send confirmation email + create invoice
    ;(async () => {
      try {
        const subscription = await payload.findByID({
          collection: 'subscription',
          id: recordId,
          depth: 1,
        })

        const user =
          typeof subscription.user === 'string'
            ? await payload.findByID({ collection: 'users', id: subscription.user })
            : subscription.user

        if (!user) return

        // Confirmation email
        try {
          const React = await import('react')
          const { render } = await import('@react-email/components')
          const { SubscriptionConfirmationEmail } = await import('@/email/subscriptionConfirmation')
          const { sendEmail } = await import('@/helpers/emailHelper')
          const emailHtml = await render(
            React.default.createElement(SubscriptionConfirmationEmail, {
              subscription,
              locale: 'pt',
            }),
          )
          if (user.email) {
            await sendEmail({ emailHtml, subject: 'Confirmação de subscrição', to: user.email })
          }
        } catch (emailErr) {
          console.error('[webhook] Subscription confirmation email failed:', emailErr)
        }

        // Invoice
        const { createDraftInvoice } = await import('@/helpers/invoiceHelper')
        const startDate = subscription.startDate ? subscription.startDate.slice(0, 10) : ''
        const endDate = subscription.endDate ? subscription.endDate.slice(0, 10) : ''

        const { getCachedGlobal } = await import('@/utilities/getGlobals')
        const globalConfig = (await getCachedGlobal(
          'generalConfigs',
          1,
          'pt',
        )()) as import('@/payload-types').GeneralConfig
        const registrationFee = globalConfig?.associationFees?.registrationFee ?? 0

        const previousSubs = await payload.find({
          collection: 'subscription',
          where: {
            and: [
              {
                user: {
                  equals:
                    typeof subscription.user === 'string'
                      ? subscription.user
                      : subscription.user?.id,
                },
              },
              { id: { not_equals: recordId } },
              { type: { equals: 'memberFee' } },
            ],
          },
          limit: 1,
        })
        const isFirstPayment = previousSubs.totalDocs === 0 && registrationFee > 0
        const monthlyAmount = isFirstPayment
          ? (subscription.amount ?? 0) - registrationFee
          : (subscription.amount ?? 0)

        const lineItems: Parameters<typeof createDraftInvoice>[0]['lineItems'] = []
        if (isFirstPayment) {
          lineItems.push({
            name: 'Jóia',
            description: 'Quota de inscrição (pagamento único anual)',
            unit_price: registrationFee.toFixed(2),
            quantity: 1,
            tax: { name: 'IVA0' },
          })
        }
        lineItems.push({
          name: 'Quota de sócio',
          description: `${startDate} – ${endDate}`,
          unit_price: monthlyAmount.toFixed(2),
          quantity: 1,
          tax: { name: 'IVA0' },
        })

        await createDraftInvoice({
          user: {
            name: user.name,
            surname: user.surname,
            email: user.email,
            associateId: user.associateId ?? '',
            nif: user.nif,
          },
          lineItems,
          context: 'subscription',
          stripePaymentIntentId: intent.id,
        })
      } catch (err) {
        console.error('[webhook] Subscription post-payment tasks failed:', err)
      }
    })()
  }

  if (type === 'group-subscription') {
    await payload.update({
      collection: 'group-subscription',
      id: recordId,
      data: { transactionId: intent.id, paymentStatus: 'paid' },
    })

    // Fire-and-forget invoice creation
    ;(async () => {
      try {
        const { createDraftInvoice } = await import('@/helpers/invoiceHelper')

        const record = await payload.findByID({
          collection: 'group-subscription',
          id: recordId,
          depth: 2,
        })

        const group = record.group as {
          title?: string
          subscriptionPrice?: number
          subscriptionPeriod?: string
        }
        const user =
          typeof record.user === 'string'
            ? await payload.findByID({ collection: 'users', id: record.user })
            : record.user

        const period = group.subscriptionPeriod === 'monthly' ? 'mensal' : 'anual'

        await createDraftInvoice({
          user: {
            name: user.name,
            surname: user.surname,
            email: user.email,
            associateId: user.associateId ?? '',
            nif: user.nif,
          },
          lineItems: [
            {
              name: group.title ?? '',
              description: `Subscrição ${period} — ${group.title ?? ''}`,
              unit_price: (group.subscriptionPrice ?? 0).toFixed(2),
              quantity: 1,
              tax: { name: 'IVA0' },
            },
          ],
          context: 'group-subscription',
          stripePaymentIntentId: intent.id,
        })
      } catch (err) {
        console.error('[webhook] Group subscription invoice creation failed:', err)
      }
    })()
  }

  if (type === 'pool-subscription') {
    await payload.update({
      collection: 'pool-subscriptions',
      id: recordId,
      data: { paymentStatus: 'paid', status: 'active', stripePaymentIntentId: intent.id },
    })

    // Fire-and-forget: send confirmation email + create invoice
    ;(async () => {
      try {
        const record = await payload.findByID({
          collection: 'pool-subscriptions',
          id: recordId,
          depth: 2,
        })

        const cycle = record.cycle as { month?: string; year?: number; price?: number } | null
        const user =
          typeof record.athlete === 'string'
            ? await payload.findByID({ collection: 'users', id: record.athlete })
            : record.athlete

        // Confirmation email
        try {
          const React = await import('react')
          const { render } = await import('@react-email/components')
          const { default: PoolSubscriptionConfirmationEmail } = await import(
            '@/email/poolSubscriptionConfirmation'
          )
          const { sendEmail } = await import('@/helpers/emailHelper')
          const emailHtml = await render(
            React.default.createElement(PoolSubscriptionConfirmationEmail, {
              subscription: record,
            }),
          )
          if (user.email) {
            await sendEmail({ emailHtml, subject: 'Pool subscription confirmed', to: user.email })
          }
        } catch (emailErr) {
          console.error('[webhook] Pool subscription confirmation email failed:', emailErr)
        }

        // Invoice
        const { createDraftInvoice } = await import('@/helpers/invoiceHelper')
        const monthLabel = cycle?.month ? getMonthLabel(cycle.month, 'pt') : ''

        await createDraftInvoice({
          user: {
            name: user.name,
            surname: user.surname,
            email: user.email,
            associateId: user.associateId ?? '',
            nif: user.nif,
          },
          lineItems: [
            {
              name: 'Quota de piscina',
              description: `${monthLabel} ${cycle?.year ?? ''}`,
              unit_price: (cycle?.price ?? 0).toFixed(2),
              quantity: 1,
              tax: { name: 'IVA0' },
            },
          ],
          context: 'pool-subscription',
          stripePaymentIntentId: intent.id,
        })
      } catch (err) {
        console.error('[webhook] Pool subscription post-payment tasks failed:', err)
      }
    })()
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

  if (type === 'form-payment') {
    await payload.update({
      collection: 'form-payments',
      id: recordId,
      data: { paymentStatus: 'failed' },
    })
  }

  if (type === 'group-subscription') {
    await payload.update({
      collection: 'group-subscription',
      id: recordId,
      data: { paymentStatus: 'failed' },
    })
  }
}

async function handleFormPaymentSuccess(
  payload: Awaited<ReturnType<typeof getPayload>>,
  intent: Stripe.PaymentIntent,
) {
  const { recordId } = intent.metadata || {}
  if (!recordId) return

  const record = await payload.findByID({
    collection: 'form-payments',
    id: recordId,
    depth: 2,
  })

  if (!record) return

  // Mark as paid
  await payload.update({
    collection: 'form-payments',
    id: recordId,
    data: { paymentStatus: 'paid', stripePaymentIntentId: intent.id },
  })

  // Assign user to group/subgroup if configured
  const assignToGroup = record.assignToGroup as
    | { relationTo: 'groups' | 'group-categories'; value: { id: string } | string }
    | null
    | undefined

  const userId = typeof record.user === 'string' ? record.user : record.user?.id

  if (assignToGroup && userId) {
    try {
      const user = await payload.findByID({ collection: 'users', id: userId, depth: 0 })
      const existingGroups: { relationTo: string; value: string }[] = (
        (user.groups as any[]) ?? []
      ).map((g: any) =>
        typeof g === 'string'
          ? { relationTo: 'groups', value: g }
          : {
              relationTo: g.relationTo ?? 'groups',
              value: typeof g.value === 'string' ? g.value : g.value?.id,
            },
      )

      const groupId =
        typeof assignToGroup.value === 'string' ? assignToGroup.value : assignToGroup.value?.id

      const alreadyAssigned = existingGroups.some(
        (g) => g.relationTo === assignToGroup.relationTo && g.value === groupId,
      )

      if (!alreadyAssigned) {
        await payload.update({
          collection: 'users',
          id: userId,
          data: {
            groups: [
              ...existingGroups,
              { relationTo: assignToGroup.relationTo, value: groupId },
            ] as any,
          },
        })
      }
    } catch (err) {
      console.error('[webhook] form-payment group assignment failed:', err)
    }
  }

  // Fire-and-forget invoice creation
  ;(async () => {
    try {
      const { createDraftInvoice } = await import('@/helpers/invoiceHelper')
      const user = userId
        ? await payload.findByID({ collection: 'users', id: userId, depth: 0 })
        : null

      const description =
        (record as any).description ||
        (typeof record.form === 'object' && record.form !== null
          ? ((record.form as any)?.title ?? 'Form payment')
          : 'Form payment')

      await createDraftInvoice({
        user: {
          name: user?.name ?? '',
          surname: user?.surname ?? '',
          email: user?.email ?? '',
          associateId: user?.associateId ?? '',
          nif: user?.nif,
        },
        lineItems: [
          {
            name: description,
            description,
            unit_price: ((record as any).amount ?? 0).toFixed(2),
            quantity: 1,
            tax: { name: 'IVA0' },
          },
        ],
        context: 'form-payment',
        stripePaymentIntentId: intent.id,
      })
    } catch (err) {
      console.error('[webhook] form-payment invoice creation failed:', err)
    }
  })()
}
