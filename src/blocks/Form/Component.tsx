import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { GeneralConfig } from '@/payload-types'
import { TypedLocale } from 'payload'
import { FormBlockClient, FormBlockType } from './Component.client'
import { getLocale } from 'next-intl/server'

export async function FormBlock(props: { id?: string } & FormBlockType) {
  const locale = (await getLocale()) as TypedLocale
  const generalConfigData: GeneralConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale,
  )()) as GeneralConfig

  return <FormBlockClient {...props} generalConfigData={generalConfigData} />
}
