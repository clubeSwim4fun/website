'use client'

import React, { useState, useRef } from 'react'
import { cn } from '@/utilities/ui'
import { ChevronRight, ArrowLeft, Loader, CheckCircle2 } from 'lucide-react'
import { StepPaymentProvider, useStepPayment } from './StepPaymentContext'
import { StepReadyProvider, useStepReady } from './StepReadyContext'
import { useToast } from '@/hooks/use-toast'

type Step = { label?: string; id?: string | null }

type StepButtonConfig = {
  label?: string | null
  submitForm?: boolean | null
}

type Props = {
  steps: Step[]
  nextStepLabel?: string | null
  stepButtonConfigs: StepButtonConfig[]
  stripeSteps: number[]
  aside: React.ReactNode
  children: React.ReactNode[]
}

// ── Stripe step layout — must be inside StepPaymentProvider ──────────────────
const StripeStepLayout: React.FC<{
  panel: React.ReactNode
  asideStatic: React.ReactNode
  nextStepLabel?: string | null
  submitForm?: boolean | null
  isLast: boolean
  onNext: () => void
  prevStepLabel?: string | null
  onBack: () => void
  animClass?: string
}> = ({ panel, asideStatic, nextStepLabel, isLast, onNext, prevStepLabel, onBack, animClass }) => {
  const ctx = useStepPayment()!
  const { toast } = useToast()
  const panelRef = useRef<HTMLDivElement>(null)
  const isProcessing = ctx.status === 'processing'
  const isSuccess = ctx.status === 'success'
  const isReady = ctx.isReady && ctx.formIsValid

  const handlePay = async () => {
    // Validate any form on the same step first — shows field errors and blocks payment
    const formValid = await ctx.triggerFormValidation()
    if (!formValid) return

    ctx.setStatus('processing')
    ctx.setErrorMessage(null)
    const result = await ctx.triggerSubmit()
    if (result.error) {
      ctx.setStatus('error')
      ctx.setErrorMessage(result.error)
      toast({ variant: 'destructive', description: result.error })
    } else {
      // After successful payment, submit any co-located form (sends configured emails)
      await ctx.triggerPostPaymentSubmit().catch(() => {
        // non-critical — payment already succeeded
      })

      if (!isLast) {
        setTimeout(onNext, 600)
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
      {/* Main panel — hide stripe form on success when no next step */}
      <div ref={panelRef} className={cn('flex flex-col gap-4 section-with-aside-main', animClass)}>
        {/* Breadcrumb — hidden after payment succeeds */}
        {prevStepLabel && !isSuccess && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-ink-mid hover:text-deep transition-colors mb-2 group"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            {prevStepLabel}
          </button>
        )}
        {isSuccess && isLast ? null : panel}
      </div>

      {/* Aside */}
      <div className="lg:sticky lg:top-24 flex flex-col gap-4">
        {asideStatic}

        {/* Success notice — only shown when there is NO next step */}
        {isSuccess && isLast && (
          <div className="flex items-center gap-2.5 bg-green-light border border-green rounded-xl px-4 py-3 text-sm text-green-dark font-medium">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            Pagamento confirmado
          </div>
        )}

        {/* Pay button — hidden after success */}
        {!isSuccess && (
          <button
            type="button"
            disabled={isProcessing || !isReady}
            onClick={handlePay}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-outfit font-bold text-sm transition-all duration-200',
              isProcessing || !isReady
                ? 'bg-mid/60 text-white cursor-not-allowed'
                : 'bg-mid text-white hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(14,126,168,0.35)]',
            )}
          >
            {isProcessing ? (
              <>
                <Loader size={16} className="animate-spin" />A processar…
              </>
            ) : (
              <>
                {nextStepLabel ?? 'Pagar'}
                <ChevronRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Normal step layout ───────────────────────────────────────────────────────
const NormalStepLayout: React.FC<{
  panel: React.ReactNode
  aside: React.ReactNode
  isLast: boolean
  stepBtnLabel?: string | null
  stepSubmitsForm: boolean
  animClass: string
  onNext: () => void
}> = ({ panel, aside, isLast, stepBtnLabel, stepSubmitsForm, animClass, onNext }) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const ready = useStepReady()
  const isBlocked = ready?.isBlocked ?? false

  const handleNextOrSubmit = () => {
    if (stepSubmitsForm && panelRef.current) {
      const form = panelRef.current.querySelector('form')
      if (form) {
        form.requestSubmit()
        return
      }
    }
    onNext()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div ref={panelRef} className={cn('flex flex-col gap-4 section-with-aside-main', animClass)}>
        {panel}
      </div>
      <div className="lg:sticky lg:top-24 flex flex-col gap-4">
        {aside}
        {!isLast && stepBtnLabel && (
          <button
            type="button"
            disabled={isBlocked}
            onClick={handleNextOrSubmit}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-outfit font-bold text-sm transition-all duration-200',
              isBlocked
                ? 'bg-mid/60 text-white cursor-not-allowed'
                : 'bg-mid text-white hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(14,126,168,0.35)]',
            )}
          >
            {isBlocked ? <Loader size={16} className="animate-spin" /> : null}
            {stepBtnLabel}
            {!isBlocked && <ChevronRight size={16} strokeWidth={2.5} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main client shell ────────────────────────────────────────────────────────
export const SectionWithAsideClient: React.FC<Props> = ({
  steps,
  nextStepLabel,
  stepButtonConfigs,
  stripeSteps,
  aside,
  children,
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [animClass, setAnimClass] = useState('')
  const directionRef = useRef<'next' | 'prev'>('next')

  const goTo = (next: number) => {
    directionRef.current = next > activeStep ? 'next' : 'prev'
    setAnimClass('')
    // allow a frame to clear the class before re-applying
    requestAnimationFrame(() => {
      setActiveStep(next)
      setAnimClass(directionRef.current === 'next' ? 'step-enter-next' : 'step-enter-prev')
    })
  }

  const isLast = activeStep === steps.length - 1
  const isStripeStep = stripeSteps.includes(activeStep)
  const handleNext = () => goTo(Math.min(activeStep + 1, steps.length - 1))

  const stepBtnConfig = stepButtonConfigs[activeStep]
  const stepBtnLabel = stepBtnConfig?.label ?? nextStepLabel
  const stepSubmitsForm = Boolean(stepBtnConfig?.submitForm)

  const childArray = React.Children.toArray(children)

  return (
    <StepPaymentProvider>
      <SectionWithAsideInner
        steps={steps}
        nextStepLabel={nextStepLabel}
        stepButtonConfigs={stepButtonConfigs}
        stripeSteps={stripeSteps}
        aside={aside}
        activeStep={activeStep}
        animClass={animClass}
        isLast={isLast}
        isStripeStep={isStripeStep}
        stepBtnLabel={stepBtnLabel}
        stepSubmitsForm={stepSubmitsForm}
        childArray={childArray}
        goTo={goTo}
        handleNext={handleNext}
      />
    </StepPaymentProvider>
  )
}

// ── Inner shell (reads StepPaymentContext) ───────────────────────────────────
const SectionWithAsideInner: React.FC<{
  steps: Step[]
  nextStepLabel?: string | null
  stepButtonConfigs: StepButtonConfig[]
  stripeSteps: number[]
  aside: React.ReactNode
  activeStep: number
  animClass: string
  isLast: boolean
  isStripeStep: boolean
  stepBtnLabel?: string | null
  stepSubmitsForm: boolean
  childArray: React.ReactNode[]
  goTo: (n: number) => void
  handleNext: () => void
}> = ({
  steps,
  aside,
  activeStep,
  animClass,
  isLast,
  isStripeStep,
  stepBtnLabel,
  stepSubmitsForm,
  childArray,
  goTo,
  handleNext,
}) => {
  const ctx = useStepPayment()

  const handleGoTo = (next: number) => {
    // Going back — reset payment option so the form select and payment stay in sync
    if (next < activeStep) {
      ctx?.setSelectedPaymentOption(null)
    }
    goTo(next)
  }

  return (
    <section className="w-full">
      {/* Step indicator — display only, not clickable */}
      {steps.length > 0 && (
        <div className="bg-white border-b border-swim-border overflow-x-auto">
          <div className="container">
            <div className="flex">
              {steps.map((step, i) => {
                const isActive = i === activeStep
                const isDone = i < activeStep
                return (
                  <div
                    key={step.id ?? i}
                    className={cn(
                      'flex items-center gap-2.5 px-5 py-4 border-b-[3px] text-sm font-medium whitespace-nowrap select-none',
                      isActive
                        ? 'border-b-mid text-deep font-semibold'
                        : isDone
                          ? 'border-b-transparent text-mid'
                          : 'border-b-transparent text-ink-light',
                    )}
                  >
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                        isActive || isDone ? 'bg-mid text-white' : 'bg-swim-border text-ink-light',
                      )}
                    >
                      {i + 1}
                    </span>
                    {step.label}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="container py-8">
        {/* Breadcrumb — shown on all steps except stripe step (handled inside StripeStepLayout) */}
        {activeStep > 0 && !isStripeStep && (
          <button
            type="button"
            onClick={() => handleGoTo(activeStep - 1)}
            className="flex items-center gap-1.5 text-sm text-ink-mid hover:text-deep transition-colors mb-6 group"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            {steps[activeStep - 1]?.label ?? `Step ${activeStep}`}
          </button>
        )}

        {/* Stripe step — StripeStepLayout reads from the shared StepPaymentProvider above */}
        {isStripeStep && (
          <StripeStepLayout
            panel={childArray[activeStep]}
            asideStatic={aside}
            nextStepLabel={stepBtnLabel}
            submitForm={stepSubmitsForm}
            isLast={isLast}
            onNext={handleNext}
            prevStepLabel={
              activeStep > 0 ? (steps[activeStep - 1]?.label ?? `Step ${activeStep}`) : undefined
            }
            onBack={() => handleGoTo(activeStep - 1)}
            animClass={animClass}
          />
        )}

        {/* Normal step — only render the active panel, not all with hidden */}
        {!isStripeStep && (
          <StepReadyProvider>
            <NormalStepLayout
              panel={childArray[activeStep]}
              aside={aside}
              isLast={isLast}
              stepBtnLabel={stepBtnLabel}
              stepSubmitsForm={stepSubmitsForm}
              animClass={animClass}
              onNext={handleNext}
            />
          </StepReadyProvider>
        )}
      </div>
    </section>
  )
}
