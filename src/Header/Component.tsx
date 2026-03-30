import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { GeneralConfig, Header, Page } from '@/payload-types'
import { getMeUser } from '@/utilities/getMeUser'
import { TypedLocale } from 'payload'

export async function Header({ locale }: { locale: TypedLocale }) {
  const headerData: Header = await getCachedGlobal('header', 1, locale)()
  const generalConfig = (await getCachedGlobal('generalConfigs', 1, locale)()) as GeneralConfig
  const { user } = await getMeUser()

  const registerPage = generalConfig?.settings?.login?.registerUrl
  const registerSlug =
    registerPage && typeof registerPage === 'object'
      ? (registerPage as Page).slug
      : typeof registerPage === 'string'
        ? registerPage
        : null

  return <HeaderClient data={headerData} user={user} registerSlug={registerSlug} />
}
