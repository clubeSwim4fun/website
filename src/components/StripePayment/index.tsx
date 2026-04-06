'use client'

import React, { useEffect, useRef, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { createPaymentIntent, LineItem } from '@/helpers/stripeHelper'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { getClientSideURL } from '@/utilities/getURL'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StripePaymentFormProps = {
  /** Amount in EUR cents (e.g. 1000 = €10.00) */
  amount: number
  description?: string
  metadata?: Record<string, string>
  customer?: { name: string; email: string; taxNumber?: string }
  lineItems?: LineItem[]
  onSuccess: (paymentIntentId: string) => Promise<void>
  payButtonLabel?: string
  returnUrl?: string
}

// ---------------------------------------------------------------------------
// Inner form — rendered inside <Elements>
// ---------------------------------------------------------------------------

const CheckoutForm: React.FC<
  Pick<StripePaymentFormProps, 'onSuccess' | 'payButtonLabel' | 'returnUrl'> & { locale: string }
> = ({ onSuccess, payButtonLabel, returnUrl, locale }) => {
  const stripe = useStripe()
  const elements = useElements()
  const t = useTranslations('Payment')

  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    const redirect = returnUrl ?? `${getClientSideURL()}/payment/confirmation`

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: redirect },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message ?? t('paymentFailed'))
      setIsProcessing(false)
      return
    }

    // succeeded = card; processing = MB Way (async); requires_action = 3DS redirect handled above
    const acceptedStatuses = ['succeeded', 'processing', 'requires_action']
    if (paymentIntent && acceptedStatuses.includes(paymentIntent.status)) {
      try {
        await onSuccess(paymentIntent.id)
      } catch {
        setErrorMessage(t('paymentFailed'))
        setIsProcessing(false)
      }
      return
    }

    // Any other status (canceled, requires_payment_method) is a failure
    setErrorMessage(t('paymentFailed'))
    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement options={{ layout: 'tabs' }} />

      {errorMessage && (
        <p role="alert" className="text-sm text-destructive mt-2">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={!stripe || isProcessing} className="w-full mt-2">
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            {t('payButtonLoading')}
          </span>
        ) : (
          (payButtonLabel ?? t('payButton'))
        )}
      </Button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Public component — creates the PaymentIntent and mounts Elements
// ---------------------------------------------------------------------------

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  description,
  metadata,
  customer,
  lineItems,
  onSuccess,
  payButtonLabel,
  returnUrl,
}) => {
  const t = useTranslations('Payment')
  const locale = useLocale()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    createPaymentIntent({ amount, description, metadata, customer, lineItems }).then((result) => {
      if (result.error) {
        setInitError(result.error)
        return
      }
      setClientSecret(result.clientSecret ?? null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <CheckoutForm
        onSuccess={onSuccess}
        payButtonLabel={payButtonLabel}
        returnUrl={returnUrl}
        locale={locale}
      />
    </Elements>
  )
}
