'use client'

import Link from 'next/link'
import { Fragment, useTransition } from 'react'
import { RemoveFromCart } from '@/components/Common/Cart/RemoveFromCart'
import { eventTicket } from './page'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/routing'
import { ArrowRight, CalendarDays, Info, Loader, MapPin, ShoppingBag } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateCart } from '@/helpers/cartHelper'
import { useToast } from '@/hooks/use-toast'
import { Controller, useForm } from 'react-hook-form'
import { Error } from '@/blocks/Form/Error'
import { cn } from '@/utilities/ui'
import { useFormatter, useTranslations } from 'next-intl'
import { convertMtoKm } from '@/utilities/util'

const EVENT_BAR_COLORS = [
  'bg-[#0e7ea8]',
  'bg-green-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
]

export const CartTable: React.FC<{ eventsTickets: eventTicket; total?: number }> = (props) => {
  const { eventsTickets, total } = props
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations()
  const format = useFormatter()

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<Record<string, string>>({ defaultValues: {} })

  const submitCart = (data: Record<string, string>) => {
    const selectedTshirts = Object.entries(data).map(([key, value]) => `${key}-${value}`)
    startTransition(async () => {
      const response = await updateCart(selectedTshirts)
      if (!response.success) {
        toast({
          variant: 'destructive',
          description: response.message || t('Common.unexpectedError'),
        })
        return
      }
      router.push('/payment')
    })
  }

  const eventKeys = Object.keys(eventsTickets)
  const totalTickets = eventKeys.reduce((sum, k) => sum + eventsTickets[k]!.tickets.length, 0)

  return (
    <form onSubmit={handleSubmit(submitCart)}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* LEFT: event blocks */}
        <div className="flex flex-col gap-4">
          {/* info banner */}
          <div className="flex gap-2.5 items-start bg-[#e0f5fb] border border-[#3bb8d8] rounded-xl p-3.5 text-sm text-[#0a4a6e] leading-relaxed">
            <Info className="w-4 h-4 text-[#0e7ea8] flex-shrink-0 mt-0.5" />
            <span>{t('Cart.reservationNotice')}</span>
          </div>

          {eventKeys.map((eventKey, i) => {
            const eventData = eventsTickets[eventKey]!
            const barColor = EVENT_BAR_COLORS[i % EVENT_BAR_COLORS.length]
            const subtotal = eventData.tickets.reduce((s, tk) => s + (tk.price || 0), 0)

            return (
              <div
                key={eventKey}
                className="bg-white border-2 border-[#d4eaf2] rounded-xl overflow-hidden"
              >
                <div className="grid grid-cols-[6px_1fr]">
                  <div className={cn('self-stretch', barColor)} />
                  <div>
                    {/* event header */}
                    <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#d4eaf2]">
                      <div>
                        <Link
                          href={`/event/${eventData.slug || ''}`}
                          className="font-bold text-[#0a4a6e] text-[15px] hover:text-[#0e7ea8] transition-colors"
                        >
                          {eventKey}
                        </Link>
                        <div className="flex gap-3 mt-1 flex-wrap">
                          {eventData.date && (
                            <span className="flex items-center gap-1 text-xs text-[#8aaabb]">
                              <CalendarDays className="w-3 h-3" />
                              {eventData.date}
                            </span>
                          )}
                          {eventData.location && (
                            <span className="flex items-center gap-1 text-xs text-[#8aaabb]">
                              <MapPin className="w-3 h-3" />
                              {eventData.location}
                            </span>
                          )}
                          <span className="text-xs text-[#8aaabb]">
                            {eventData.tickets.length}{' '}
                            {eventData.tickets.length === 1 ? t('Cart.ticket') : t('Cart.tickets')}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#e0f5fb] text-[#0a4a6e] whitespace-nowrap flex-shrink-0">
                        {format.number(subtotal, { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>

                    {/* ticket rows */}
                    <div>
                      {/* table header — desktop only */}
                      <div className="hidden sm:grid grid-cols-[1fr_80px_80px_auto] gap-2 px-5 py-2.5 bg-[#f0fafd] border-b border-[#d4eaf2]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aaabb]">
                          {t('Cart.ticket')}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aaabb]">
                          {t('Event.distance')}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aaabb] text-right">
                          {t('Event.price')}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aaabb] text-right">
                          {t('Common.remove')}
                        </span>
                      </div>

                      {eventData.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="border-b border-[#d4eaf2] last:border-b-0 px-5 py-3.5 hover:bg-[#f0fafd] transition-colors"
                        >
                          {/* mobile: card layout */}
                          <div className="flex items-center gap-3 sm:hidden">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#0f1f2e] truncate">
                                {ticket.name}
                              </p>
                              <p className="text-xs text-[#8aaabb] mt-0.5">
                                {convertMtoKm(ticket.distance)}
                              </p>
                              {eventData.hasTshirt && (
                                <div className="mt-1.5">
                                  <Controller
                                    control={control}
                                    defaultValue=""
                                    name={ticket.id}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, value } }) => (
                                      <div>
                                        <Select
                                          onValueChange={onChange}
                                          value={value}
                                          disabled={isPending}
                                          {...register(ticket.id, { required: true })}
                                        >
                                          <SelectTrigger
                                            className={cn('h-7 text-xs max-w-[120px]', {
                                              'border-destructive': errors[ticket.id],
                                            })}
                                          >
                                            <SelectValue placeholder={t('Cart.tShirtSize')} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {eventData.tshirtSizes?.map((size) => (
                                              <SelectItem
                                                key={size}
                                                value={size}
                                                className="text-xs"
                                              >
                                                {size}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        {errors[ticket.id] && <Error />}
                                      </div>
                                    )}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <span className="text-sm font-bold text-[#0a4a6e]">
                                {format.number(ticket.price, {
                                  style: 'currency',
                                  currency: 'EUR',
                                })}
                              </span>
                              <RemoveFromCart ticket={ticket} disabled={isPending} />
                            </div>
                          </div>
                          {/* desktop: grid layout */}
                          <div className="hidden sm:grid grid-cols-[1fr_80px_80px_auto] gap-2 items-center">
                            <div>
                              <p className="text-sm font-medium text-[#0f1f2e]">{ticket.name}</p>
                              {eventData.hasTshirt && (
                                <div className="mt-1.5">
                                  <Controller
                                    control={control}
                                    defaultValue=""
                                    name={ticket.id}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, value } }) => (
                                      <div>
                                        <Select
                                          onValueChange={onChange}
                                          value={value}
                                          disabled={isPending}
                                          {...register(ticket.id, { required: true })}
                                        >
                                          <SelectTrigger
                                            className={cn('h-7 text-xs max-w-[120px]', {
                                              'border-destructive': errors[ticket.id],
                                            })}
                                          >
                                            <SelectValue placeholder={t('Cart.tShirtSize')} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {eventData.tshirtSizes?.map((size) => (
                                              <SelectItem
                                                key={size}
                                                value={size}
                                                className="text-xs"
                                              >
                                                {size}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        {errors[ticket.id] && <Error />}
                                      </div>
                                    )}
                                  />
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-[#3d5a70]">
                              {convertMtoKm(ticket.distance)}
                            </span>
                            <span className="text-sm font-bold text-[#0a4a6e] text-right">
                              {format.number(ticket.price, { style: 'currency', currency: 'EUR' })}
                            </span>
                            <div className="flex justify-end">
                              <RemoveFromCart ticket={ticket} disabled={isPending} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT: order summary */}
        <div className="bg-white border-2 border-[#d4eaf2] rounded-xl overflow-hidden lg:sticky lg:top-6">
          <div className="px-5 py-4 border-b border-[#d4eaf2]">
            <p className="font-bold text-[#0a4a6e] text-sm">{t('Cart.orderSummary')}</p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 bg-[#e0f5fb] rounded-lg px-3 py-2 text-xs text-[#0e7ea8] font-medium mb-4">
              <ShoppingBag className="w-3.5 h-3.5" />
              {totalTickets} {totalTickets === 1 ? t('Cart.ticket') : t('Cart.tickets')} ·{' '}
              {eventKeys.length} {t('Cart.events')}
            </div>

            <div className="flex flex-col gap-1 mb-3">
              {eventKeys.map((eventKey) => {
                const subtotal = eventsTickets[eventKey]!.tickets.reduce(
                  (s, tk) => s + (tk.price || 0),
                  0,
                )
                return (
                  <div
                    key={eventKey}
                    className="flex justify-between text-sm py-1.5 border-b border-[#d4eaf2] last:border-b-0"
                  >
                    <span className="text-[#3d5a70] truncate mr-2">{eventKey}</span>
                    <span className="font-medium text-[#0f1f2e] flex-shrink-0">
                      {format.number(subtotal, { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                )
              })}
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-[#3d5a70]">{t('Cart.processingFee')}</span>
                <span className="font-medium text-[#0f1f2e]">€ 0.00</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-5 pt-1">
              <span className="font-bold text-[#0a4a6e] text-sm">{t('Cart.total')}</span>
              <span className="font-extrabold text-[#0a4a6e] text-2xl">
                {format.number(total || 0, { style: 'currency', currency: 'EUR' })}
              </span>
            </div>

            <Button
              className="w-full bg-gradient-to-br from-[#0a4a6e] to-[#0e7ea8] hover:opacity-90 text-white font-bold rounded-xl py-5 gap-2"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t('Cart.proceedToPayment')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-[10px] text-[#8aaabb] mt-2.5">
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
              {t('Cart.secureNote')}
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
