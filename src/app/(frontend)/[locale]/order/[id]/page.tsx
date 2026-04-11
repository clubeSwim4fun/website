import type { Metadata } from 'next'
import { getPayload, TypedLocale } from 'payload'
import { getTranslations, getFormatter } from 'next-intl/server'
import { getMeUser } from '@/utilities/getMeUser'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { OrderPageClient } from './page.client'
import CheckoutSteps from '@/components/Common/CheckoutSteps'
import { Order, Ticket, Event } from '@/payload-types'
import { Check, CalendarDays, Mail, User } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { convertMtoKm } from '@/utilities/util'
import { cn } from '@/utilities/ui'
import { InvoiceDownloadButton } from './InvoiceDownloadButton'

const EVENT_BAR_COLORS = ['bg-green-500', 'bg-[#0e7ea8]', 'bg-amber-500', 'bg-purple-500']

type Args = {
  params: Promise<{ id: string; locale: TypedLocale }>
}

export default async function OrderPage({ params: paramsPromise }: Args) {
  const { id, locale } = await paramsPromise
  const t = await getTranslations({ locale, namespace: 'Order' })
  const tCart = await getTranslations({ locale, namespace: 'Cart' })
  const format = await getFormatter({ locale })

  const userObject = await getMeUser()
  const payload = await getPayload({ config })

  const orderResult = await payload.find({
    collection: 'orders',
    limit: 1,
    where: {
      and: [{ user: { equals: userObject?.user?.id } }, { id: { equals: id } }],
    },
  })

  if (!orderResult || !orderResult.totalDocs) notFound()

  const order = orderResult.docs[0] as Order

  type OrderEventTicket = {
    ticket: Ticket
    tshirtSize?: string | null
    id?: string | null
  }
  type OrderEvent = {
    event?: Event
    tickets?: OrderEventTicket[] | null
    id?: string | null
  }

  const events = (order.events ?? []) as OrderEvent[]

  return (
    <main className=" pb-24 bg-[#fdf8f3] min-h-screen">
      <OrderPageClient />
      <section className="container max-w-screen-xl mx-auto px-4 mt-6">
        <CheckoutSteps current={2} />

        {/* Hero banner */}
        <div className="bg-gradient-to-br from-[#0a4a6e] to-[#0e7ea8] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 mb-6 text-white">
          <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
            <Check className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-extrabold mb-1">{t('heroTitle')} 🎉</h1>
            <p className="text-sm opacity-80 leading-relaxed">{t('heroSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-2 text-xs font-bold flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            {t('paymentSuccessful')}
          </div>
        </div>

        {/* Order ID bar */}
        <div className="bg-[#f0fafd] border-2 border-[#d4eaf2] rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8aaabb] mb-1">
              {t('orderIdLabel')}
            </p>
            <span className="bg-[#e0f5fb] text-[#0a4a6e] font-bold text-sm px-3 py-1 rounded-full">
              {id.slice(0, 9)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#0e7ea8]">
            <Mail className="w-3.5 h-3.5" />
            {t('receiptSent')}
          </div>
        </div>

        {/* Event confirmation cards */}
        <div className="flex flex-col gap-4 mb-6">
          {events.map((orderEvent, i) => {
            const barColor = EVENT_BAR_COLORS[i % EVENT_BAR_COLORS.length]
            const subtotal = (orderEvent.tickets ?? []).reduce(
              (s, t) => s + ((typeof t.ticket === 'object' && t.ticket.price) || 0),
              0,
            )

            return (
              <div
                key={orderEvent.id}
                className="bg-white border-2 border-[#d4eaf2] rounded-xl overflow-hidden"
              >
                <div className="grid grid-cols-[6px_1fr]">
                  <div className={cn('self-stretch', barColor)} />
                  <div>
                    <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#d4eaf2]">
                      <div>
                        <p className="font-bold text-[#0a4a6e] text-sm">
                          {orderEvent.event?.title}
                        </p>
                        <div className="flex gap-3 mt-1 flex-wrap">
                          {orderEvent.event?.start && (
                            <span className="flex items-center gap-1 text-xs text-[#8aaabb]">
                              <CalendarDays className="w-3 h-3" />
                              {format.dateTime(new Date(orderEvent.event.start), {
                                dateStyle: 'medium',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 whitespace-nowrap flex-shrink-0">
                        {format.number(subtotal, { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>

                    {/* ticket header — hidden on mobile */}
                    <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px] gap-2 px-5 py-2.5 bg-[#f0fafd] border-b border-[#d4eaf2]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aaabb]">
                        {tCart('ticket')}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aaabb]">
                        {t('distance')}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aaabb] text-right">
                        {t('price')}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aaabb] text-right">
                        {t('status')}
                      </span>
                    </div>

                    {(orderEvent.tickets ?? []).map((ot) => (
                      <div
                        key={ot.id}
                        className="border-b border-[#d4eaf2] last:border-b-0 px-5 py-3.5"
                      >
                        {/* mobile: card layout */}
                        <div className="flex items-center justify-between gap-3 sm:hidden">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0f1f2e] truncate">
                              {ot.ticket.name}
                            </p>
                            <p className="text-xs text-[#8aaabb] mt-0.5">
                              {convertMtoKm(ot.ticket.distance)}
                            </p>
                            {ot.tshirtSize && (
                              <p className="text-xs text-[#8aaabb]">
                                {tCart('tShirtSize')}: {ot.tshirtSize}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-sm font-bold text-[#0a4a6e]">
                              {format.number(ot.ticket.price, {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase tracking-wide whitespace-nowrap">
                              ✓ {t('confirmed')}
                            </span>
                          </div>
                        </div>
                        {/* desktop: grid layout */}
                        <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px] gap-2 items-center">
                          <div>
                            <p className="text-sm font-medium text-[#0f1f2e]">{ot.ticket.name}</p>
                            {ot.tshirtSize && (
                              <p className="text-xs text-[#8aaabb]">
                                {tCart('tShirtSize')}: {ot.tshirtSize}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-[#3d5a70]">
                            {convertMtoKm(ot.ticket.distance)}
                          </span>
                          <span className="text-sm font-bold text-[#0a4a6e] text-right">
                            {format.number(ot.ticket.price, { style: 'currency', currency: 'EUR' })}
                          </span>
                          <div className="flex justify-end">
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 uppercase tracking-wide">
                              ✓ {t('confirmed')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Totals card */}
        <div className="bg-white border-2 border-[#d4eaf2] rounded-xl px-5 py-4 mb-6">
          {events.map((orderEvent) => {
            const subtotal = (orderEvent.tickets ?? []).reduce(
              (s, t) => s + ((typeof t.ticket === 'object' && t.ticket.price) || 0),
              0,
            )
            const count = orderEvent.tickets?.length ?? 0
            return (
              <div
                key={orderEvent.id}
                className="flex justify-between text-sm py-1.5 border-b border-[#d4eaf2]"
              >
                <span className="text-[#3d5a70]">
                  {orderEvent.event?.title} ({count}{' '}
                  {count === 1 ? tCart('ticket') : tCart('tickets')})
                </span>
                <span className="font-medium text-[#0f1f2e]">
                  {format.number(subtotal, { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            )
          })}
          <div className="flex justify-between text-sm py-1.5 border-b border-[#d4eaf2]">
            <span className="text-[#3d5a70]">{tCart('processingFee')}</span>
            <span className="font-medium text-[#0f1f2e]">€ 0.00</span>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-[#d4eaf2]">
            <span className="font-bold text-[#0a4a6e] text-sm">{t('totalPaid')}</span>
            <span className="font-extrabold text-[#0a4a6e] text-2xl">
              {format.number(order.total || 0, { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        </div>

        {/* Info box */}
        <div className="flex gap-2.5 items-start bg-[#e0f5fb] border border-[#3bb8d8] rounded-xl p-3.5 text-sm text-[#0a4a6e] leading-relaxed mb-6">
          <svg
            className="w-4 h-4 text-[#0e7ea8] flex-shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{t('infoBox')}</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <Link
            href="/my-profile"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-[#0a4a6e] to-[#0e7ea8] text-white font-bold text-sm rounded-xl px-5 py-3 hover:opacity-90 transition-opacity"
          >
            <User className="w-4 h-4" />
            {t('goToAccount')}
          </Link>
          <Link
            href="/event"
            className="inline-flex items-center gap-2 border-2 border-[#d4eaf2] text-[#0e7ea8] font-medium text-sm rounded-xl px-5 py-3 hover:bg-[#f0fafd] transition-colors"
          >
            <CalendarDays className="w-4 h-4" />
            {t('browseEvents')}
          </Link>
          {order.paymentStatus === 'paid' && order.stripePaymentIntentId && (
            <InvoiceDownloadButton paymentIntentId={order.stripePaymentIntentId} />
          )}
        </div>

        <p className="flex items-center gap-1.5 text-[10px] text-[#8aaabb] mb-6">
          <svg
            className="w-2.5 h-2.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {t('securityNote')}
        </p>

        {/* Contact bar */}
        <div className="flex items-center gap-2 flex-wrap bg-[#f0fafd] border border-[#d4eaf2] rounded-xl px-4 py-3 text-sm text-[#3d5a70]">
          <Mail className="w-3.5 h-3.5 text-[#0e7ea8]" />
          {t('questionsText')}{' '}
          <a
            href={`mailto:${t('contactEmail')}`}
            className="text-[#0e7ea8] font-medium hover:underline"
          >
            {t('contactEmail')}
          </a>
        </div>
      </section>
    </main>
  )
}
