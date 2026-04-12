'use client'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
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

export type FormBlockType = {
  generalConfigData: GeneralConfig
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form?: FormType
  introContent?: SerializedEditorState
  isRegistrationForm?: boolean
  currentUser?: User
  onSubmit?: (data: Record<string, any>) => Promise<{ error?: string; redirectUrl?: string }>
}

export const FormBlockClient: React.FC<{ id?: string } & FormBlockType> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    introContent,
    generalConfigData,
    currentUser,
    onSubmit: onSubmitFromProps,
  } = props

  const {
    id: formID,
    confirmationMessage,
    confirmationType,
    redirect,
    submitButtonLabel,
  } = formFromProps || {}

  // Build defaultValues from prefillFromUser
  const defaultValues = React.useMemo(() => {
    const base: Record<string, any> = {}
    for (const field of (formFromProps?.fields ?? []) as CustomFormFieldBlock[]) {
      if (!field.name) continue
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

  const formMethods = useForm({ defaultValues })
  const {
    control,
    formState: { errors },
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

      try {
        const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
          body: JSON.stringify({
            form: formID,
            submissionData: Object.entries(data).map(([field, value]) => ({ field, value })),
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
    [router, formID, redirect, confirmationType, onSubmitFromProps],
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
    <div className="container lg:max-w-[48rem]">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className="p-4 lg:p-6 border border-border rounded-[0.8rem]">
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
              <form id={formID} onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4 last:mb-0 grid grid-cols-6 gap-3">
                  {regularFields.map((field, index) => renderField(field, index))}
                </div>

                {!hasPayment && (
                  <Button form={formID} type="submit" variant="default" disabled={isLoading}>
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
                        formId={formID}
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
