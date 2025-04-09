import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'
import { getMeUser } from '@/utilities/getMeUser'
import { TypedLocale } from 'payload'

export async function Header({ locale }: { locale: TypedLocale }) {
  const headerData: Header = await getCachedGlobal('header', 1, locale)()
  const { user } = await getMeUser()

  return <HeaderClient data={headerData} user={user} />
}
