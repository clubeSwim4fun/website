'use client'

import Link from 'next/link'
import { Fragment, useTransition } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RemoveFromCart } from '@/components/Common/Cart/RemoveFromCart'
import { eventTicket } from './page'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader } from 'lucide-react'

export const CartTable: React.FC<{ eventsTickets: eventTicket }> = (props) => {
  const { eventsTickets } = props
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <>
      {Object.keys(eventsTickets).map((eventKey) => (
        <Fragment key={eventKey}>
          <div className="flex justify-between w-full mt-4">
            <h2 className="text-2xl font-bold mb-3 capitalize">
              <Link href={eventsTickets[eventKey]?.slug || '/'}>{eventKey}</Link>
            </h2>
          </div>
          <Table className="w-full">
            <TableHeader className="bg-gray-100 dark:bg-slate-900">
              <TableRow className="border-b dark:border-slate-700">
                <TableHead className="text-left max-w-[50%]">Bilhete</TableHead>
                <TableHead className="text-center max-w-[30%]">
                  Preço (total: €{' '}
                  {eventsTickets[eventKey] &&
                    eventsTickets[eventKey].tickets
                      .reduce((total, ticket) => total + (ticket.price || 0), 0)
                      .toFixed(2)}
                  )
                </TableHead>
                <TableHead className="text-center max-w-[20%]">Remover</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventsTickets[eventKey] &&
                eventsTickets[eventKey].tickets.map((ticket) => {
                  const cartItemTicket = ticket
                  if (!cartItemTicket) return null
                  return (
                    <TableRow className="border-b dark:border-slate-700" key={ticket.id}>
                      <TableCell className="text-left max-w-[50%]">{cartItemTicket.name}</TableCell>
                      <TableCell className="text-center max-w-[30%]">
                        {`€ ${cartItemTicket.price.toFixed(2)}`}
                      </TableCell>
                      <TableCell className="text-center max-w-[20%]">
                        <RemoveFromCart ticket={cartItemTicket} disabled={isPending} />
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </Fragment>
      ))}
      <div className="flex flex-col justify-end items-end mt-6 text-end">
        <p className="font-bold text-lg">Total do carrinho: € 80.00</p>
        <Button
          className="group w-fit mt-4"
          disabled={isPending}
          onClick={() => startTransition(() => router.push('/payment'))}
        >
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Ir para o pagamento{' '}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-all duration-500" />
            </>
          )}
        </Button>
      </div>
    </>
  )
}
