'use client'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'
import { UserMedia } from '@/payload-types'
import { createUser, CreateUserRequestType } from '@/actions/createUser'
import { CustomFormFieldBlock, getRelationalField } from '@/utilities/getRelationalField'
import { useToast } from '@/hooks/use-toast'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { useTranslations } from 'next-intl'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: SerializedEditorState
  isRegistrationForm?: boolean
}

export type CreateUserMediaType = {
  file: Omit<UserMedia, 'id' | 'createdAt' | 'updatedAt'>
  relatesTo?: string
}

export type ProfileFile = {
  file: File
  relatesTo?: string
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
    isRegistrationForm,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()
  const t = useTranslations()
  const { toast } = useToast()

  const onSubmit = useCallback(
    (data: { [key: string]: any }[]) => {
      setIsLoading(true)

      const submitForm = async () => {
        setError(undefined)
        const fields = formFromProps.fields as CustomFormFieldBlock[]

        const dataToSend: CreateUserRequestType = {}

        Object.entries(data).forEach(([name, value]) => {
          dataToSend[name] = {
            value: typeof value === 'string' ? (value as string) : (value as unknown as File[]),
            relatesTo: getRelationalField({ fields, name }),
          }
        })

        if (isRegistrationForm) {
          const { error } = await createUser(dataToSend)

          if (error) {
            setIsLoading(false)

            setError({
              message: error,
            })

            return
          }
        }

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || t('Common.unexpectedError'),
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: t('Common.unexpectedError'),
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  useEffect(() => {
    if (!error) {
      return
    }

    toast({
      variant: 'destructive',
      description: error?.message || t('Common.unexpectedError'),
    })
  }, [error])

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
          {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
          {!hasSubmitted && (
            <form id={formID} onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 last:mb-0 grid grid-cols-6 gap-3">
                {formFromProps &&
                  formFromProps.fields &&
                  formFromProps.fields?.map((field: CustomFormFieldBlock, index) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                    if (Field) {
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
                            disabled={isLoading}
                          />
                        </div>
                      )
                    }
                    return null
                  })}
              </div>

              <Button form={formID} type="submit" variant="default" disabled={isLoading}>
                {isLoading ? (
                  <span>
                    {submitButtonLabel} <LoaderCircle className="animate-spin inline ml-2" />
                  </span>
                ) : (
                  submitButtonLabel
                )}
              </Button>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}
