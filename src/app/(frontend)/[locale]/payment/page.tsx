import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import CheckoutSteps from '@/components/Common/CheckoutSteps'
import { PaymentForm } from './payment-form'
import { getTranslations, getFormatter } from 'next-intl/server'
import { GeneralConfig, Event, Ticket } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { TypedLocale } from 'payload'
import { getMyCart } from '@/helpers/cartHelper'
import { getMeUser } from '@/utilities/getMeUser'
import { redirect } from 'next/navigation'
import { LineItem } from '@/helpers/stripeHelper'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function Payment({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Payment' })
  const tCart = await getTranslations({ locale, namespace: 'Cart' })
  const { isEnabled: draft } = await draftMode()
  const format = await getFormatter({ locale })

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

  const amountCents = Math.round((cart.totalPrice ?? 0) * 100)

  // Build line items grouped by event
  type EventSummary = { name: string; tickets: { name: string; price: number }[] }
  const eventMap = new Map<string, EventSummary>()

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

      if (eventName) {
        const existing = eventMap.get(eventName)
        if (existing) {
          existing.tickets.push({ name: ticketName, price: ticket.price })
        } else {
          eventMap.set(eventName, {
            name: eventName,
            tickets: [{ name: ticketName, price: ticket.price }],
          })
        }
      }

      return {
        name: eventName,
        description: ticketName,
        price: ticket.price,
        quantity: 1,
      } satisfies LineItem
    })
    .filter((item): item is LineItem => item !== null)

  const paymentDescription = lineItems.map((i) => i.description).join(', ')

  return (
    <main className="pt-[104px] pb-24 bg-[#fdf8f3] min-h-screen">
      {draft && <LivePreviewListener />}
      <section className="container max-w-screen-xl mx-auto px-4 mt-6">
        <CheckoutSteps current={1} />

        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm text-[#3d5a70] hover:text-[#0e7ea8] mb-5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {tCart('backToCart')}
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#0a4a6e]">{t('title')}</h1>
          <p className="text-sm text-[#3d5a70] mt-1">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Stripe payment form */}
          <div className="bg-white border-2 border-[#d4eaf2] rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#d4eaf2]">
              <div className="w-8 h-8 rounded-full bg-[#e0f5fb] flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-[#0e7ea8]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-[#0a4a6e] text-sm">{t('securePaymentTitle')}</p>
                <p className="text-xs text-[#8aaabb]">{t('securePaymentSub')}</p>
              </div>
            </div>
            <div className="p-5">
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
          </div>

          {/* Order summary */}
          <div className="bg-white border-2 border-[#d4eaf2] rounded-xl overflow-hidden lg:sticky lg:top-6">
            <div className="px-5 py-4 border-b border-[#d4eaf2]">
              <p className="font-bold text-[#0a4a6e] text-sm">{tCart('orderSummary')}</p>
            </div>
            <div className="px-5 py-4">
              {Array.from(eventMap.values()).map((ev) => (
                <div key={ev.name} className="mb-3">
                  <p className="text-xs font-semibold text-[#0f1f2e] mb-1">{ev.name}</p>
                  {ev.tickets.map((tk, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-xs text-[#3d5a70] py-0.5 pl-2 border-l-2 border-[#d4eaf2]"
                    >
                      <span>{tk.name}</span>
                      <span>{format.number(tk.price, { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="h-px bg-[#d4eaf2] my-3" />
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#3d5a70]">{tCart('processingFee')}</span>
                <span className="font-medium text-[#0f1f2e]">€ 0.00</span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-[#d4eaf2]">
                <span className="font-bold text-[#0a4a6e] text-sm">{tCart('total')}</span>
                <span className="font-extrabold text-[#0a4a6e] text-2xl">
                  {format.number(cart.totalPrice ?? 0, { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </div>
          </div>
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
