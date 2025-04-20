import type { Metadata } from 'next'

import { draftMode } from 'next/headers'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getMyCart } from '@/helpers/cartHelper'
import { getMeUser } from '@/utilities/getMeUser'
import { Event, GeneralConfig, Ticket } from '@/payload-types'

import CheckoutSteps from '@/components/Common/CheckoutSteps'
import { CartTable } from './cart-table'
import { getTranslations } from 'next-intl/server'
import { CartPageClient } from './page.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { TypedLocale } from 'payload'

export type eventTicket = {
  [key: string]: {
    slug?: string | null
    tickets: Ticket[]
    hasTshirt?: boolean | null
    tshirtSizes?: string[] | null
  }
}
export default async function Cart({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { isEnabled: draft } = await draftMode()
  const t = await getTranslations({ locale, namespace: 'Cart' })

  const { user } = await getMeUser()

  const cart = user ? await getMyCart() : null

  const eventsTickets: eventTicket = {}

  cart?.items?.forEach((item) => {
    const ticket = item.selectedTicket as Ticket
    const eventFor = ticket.eventFor as Event

    if (!eventsTickets[eventFor.title]) {
      eventsTickets[eventFor.title] = {
        slug: eventFor.slug,
        tickets: [],
        hasTshirt: eventFor.hasTshirt,
        tshirtSizes: eventFor.tshirtSizes,
      }
    }

    eventsTickets[eventFor.title]?.tickets.push(ticket)
  })

  return (
    <main className="pt-[104px] pb-24">
      <CartPageClient />
      {draft && <LivePreviewListener />}
      <section className="prose container max-w-screen-xl mx-auto mt-4 h-full">
        <CheckoutSteps current={0} />
        <h1 className="my-4">{t('title')}</h1>
        <CartTable eventsTickets={eventsTickets} total={cart?.totalPrice} />
      </section>
    </main>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig

  const clubTitle = globalConfig?.clubName || t('Club')
  const cart = globalConfig?.settings?.fixedPages?.cart

  const cartTitle = cart?.title || t('Cart')

  return {
    title: `${clubTitle} - ${cartTitle}`,
  }
}
