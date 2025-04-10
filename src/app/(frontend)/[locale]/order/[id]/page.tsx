import CheckoutSteps from '@/components/Common/CheckoutSteps'
import { OrderPageClient } from './page.client'
import { TypedLocale } from 'payload'
import { getTranslations } from 'next-intl/server'

type Args = {
  params: Promise<{
    id: string
    locale: TypedLocale
  }>
}
export default async function Event({ params: paramsPromise }: Args) {
  const { id } = await paramsPromise
  const { locale } = await paramsPromise
  const t = await getTranslations({ locale, namespace: 'Order' })

  return (
    <main className="pt-[104px] pb-24">
      <OrderPageClient />
      <section className="container max-w-screen-xl mx-auto mt-4 h-full">
        <CheckoutSteps current={2} />
        <h1>{t('title')}</h1>
        <p>{t('orderId', { orderId: id })}</p>
      </section>
    </main>
  )
}
