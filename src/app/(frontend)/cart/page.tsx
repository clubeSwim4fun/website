import type { Metadata } from 'next'

import { draftMode } from 'next/headers'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getMyCart } from '@/helpers/cartHelper'
import { getMeUser } from '@/utilities/getMeUser'
import { Cart as CartType, Event, Ticket } from '@/payload-types'

import CheckoutSteps from '@/components/Common/CheckoutSteps'
import { CartTable } from './cart-table'

export type eventTicket = {
  [key: string]: {
    slug?: string | null
    tickets: Ticket[]
  }
}
export default async function Cart() {
  const { isEnabled: draft } = await draftMode()
  let cart: CartType | null | undefined = null

  const { user } = await getMeUser()

  cart = user ? await getMyCart() : null

  const eventsTickets: eventTicket = {}

  cart?.items?.forEach((item) => {
    const ticket = item.selectedTicket as Ticket
    const eventFor = ticket.eventFor as Event

    if (!eventsTickets[eventFor.title]) {
      eventsTickets[eventFor.title] = { slug: eventFor.slug, tickets: [] }
    }

    eventsTickets[eventFor.title]?.tickets.push(ticket)
  })

  return (
    <main className="pt-[104px] pb-24">
      {draft && <LivePreviewListener />}
      <section className="container max-w-screen-xl mx-auto mt-4 h-full">
        <CheckoutSteps current={0} />
        <h1 className="font-bold text-3xl my-4">Meu Carrinho</h1>
        <CartTable eventsTickets={eventsTickets} />
      </section>
    </main>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Clube Swim4Fun Carrinho de compras`,
  }
}
