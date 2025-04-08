import CheckoutSteps from '@/components/Common/CheckoutSteps'
import { OrderPageClient } from './page.client'

type Args = {
  params: Promise<{
    id: string
  }>
}
export default async function Event({ params: paramsPromise }: Args) {
  const { id } = await paramsPromise
  return (
    <main className="pt-[104px] pb-24">
      <OrderPageClient />
      <section className="container max-w-screen-xl mx-auto mt-4 h-full">
        <CheckoutSteps current={2} />
        <h1>Order ID: {id}</h1>
        <p>Order details will be displayed here.</p>
      </section>
    </main>
  )
}
