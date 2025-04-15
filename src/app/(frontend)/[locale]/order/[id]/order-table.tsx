import Link from 'next/link'
import { Fragment } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Event, Order, Ticket } from '@/payload-types'
import { getFormatter, getLocale, getTranslations } from 'next-intl/server'
import { convertMtoKm } from '@/utilities/util'

type OrderEventTicket = {
  ticket: Ticket
  tshirtSize?: string | null
  ticketPurchased?: boolean | null
  eventPurchaseId?: string | null
  id?: string | null
}

type OrderEvent = {
  event?: Event
  tickets?: OrderEventTicket[] | null
  id?: string | null
}

export const OrderTable: React.FC<{ order?: Order }> = async (props) => {
  const { order } = props
  const locale = await getLocale()
  const t = await getTranslations({ locale })
  const format = await getFormatter({ locale })

  return order?.events?.map((orderEvent) => {
    const eventObj = orderEvent as OrderEvent
    return (
      <Fragment key={orderEvent.id}>
        <div className="flex justify-between w-full mt-4">
          <h2 className="text-2xl font-bold mb-3 capitalize">
            <Link href={`/event/${eventObj?.event?.slug}` || '/'}>{eventObj?.event?.title}</Link>
          </h2>
        </div>
        <Table className="w-full mt-0">
          <TableHeader className="bg-gray-100 dark:bg-slate-900">
            <TableRow className="border-b dark:border-slate-700">
              <TableHead className="text-left max-w-[50%]">{t('Cart.ticket')}</TableHead>
              <TableHead className="text-center max-w-[50%]">{t('Event.distance')}</TableHead>
              {eventObj?.event?.hasTshirt && (
                <TableHead className="text-center max-w-[10%]">{t('Cart.tShirtSize')}</TableHead>
              )}
              <TableHead className="text-right max-w-[30%]">
                {t(
                  'Cart.eventTotalPrice',
                  {
                    price:
                      (eventObj &&
                        eventObj?.tickets &&
                        eventObj?.tickets.reduce(
                          (total, t) =>
                            total + ((typeof t.ticket === 'object' && t.ticket.price) || 0),
                          0,
                        )) ||
                      0,
                  },
                  { number: { currency: { style: 'currency', currency: 'EUR' } } },
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventObj.tickets &&
              eventObj.tickets.map((ticket) => {
                const orderItemTicket = ticket as OrderEventTicket
                if (!orderItemTicket) return null

                return (
                  <TableRow className="border-b dark:border-slate-700" key={orderItemTicket.id}>
                    <TableCell className="text-left max-w-[50%]">
                      {orderItemTicket.ticket.name}
                    </TableCell>
                    <TableCell className="text-center max-w-[50%]">
                      {convertMtoKm(orderItemTicket.ticket.distance)}
                    </TableCell>
                    {eventObj?.event?.hasTshirt && (
                      <TableCell className="text-center max-w-[10%]">
                        {orderItemTicket.tshirtSize}
                      </TableCell>
                    )}
                    <TableCell className="text-right max-w-[30%]">
                      {`${format.number(orderItemTicket.ticket.price, {
                        style: 'currency',
                        currency: 'EUR',
                      })}`}
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </Fragment>
    )
  })
}
