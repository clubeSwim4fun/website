'use client'

import React, { useEffect, useRef, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { StripePaymentField } from '@/payload-types'
import { createFormPayment, confirmFormPayment } from '@/actions/form-payment'
import { getClientSideURL } from '@/utilities/getURL'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type PaymentFieldProps = StripePaymentField & {
  formId: string
  submissionData: { field: string; value: string }[]
  onSuccess: (paymentIntentId: string, formPaymentId: string) => Promise<void>
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Inner checkout form
// ---------------------------------------------------------------------------

const CheckoutForm: React.FC<{
  onSuccess: (paymentIntentId: string, formPaymentId: string) => Promise<void>
  formPaymentId: string
  returnUrl: string
}> = ({ onSuccess, formPaymentId, returnUrl }) => {
  const stripe = useStripe()
  const elements = useElements()
  const t = useTranslations('Payment')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message ?? t('paymentFailed'))
      setIsProcessing(false)
      return
    }

    const acceptedStatuses = ['succeeded', 'processing', 'requires_action']
    if (paymentIntent && acceptedStatuses.includes(paymentIntent.status)) {
      try {
        await confirmFormPayment(formPaymentId, paymentIntent.id)
        await onSuccess(paymentIntent.id, formPaymentId)
      } catch {
        setErrorMessage(t('paymentFailed'))
        setIsProcessing(false)
      }
      return
    }

    setErrorMessage(t('paymentFailed'))
    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive mt-1">
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
          t('payButton')
        )}
      </Button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Public Payment field component
// ---------------------------------------------------------------------------

export const PaymentFormField: React.FC<PaymentFieldProps> = ({
  formId,
  amount,
  description,
  assignToGroup,
  submissionData,
  onSuccess,
  label,
}) => {
  const t = useTranslations('Payment')
  const locale = useLocale()
  const initialized = useRef(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [formPaymentId, setFormPaymentId] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    createFormPayment({
      formId,
      amountEur: amount,
      description: typeof description === 'string' ? description : undefined,
      assignToGroup: assignToGroup as any,
      submissionData,
    }).then((result) => {
      if (result.error) {
        setInitError(result.error)
        return
      }
      setClientSecret(result.clientSecret ?? null)
      setFormPaymentId(result.formPaymentId ?? null)
    })
  }, [])

  const returnUrl = `${getClientSideURL()}/${locale}`

  return (
    <div className="col-span-6 flex flex-col gap-3">
      {label && <p className="text-sm font-medium text-foreground">{label as string}</p>}
      <div className="rounded-[0.8rem] border border-border p-4 lg:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {typeof description === 'string' ? description : t('paymentAmount')}
          </span>
          <span className="font-semibold text-foreground">
            {new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(amount)}
          </span>
        </div>

        {initError && (
          <p role="alert" className="text-sm text-destructive">
            {initError}
          </p>
        )}

        {!initError && !clientSecret && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
            <Loader className="w-4 h-4 animate-spin" />
            {t('initialising')}
          </div>
        )}

        {clientSecret && formPaymentId && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: 'stripe' }, locale: locale as any }}
          >
            <CheckoutForm
              onSuccess={onSuccess}
              formPaymentId={formPaymentId}
              returnUrl={returnUrl}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}
