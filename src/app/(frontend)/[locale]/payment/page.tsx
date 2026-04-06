import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import React from 'react'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import CheckoutSteps from '@/components/Common/CheckoutSteps'
import { PaymentForm } from './payment-form'
import { getTranslations } from 'next-intl/server'
import { GeneralConfig, Event, Ticket } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { TypedLocale } from 'payload'
import { getMyCart } from '@/helpers/cartHelper'
import { getMeUser } from '@/utilities/getMeUser'
import { redirect } from 'next/navigation'
import { LineItem } from '@/helpers/stripeHelper'

export default async function Payment({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Payment' })
  const { isEnabled: draft } = await draftMode()

  const { user } = await getMeUser({
    nullUserRedirect: `/${locale}/sign-in?callbackUrl=/${locale}/payment`,
  })
  const cart = await getMyCart()

  if (user?.status !== 'active') {
    redirect(`/${locale}/subscription`)
  }

  if (!cart || !cart.items?.length) {
    redirect(`/${locale}/cart`)
  }

  // Stripe expects integer cents
  const amountCents = Math.round((cart.totalPrice ?? 0) * 100)

  // Build structured line items: item = event name, description = ticket name
  const lineItems: LineItem[] = cart.items
    .map((item) => {
      const ticket = item.selectedTicket as Ticket | null
      if (!ticket || typeof ticket === 'string') return null
      const event = ticket.eventFor as Event | null
      const eventName =
        typeof event === 'object' && event !== null
          ? typeof event.title === 'string'
            ? event.title
            : ((event.title as any)?.[locale] ?? '')
          : ''
      const ticketName =
        typeof ticket.name === 'string' ? ticket.name : ((ticket.name as any)?.[locale] ?? '')
      return {
        name: eventName,
        description: ticketName,
        price: ticket.price,
        quantity: 1,
      } satisfies LineItem
    })
    .filter((item): item is LineItem => item !== null)

  // Fallback description (first ticket name) for the PaymentIntent description field
  const paymentDescription = lineItems.map((i) => i.description).join(', ')

  return (
    <main className="pt-[104px] pb-24">
      {draft && <LivePreviewListener />}
      <section className="prose container max-w-screen-xl mx-auto mt-4 h-full">
        <CheckoutSteps current={1} />
        <h1 className="my-4">{t('title')}</h1>
        <div className="max-w-lg">
          <PaymentForm
            amountCents={amountCents}
            description={paymentDescription}
            lineItems={lineItems}
            customer={{
              name: `${user?.name ?? ''} ${user?.surname ?? ''}`.trim(),
              email: user?.email ?? '',
              taxNumber: user?.nif ?? undefined,
            }}
          />
        </div>
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
  const paymentTitle = globalConfig?.settings?.fixedPages?.payment?.title || t('Payment')

  return { title: `${clubTitle} - ${paymentTitle}` }
}
