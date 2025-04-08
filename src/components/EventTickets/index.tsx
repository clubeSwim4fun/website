import { Cart, GroupCategory, Order, Ticket, User } from '@/payload-types'
import { Card } from '../ui/card'
import { ShoppingCart } from 'lucide-react'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table'
import { EventRow } from './event-row'

export const EventTickets: React.FC<{
  user?: User
  tickets?: Ticket[] | null
  cart?: Cart | null
  orderedEvent?: Order
  groups?: GroupCategory[]
}> = (props) => {
  const { tickets, cart, user, orderedEvent } = props
  const cartItems = cart && cart.items?.map((i) => i.selectedTicket as Ticket)

  if (!tickets?.length) return

  return (
    <Card
      className={`dark:bg-slate-900 transition-all duration-500 ease-in-out border rounded-xl shadow-md shadow-gray-400 border-blueSwim p-4 h-max w-full flex flex-col bg-white gap-1`}
    >
      <h3 className="font-extrabold text-2xl md:text-3xl">Tickets</h3>
      <div className="mt-2 flex flex-col gap-3">
        <Table className="w-full">
          <TableHeader className="bg-gray-100 dark:bg-slate-900">
            <TableRow className="border-b dark:border-slate-700">
              <TableHead className="text-left">Distância</TableHead>
              <TableHead className="text-left">Preço</TableHead>
              <TableHead className="text-left">
                <ShoppingCart />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets?.map((ticket) => (
              <EventRow
                ticket={ticket}
                cartItems={cartItems}
                user={user}
                key={ticket.id}
                orderedEvent={orderedEvent}
                groups={props.groups}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
