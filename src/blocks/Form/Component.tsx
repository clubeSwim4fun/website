'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'
import { User, UserMedia, UserMediaSelect } from '@/payload-types'
import { createUser } from '@/actions/createUser'
import { useUploadFile } from '@/hooks/use-upload-file'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: SerializedEditorState
  isRegistrationForm?: boolean
}

type CustomFormFieldBlock = FormFieldBlock & {
  name: string
  relatesTo: string
}

export type CreateuserType = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type CreateUserMediaType = Omit<UserMedia, 'id' | 'createdAt' | 'updatedAt'> & {
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

  const { onUpload, progresses, uploadedFiles, isUploading } = useUploadFile('imageUploader', {
    defaultUploadedFiles: [],
  })

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

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const files: ProfileFile[] = []
        const fields = formFromProps.fields as CustomFormFieldBlock[]

        const dataToSend = Object.entries(data).map(([name, value]) => {
          if (Array.isArray(value)) {
            return {
              field: name,
              isArray: true,
              values: value.map((v) => {
                if (v instanceof File) {
                  const newFile = new File([v], `${name}-${v.name}`, {
                    type: v.type,
                    lastModified: v.lastModified,
                  })

                  files.push({
                    file: newFile,
                    relatesTo: fields.find((field) => field.name === name)?.relatesTo,
                  })
                }

                return {
                  value: v.path,
                }
              }),
            }
          }

          return {
            field: name,
            value,
          }
        })

        if (isRegistrationForm) {
          const userData: CreateuserType = {
            name: dataToSend.find((d) => d.field === 'name')?.value?.toString() || '',
            email: dataToSend.find((d) => d.field === 'email')?.value?.toString() || '',
            password: dataToSend.find((d) => d.field === 'password')?.value?.toString() || '',
          }

          if (files?.length) {
            const uploadedFiles = await onUpload(files)

            if (uploadedFiles?.length) {
              const userFiles: CreateUserMediaType[] = []

              uploadedFiles.forEach((uploadedFile) => {
                const fileName = uploadedFile?.serverData?.uploadedBy?.name || ''
                const relatesTo = uploadedFile?.serverData?.updatedFile.relatesTo || ''

                const file: CreateUserMediaType = {
                  _key: `${uploadedFile?.key}`,
                  filename: `${fileName}_${uploadedFile?.name}_${uploadedFile?.key.slice(0, 3)}`,
                  mimeType: uploadedFile?.type,
                  filesize: uploadedFile?.size,
                  url: `https://utfs.io/a/${process.env.NEXT_PUBLIC_UPLOADTHING_ID}/${uploadedFile?.key}`,
                  relatesTo,
                }

                userFiles.push(file)
              })

              await createUser(userData, userFiles)
            }
          }
        }

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

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

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
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
            message: 'Something went wrong.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

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
          {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
          {!hasSubmitted && (
            <form id={formID} onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 last:mb-0">
                {formFromProps &&
                  formFromProps.fields &&
                  formFromProps.fields?.map((field, index) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                    if (Field) {
                      return (
                        <div className="mb-6 last:mb-0" key={index}>
                          <Field
                            form={formFromProps}
                            {...field}
                            {...formMethods}
                            control={control}
                            errors={errors}
                            register={register}
                          />
                        </div>
                      )
                    }
                    return null
                  })}
              </div>

              <Button form={formID} type="submit" variant="default">
                {submitButtonLabel}
              </Button>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}
