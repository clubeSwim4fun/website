import { GroupCategory, Order, Ticket, User } from '@/payload-types'
import { TableCell, TableRow } from '../ui/table'
import { RemoveFromCart } from '../Common/Cart/RemoveFromCart'
import { AddToCart } from '../Common/Cart/AddToCart'
import { useEffect, useState } from 'react'

export const EventRow: React.FC<{
  ticket: Ticket
  cartItems?: Ticket[] | null
  user?: User
  orderedEvent?: Order
  groups?: GroupCategory[]
}> = ({ ticket, cartItems, user, orderedEvent, groups }) => {
  const [canBeAddedToCart, setCanBeAddedToCart] = useState<boolean>(true)
  const [ticketMessage, setTicketMessage] = useState<string | null>(null)

  useEffect(() => {
    setCanBeAddedToCart(canAddToCart(ticket))
    getOrderedTicket(ticket)
  }, [])

  const getGroupName = (groupId?: (string | GroupCategory)[]) => {
    const response: string[] = []

    groups &&
      groups.forEach((group) => {
        if (groupId?.includes(group.id)) {
          response.push(group.title)
        }
      })

    return response.join(', ')
  }

  const canAddToCart = (ticket: Ticket) => {
    if (!ticket.canBePurchasedBy || ticket.canBePurchasedBy.length === 0) {
      return true
    }

    const response =
      (user &&
        user.groups?.some((group) =>
          typeof group.value === 'object'
            ? ticket.canBePurchasedBy?.includes(group.value.id)
            : ticket.canBePurchasedBy?.includes(group.value),
        )) ||
      false

    if (!response) {
      setTicketMessage(
        `Bilhete só pode ser comprado por membros do ${getGroupName(ticket?.canBePurchasedBy)}`,
      )
      return false
    }

    return response
  }

  const getOrderedTicket = (ticket: Ticket) => {
    const eventFiltered = orderedEvent?.events?.find(
      (e) =>
        typeof e?.event === 'object' &&
        e.event?.id ===
          (typeof ticket.eventFor === 'object' ? ticket.eventFor.id : ticket.eventFor),
    )

    const isTicketPurchased = eventFiltered?.tickets?.some((t) => {
      if (
        typeof t === 'object' &&
        t.ticket &&
        typeof t.ticket === 'object' &&
        t.ticket.id === ticket.id
      ) {
        return true
      }
      return false
    })

    if (isTicketPurchased) {
      setTicketMessage(`Bilhete já comprado`)
      setCanBeAddedToCart(false)
    }

    return false
  }

  return (
    <TableRow className="border-b dark:border-slate-700 h-20" key={ticket.id}>
      <TableCell className="text-left flex flex-col gap-1 h-20 justify-center">
        {ticket.name}
        {!!ticketMessage && <span className="text-destructive text-sm">{ticketMessage}</span>}
      </TableCell>
      <TableCell className="text-left">€ {ticket.price.toFixed(2)}</TableCell>
      <TableCell className="text-left">
        {cartItems?.some((ci) => ci.id === ticket.id) ? (
          <RemoveFromCart ticket={ticket} />
        ) : (
          <AddToCart ticket={ticket} disabled={!canBeAddedToCart} />
        )}
      </TableCell>
    </TableRow>
  )
}
