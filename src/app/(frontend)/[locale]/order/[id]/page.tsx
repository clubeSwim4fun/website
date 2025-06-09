import CheckoutSteps from '@/components/Common/CheckoutSteps'
import { OrderPageClient } from './page.client'
import { getPayload, TypedLocale } from 'payload'
import { getTranslations } from 'next-intl/server'
import { getMeUser } from '@/utilities/getMeUser'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { OrderTable } from './order-table'

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

  const userObject = await getMeUser()
  const payload = getPayload({ config })

  const order = await (
    await payload
  ).find({
    collection: 'orders',
    limit: 1,
    where: {
      and: [
        {
          user: {
            equals: userObject?.user?.id,
          },
        },
        {
          id: {
            equals: id,
          },
        },
      ],
    },
  })

  if (!order || !order.totalDocs) notFound()

  return (
    <main className="pt-[104px] pb-24">
      <OrderPageClient />
      <section className="prose container max-w-screen-xl mx-auto mt-4 h-full">
        <CheckoutSteps current={2} />
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <h1>{t('title')}</h1>
          <p className="text-md font-bold not-prose">{t('orderId', { orderId: id.slice(0, 9) })}</p>
        </div>
        <p>{t('description')}</p>
        <OrderTable order={order.docs[0]} />
        <p className="w-full text-right text-bold">
          {t(
            'totalSpent',
            { price: order.docs[0]?.total || 0 },
            { number: { currency: { style: 'currency', currency: 'EUR' } } },
          )}
        </p>
        <p className="w-full md:text-right">
          {t('questionsText')} <a href={`mailto:${t('contactEmail')}`}>{t('contactEmail')}</a>
        </p>
      </section>
    </main>
  )
}
