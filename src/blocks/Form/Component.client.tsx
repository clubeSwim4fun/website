'use client'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'
import { GeneralConfig, User } from '@/payload-types'
import { CustomFormFieldBlock } from '@/utilities/getRelationalField'
import { useToast } from '@/hooks/use-toast'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { useTranslations } from 'next-intl'
import { useStepPayment } from '@/blocks/SectionWithAside/StepPaymentContext'

export type FormBlockType = {
  generalConfigData: GeneralConfig
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form?: FormType
  introContent?: SerializedEditorState
  isRegistrationForm?: boolean
  currentUser?: User
  hideSubmitButton?: boolean
  noContainer?: boolean
  onSubmit?: (data: Record<string, any>) => Promise<{ error?: string; redirectUrl?: string }>
}

export const FormBlockClient: React.FC<{ id?: string } & FormBlockType> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    introContent,
    generalConfigData,
    currentUser,
    hideSubmitButton,
    noContainer,
    onSubmit: onSubmitFromProps,
  } = props

  const {
    id: formID,
    confirmationMessage,
    confirmationType,
    redirect,
    submitButtonLabel,
  } = formFromProps || {}

  // Ensure we always have the form ID — the plugin type may omit it but it's always present at runtime
  const resolvedFormID: string | undefined = (formFromProps as any)?.id ?? formID

  // Build defaultValues from field defaultValue and prefillFromUser
  const defaultValues = React.useMemo(() => {
    const base: Record<string, any> = {}
    for (const field of (formFromProps?.fields ?? []) as CustomFormFieldBlock[]) {
      if (!field.name) continue
      // Seed field-level defaultValue first (e.g. Select)
      const fieldDefault = (field as any).defaultValue
      if (fieldDefault !== undefined && fieldDefault !== null && fieldDefault !== '') {
        base[field.name] = fieldDefault
      }
      // prefillFromUser overrides field default
      const prefill = (field as any).prefillFromUser as string | undefined
      if (prefill && currentUser) {
        const val = (currentUser as any)[prefill]
        if (val !== undefined && val !== null) base[field.name] = val
      }
    }
    return base
  }, [formFromProps?.fields, currentUser])

  // Split fields: regular fields go inside <form>, payment field goes outside
  const { regularFields, paymentField } = useMemo(() => {
    const all = (formFromProps?.fields ?? []) as CustomFormFieldBlock[]
    return {
      regularFields: all.filter((f) => (f.blockType as string) !== 'stripePayment'),
      paymentField: all.find((f) => (f.blockType as string) === 'stripePayment'),
    }
  }, [formFromProps?.fields])

  const hasPayment = Boolean(paymentField)

  const formMethods = useForm({ defaultValues, mode: 'all' })
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    getValues,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()
  const t = useTranslations()
  const { toast } = useToast()

  // Register RHF validation with the stripe step context so the aside pay button
  // can trigger validation (showing field errors) before attempting payment.
  const paymentCtx = useStepPayment()
  useEffect(() => {
    if (!paymentCtx) return
    paymentCtx.registerFormValidation(
      () =>
        new Promise<boolean>((resolve) => {
          handleSubmit(
            () => resolve(true),
            () => resolve(false),
          )()
        }),
    )
    // handleSubmit identity is stable — only re-register if context changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentCtx])

  // Keep context in sync with live RHF validity so the button is disabled reactively
  useEffect(() => {
    if (!paymentCtx) return
    paymentCtx.setFormIsValid(isValid)
  }, [isValid, paymentCtx]) // eslint-disable-line react-hooks/exhaustive-deps

  // Register this form's ID in the step context so sibling payment cards can link to it
  const stepFormIdRegistered = useRef(false)
  if (!stepFormIdRegistered.current && paymentCtx && resolvedFormID) {
    stepFormIdRegistered.current = true
    paymentCtx.setStepFormId(resolvedFormID)
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const submitToPayload = useCallback(
    async (data: Record<string, any>) => {
      setError(undefined)

      if (onSubmitFromProps) {
        const { error, redirectUrl } = await onSubmitFromProps(data)
        if (error) setError({ message: error })
        if (redirectUrl) router.push(redirectUrl)
        return
      }

      // Upload any File[] values (media fields) to the media collection first,
      // then replace with comma-separated filenames for the submission record.
      const serialized: Record<string, string> = {}
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
          const names: string[] = []
          for (const file of value as File[]) {
            try {
              const fd = new FormData()
              fd.append('file', file)
              const res = await fetch(`${getClientSideURL()}/api/media`, {
                method: 'POST',
                body: fd,
              })
              if (res.ok) {
                const json = await res.json()
                names.push(json?.doc?.filename ?? file.name)
              } else {
                names.push(file.name)
              }
            } catch {
              names.push(file.name)
            }
          }
          serialized[key] = names.join(', ')
        } else {
          serialized[key] = String(value ?? '')
        }
      }

      try {
        const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
          body: JSON.stringify({
            form: resolvedFormID,
            submissionData: Object.entries(serialized).map(([field, value]) => ({ field, value })),
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })

        const res = await req.json()

        if (req.status >= 400) {
          setError({
            message: res.errors?.[0]?.message || t('Common.unexpectedError'),
            status: res.status,
          })
          return
        }

        setHasSubmitted(true)

        if (confirmationType === 'redirect' && redirect?.url) {
          router.push(redirect.url)
        }
      } catch {
        setError({ message: t('Common.unexpectedError') })
      }
    },
    [router, resolvedFormID, redirect, confirmationType, onSubmitFromProps],
  )

  const onSubmit = useCallback(
    (data: Record<string, any>) => {
      setIsLoading(true)
      void submitToPayload(data).finally(() => setIsLoading(false))
    },
    [submitToPayload],
  )

  // Called by the payment field after Stripe confirms — runs RHF validation first, then submits
  const handlePaymentSuccess = useCallback(
    async (_paymentIntentId: string, _formPaymentId: string) => {
      await new Promise<void>((resolve, reject) => {
        handleSubmit(
          async (data) => {
            try {
              await submitToPayload(data)
              resolve()
            } catch (e) {
              reject(e)
            }
          },
          () => reject(new Error('validation')),
        )()
      })
    },
    [handleSubmit, submitToPayload],
  )

  useEffect(() => {
    if (!error) return
    toast({ variant: 'destructive', description: error.message || t('Common.unexpectedError') })
  }, [error])

  // Snapshot of form values for the payment intent (captured when payment field mounts)
  const submissionDataForPayment = useMemo(() => {
    const data = getValues()
    return Object.entries(data).map(([field, value]) => ({ field, value: String(value ?? '') }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderField = (field: CustomFormFieldBlock, index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
    if (!Field) return null

    return (
      <div
        className={cn(
          'mb-6 last:mb-0 col-span-6',
          field.size === 'one-third'
            ? 'md:col-span-2'
            : field.size === 'half'
              ? 'md:col-span-3'
              : '',
        )}
        key={index}
      >
        <Field
          form={formFromProps}
          {...field}
          {...formMethods}
          control={control}
          errors={errors}
          register={register}
          disabled={isLoading || Boolean((field as any).readOnly)}
          generalConfigData={generalConfigData}
        />
      </div>
    )
  }

  return (
    <div className={noContainer ? undefined : 'container lg:max-w-[48rem]'}>
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className={noContainer ? undefined : 'p-4 lg:p-6 border border-border rounded-[0.8rem]'}>
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <RichText data={confirmationMessage} />
          )}
          {isLoading && !hasSubmitted && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <LoaderCircle className="w-4 h-4 animate-spin" />
            </div>
          )}
          {!hasSubmitted && (
            <>
              {/* Regular fields inside <form> */}
              <form id={resolvedFormID} onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4 last:mb-0 grid grid-cols-6 gap-3">
                  {regularFields.map((field, index) => renderField(field, index))}
                </div>

                {!hasPayment && !hideSubmitButton && (
                  <Button
                    form={resolvedFormID}
                    type="submit"
                    variant="default"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span>
                        {submitButtonLabel} <LoaderCircle className="animate-spin inline ml-2" />
                      </span>
                    ) : (
                      submitButtonLabel
                    )}
                  </Button>
                )}
              </form>

              {/* Payment field rendered outside <form> to avoid nested <form> */}
              {paymentField &&
                (() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const PaymentField: React.FC<any> =
                    fields?.['stripePayment' as keyof typeof fields]
                  if (!PaymentField) return null
                  return (
                    <div className="mt-6">
                      <PaymentField
                        {...paymentField}
                        formId={resolvedFormID}
                        submissionData={submissionDataForPayment}
                        onSuccess={handlePaymentSuccess}
                        disabled={isLoading}
                      />
                    </div>
                  )
                })()}
            </>
          )}
        </FormProvider>
      </div>
    </div>
  )
}
