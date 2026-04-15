'use client'

import React, { useEffect, useRef, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { getClientSideURL } from '@/utilities/getURL'
import { createPaymentIntent } from '@/helpers/stripeHelper'
import RichText from '@/components/RichText'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { useStepPayment } from '@/blocks/SectionWithAside/StepPaymentContext'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type CardPaymentProps = {
  amount: number
  description?: string
  metadata?: Record<string, string>
  successMessage?: SerializedEditorState | null
  hideButton?: boolean
}

// ── Inner form ───────────────────────────────────────────────────────────────

const InnerCheckoutForm: React.FC<{
  onSuccess: () => void
  hideButton?: boolean
}> = ({ onSuccess, hideButton }) => {
  const stripe = useStripe()
  const elements = useElements()
  const t = useTranslations('Payment')
  const ctx = useStepPayment()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // When inside a SectionWithAside stripe step, register with the context.
  // The aside "Next / Pay" button will trigger this instead of a standalone button.
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
        ctx.setPaymentIntentId(paymentIntent.id)
        ctx.setStatus('success')
        onSuccess()
        return {}
      }

      return { error: t('paymentFailed') }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe, elements])

  // Inside a step context — no standalone button, aside button drives it
  if (ctx) {
    return (
      <div className="flex flex-col gap-4">
        <PaymentElement options={{ layout: 'tabs' }} />
        {errorMessage && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }

  // Standalone mode
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setErrorMessage(submitError.message ?? t('validationError'))
      setIsProcessing(false)
      return
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${getClientSideURL()}/payment/confirmation` },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message ?? t('paymentFailed'))
      setIsProcessing(false)
      return
    }

    const ok = ['succeeded', 'processing', 'requires_action']
    if (paymentIntent && ok.includes(paymentIntent.status)) {
      onSuccess()
      return
    }

    setErrorMessage(t('paymentFailed'))
    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      {!hideButton && (
        <Button type="submit" disabled={!stripe || isProcessing} className="w-full mt-2">
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              {t('payButtonLoading')}
            </span>
          ) : (
            t('payButton')
          )}
        </Button>
      )}
    </form>
  )
}

// ── Public component ─────────────────────────────────────────────────────────

export const CardPaymentVariant: React.FC<CardPaymentProps> = ({
  amount,
  description,
  metadata,
  successMessage,
  hideButton,
}) => {
  const t = useTranslations('Payment')
  const locale = useLocale()
  const initialized = useRef(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    createPaymentIntent({
      amount: Math.round(amount * 100),
      description,
      metadata,
    }).then((result) => {
      if (result.error) {
        setInitError(result.error)
        return
      }
      setClientSecret(result.clientSecret ?? null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (paid) {
    return (
      <div className="flex flex-col items-center text-center py-4 gap-4">
        <div className="w-14 h-14 rounded-full bg-pale flex items-center justify-center">
          <CheckCircle2 size={28} className="text-mid" strokeWidth={1.5} />
        </div>
        {successMessage && <RichText data={successMessage} enableGutter={false} enableProse />}
      </div>
    )
  }

  if (initError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {initError}
      </p>
    )
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader className="w-4 h-4 animate-spin" />
        {t('initialising')}
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: 'stripe' }, locale: locale as any }}
    >
      <InnerCheckoutForm onSuccess={() => setPaid(true)} hideButton={hideButton} />
    </Elements>
  )
}
