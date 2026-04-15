'use client'

import React, { useEffect, useRef, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { createPaymentIntent } from '@/helpers/stripeHelper'
import { Loader } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { getClientSideURL } from '@/utilities/getURL'
import { useStepPayment } from '@/blocks/SectionWithAside/StepPaymentContext'
import { createBlockInvoice } from '@/actions/invoice'
import type { StripePaymentBlock as StripePaymentBlockProps } from '@/payload-types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ── Inner form ───────────────────────────────────────────────────────────────
const InnerForm: React.FC<{
  onSuccess: (id: string) => void
}> = ({ onSuccess }) => {
  const stripe = useStripe()
  const elements = useElements()
  const t = useTranslations('Payment')
  const ctx = useStepPayment()

  useEffect(() => {
    if (!ctx) return
    ctx.registerSubmit(async () => {
      if (!stripe || !elements) return { error: 'Stripe not ready' }

      const { error: submitError } = await elements.submit()
      if (submitError) return { error: submitError.message ?? t('validationError') }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${getClientSideURL()}/payment/confirmation` },
        redirect: 'if_required',
      })

      if (error) return { error: error.message ?? t('paymentFailed') }

      const ok = ['succeeded', 'processing', 'requires_action']
      if (paymentIntent && ok.includes(paymentIntent.status)) {
        onSuccess(paymentIntent.id)
        return {}
      }

      return { error: t('paymentFailed') }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe, elements])

  return (
    <div className="flex flex-col gap-4">
      <PaymentElement options={{ layout: 'tabs' }} />
    </div>
  )
}

// ── Public component ─────────────────────────────────────────────────────────
export const StripePaymentBlockComponent: React.FC<StripePaymentBlockProps> = ({
  amount,
  description,
  metadata,
  invoiceLineItems,
}) => {
  const t = useTranslations('Payment')
  const locale = useLocale()
  const ctx = useStepPayment()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const initialized = useRef(false)

  const metadataMap = Object.fromEntries((metadata ?? []).map((m) => [m.key, m.value]))

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    createPaymentIntent({
      amount: Math.round(amount * 100),
      description: description ?? undefined,
      metadata: metadataMap,
    }).then((result) => {
      if (result.error) {
        setInitError(result.error)
        return
      }
      setClientSecret(result.clientSecret ?? null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (initError) return <p className="text-sm text-destructive">{initError}</p>

  if (!clientSecret) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader className="w-4 h-4 animate-spin" />
        {t('initialising')}
      </div>
    )
  }

  const handleSuccess = (paymentIntentId: string) => {
    ctx?.setPaymentIntentId(paymentIntentId)
    ctx?.setStatus('success')

    // Fire-and-forget invoice creation — never blocks the payment flow
    if (invoiceLineItems?.length) {
      ;(async () => {
        try {
          await createBlockInvoice({
            stripePaymentIntentId: paymentIntentId,
            lineItems: invoiceLineItems.map((item) => ({
              name: item.name,
              description: item.description ?? '',
              unit_price: (item.unitPrice ?? amount).toFixed(2),
              quantity: item.quantity ?? 1,
              tax: { name: 'IVA0' as const },
            })),
            context: 'form-payment',
          })
        } catch (err) {
          console.error('[StripePaymentBlock] Invoice creation failed:', err)
        }
      })()
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-swim-border shadow-sm p-6">
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance: { theme: 'stripe' }, locale: locale as any }}
      >
        <InnerForm onSuccess={handleSuccess} />
      </Elements>
    </div>
  )
}
