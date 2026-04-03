import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { GeneralConfig } from '@/payload-types'
import { TypedLocale } from 'payload'
import { FormBlockClient, FormBlockType } from './Component.client'
import { getLocale } from 'next-intl/server'
import { RegistrationWizard } from '@/components/RegistrationWizard'

export async function FormBlock(props: { id?: string } & FormBlockType) {
  const locale = (await getLocale()) as TypedLocale
  const generalConfigData: GeneralConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale,
  )()) as GeneralConfig

  if (props.isRegistrationForm) {
    return (
      <RegistrationWizard
        generalConfig={generalConfigData}
        form={props.form}
        submitButtonLabel={props.form?.submitButtonLabel}
      />
    )
  }

  return <FormBlockClient {...props} generalConfigData={generalConfigData} />
}
