import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { GeneralConfig, User } from '@/payload-types'
import { TypedLocale } from 'payload'
import { FormBlockClient, FormBlockType } from './Component.client'
import { getLocale } from 'next-intl/server'
import { RegistrationWizard } from '@/components/RegistrationWizard'
import { getMeUser } from '@/utilities/getMeUser'

export async function FormBlock(props: { id?: string } & FormBlockType) {
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
      />
    )
  }

  const { user } = await getMeUser()

  return <FormBlockClient {...props} generalConfigData={generalConfigData} currentUser={user} />
}
