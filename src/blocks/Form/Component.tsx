import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { GeneralConfig, User } from '@/payload-types'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { TypedLocale } from 'payload'
import { FormBlockClient, FormBlockType } from './Component.client'
import { getLocale } from 'next-intl/server'
import { RegistrationWizard } from '@/components/RegistrationWizard'
import { getMeUser } from '@/utilities/getMeUser'

export type FormBlockServerProps = {
  id?: string
  compact?: boolean
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form?: FormType
  introContent?: SerializedEditorState
  isRegistrationForm?: boolean
  hideSubmitButton?: boolean
  noContainer?: boolean
  onSubmit?: (data: Record<string, any>) => Promise<{ error?: string; redirectUrl?: string }>
}

export async function FormBlock(props: FormBlockServerProps) {
  const locale = (await getLocale()) as TypedLocale
  const generalConfigData: GeneralConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale,
  )()) as GeneralConfig

  if (!props.form) {
    return null
  }

  if (props.isRegistrationForm) {
    return (
      <RegistrationWizard
        generalConfig={generalConfigData}
        form={props.form}
        submitButtonLabel={props.form?.submitButtonLabel}
        compact={props.noContainer ?? props.compact}
      />
    )
  }

  const { user } = await getMeUser()

  return <FormBlockClient {...props} generalConfigData={generalConfigData} currentUser={user} />
}
