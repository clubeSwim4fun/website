import { Cart, Ticket } from '@/payload-types'
import { Card } from '../ui/card'
import { AddToCart } from '../Common/Cart/AddToCart'
import { ShoppingCart } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { RemoveFromCart } from '../Common/Cart/RemoveFromCart'

export const EventTickets: React.FC<{
  tickets?: Ticket[] | null
  cart?: Cart | null
}> = (props) => {
  const { tickets, cart } = props
  const cartItems = cart && cart.items?.map((i) => i.selectedTicket as Ticket)

  if (tickets?.length === 0) return

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
              <TableRow className="border-b dark:border-slate-700" key={ticket.id}>
                <TableCell className="text-left">{ticket.name}</TableCell>
                <TableCell className="text-left">€ {ticket.price.toFixed(2)}</TableCell>
                <TableCell className="text-left">
                  {cartItems?.some((ci) => ci.id === ticket.id) ? (
                    <RemoveFromCart ticket={ticket} />
                  ) : (
                    <AddToCart ticket={ticket} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
