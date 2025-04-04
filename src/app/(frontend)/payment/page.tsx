import type { Metadata } from 'next'

import { draftMode } from 'next/headers'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getMyCart } from '@/helpers/cartHelper'
import { getMeUser } from '@/utilities/getMeUser'
import { Cart as CartType } from '@/payload-types'

import CheckoutSteps from '@/components/Common/CheckoutSteps'

export default async function Payment() {
  const { isEnabled: draft } = await draftMode()
  let cart: CartType | null | undefined = null

  const { user } = await getMeUser()

  cart = user ? await getMyCart() : null

  return (
    <main className="pt-[104px] pb-24">
      {draft && <LivePreviewListener />}
      <section className="container max-w-screen-xl mx-auto mt-4 h-full">
        <CheckoutSteps current={1} />
        <h1 className="font-bold text-3xl my-4">Método de Pagamento</h1>
      </section>
    </main>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Clube Swim4Fun Pagamento`,
  }
}
