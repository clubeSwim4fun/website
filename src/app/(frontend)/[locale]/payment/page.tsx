import type { Metadata } from 'next'

import { draftMode } from 'next/headers'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'

import CheckoutSteps from '@/components/Common/CheckoutSteps'
import { PaymentForm } from './payment-form'
import { getTranslations } from 'next-intl/server'
import { GeneralConfig } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { TypedLocale } from 'payload'

export default async function Payment({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Payment' })
  const { isEnabled: draft } = await draftMode()

  return (
    <main className="pt-[104px] pb-24">
      {draft && <LivePreviewListener />}
      <section className="prose container max-w-screen-xl mx-auto mt-4 h-full">
        <CheckoutSteps current={1} />
        <h1 className="my-4">{t('title')}</h1>
        <PaymentForm />
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
  const payment = globalConfig?.settings?.fixedPages?.payment

  const paymentTitle = payment?.title || t('Payment')

  return {
    title: `${clubTitle} - ${paymentTitle}`,
  }
}
