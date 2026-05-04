'use client'

import React, { useEffect, useRef, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { getClientSideURL } from '@/utilities/getURL'
import { createFormPayment, confirmFormPayment } from '@/actions/form-payment'
import { checkUserGroupMembership } from '@/actions/checkGroupMembership'
import RichText from '@/components/RichText'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { useStepPayment } from '@/blocks/SectionWithAside/StepPaymentContext'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type CardPaymentProps = {
  amount: number
  description?: string
  metadata?: Record<string, string>
  assignToGroup?: { relationTo: 'groups' | 'group-categories'; value: string } | null
  successMessage?: SerializedEditorState | null
  hideButton?: boolean
}

// ── Inner form ───────────────────────────────────────────────────────────────

const InnerCheckoutForm: React.FC<{
  onSuccess: (paymentIntentId: string) => void
  hideButton?: boolean
  formPaymentId: string | null
}> = ({ onSuccess, hideButton, formPaymentId }) => {
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
        onSuccess(paymentIntent.id)
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
      if (formPaymentId) {
        await confirmFormPayment(formPaymentId, paymentIntent.id)
      }
      onSuccess(paymentIntent.id)
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
  assignToGroup,
  successMessage,
  hideButton,
}) => {
  const t = useTranslations('Payment')
  const locale = useLocale()
  const initialized = useRef(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [formPaymentId, setFormPaymentId] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)
  const [alreadyMemberName, setAlreadyMemberName] = useState<string | null>(null)
  const ctx = useStepPayment()

  // Resolve effective amount/description from context override or static props
  const selectedOption = ctx?.selectedPaymentOption ?? null
  const effectiveAmount = selectedOption?.amount ?? amount
  const effectiveDescription = selectedOption?.label ?? description

  // Signal ready to the aside button once clientSecret is loaded (or no payment needed)
  useEffect(() => {
    if (clientSecret || initError || alreadyMemberName !== null) {
      ctx?.setReady(true)
    }
  }, [clientSecret, initError, alreadyMemberName]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-initialize when the selected payment option changes (user picks a different option)
  useEffect(() => {
    const hasSel = ctx?.hasPaymentSelectorRef.current ?? false
    if (hasSel && selectedOption === null) return
    initialized.current = false
    setClientSecret(null)
    setFormPaymentId(null)
    setInitError(null)
    ctx?.setReady(false)
  }, [selectedOption?.amount, selectedOption?.label]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (clientSecret !== null) return
    if (initialized.current) return
    // Defer by one tick so the Select's useEffect (which sets hasPaymentSelectorRef +
    // selectedPaymentOption) always runs before we decide whether to wait or proceed.
    const timer = setTimeout(() => {
      if (clientSecret !== null || initialized.current) return
      const hasSel = ctx?.hasPaymentSelectorRef.current ?? false
      if (hasSel && ctx?.selectedPaymentOption === null) return
      initialized.current = true

      const effectiveAmt = ctx?.selectedPaymentOption?.amount ?? amount
      const effectiveDesc = ctx?.selectedPaymentOption?.label ?? description

      const run = async () => {
        if (assignToGroup) {
          const { isMember, groupName } = await checkUserGroupMembership(assignToGroup)
          if (isMember) {
            setAlreadyMemberName(groupName ?? '')
            return
          }
        }

        const result = await createFormPayment({
          amountEur: effectiveAmt,
          description: effectiveDesc,
          assignToGroup: assignToGroup ?? null,
          submissionData: [],
        })
        if (result.error) {
          setInitError(result.error)
          return
        }
        setClientSecret(result.clientSecret ?? null)
        setFormPaymentId(result.formPaymentId ?? null)
      }

      run()
    }, 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSecret, selectedOption?.amount])

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

  if (alreadyMemberName !== null) {
    return (
      <p className="text-sm text-muted-foreground">
        {t.rich('alreadyMember', {
          groupName: alreadyMemberName,
          b: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>
    )
  }

  if (initError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {initError}
      </p>
    )
  }

  // No option selected yet — hide entirely (button stays blocked)
  if ((ctx?.hasPaymentSelectorRef.current ?? false) && selectedOption === null) return null

  if (!clientSecret) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader className="w-4 h-4 animate-spin" />
        {t('initialising')}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Amount summary line */}
      <div className="flex items-center justify-between pb-3 border-b border-swim-border">
        <span className="text-sm text-ink-light">{effectiveDescription ?? t('paymentAmount')}</span>
        <span className="font-outfit font-bold text-deep">
          {new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(
            effectiveAmount,
          )}
        </span>
      </div>
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance: { theme: 'stripe' }, locale: locale as any }}
      >
        <InnerCheckoutForm
          onSuccess={() => setPaid(true)}
          hideButton={hideButton}
          formPaymentId={formPaymentId}
        />
      </Elements>
    </div>
  )
}
