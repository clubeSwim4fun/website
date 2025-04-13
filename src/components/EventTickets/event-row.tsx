import { GroupCategory, Order, Ticket, User } from '@/payload-types'
import { TableCell, TableRow } from '../ui/table'
import { RemoveFromCart } from '../Common/Cart/RemoveFromCart'
import { AddToCart } from '../Common/Cart/AddToCart'
import { useEffect, useState } from 'react'
import { useFormatter, useTranslations } from 'next-intl'
import { convertMtoKm } from '@/utilities/util'
import { HoverCard, HoverCardContent } from '@radix-ui/react-hover-card'
import { HoverCardTrigger } from '../ui/hover-card'
import { TriangleAlert } from 'lucide-react'

export const EventRow: React.FC<{
  ticket: Ticket
  cartItems?: Ticket[] | null
  user?: User
  orderedEvent?: Order
  groups?: GroupCategory[]
}> = ({ ticket, cartItems, user, orderedEvent, groups }) => {
  const [canBeAddedToCart, setCanBeAddedToCart] = useState<boolean>(true)
  const [ticketMessage, setTicketMessage] = useState<string | null>(null)
  const t = useTranslations()
  const format = useFormatter()

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    setCanBeAddedToCart(canAddToCart(ticket))
    getOrderedTicket(ticket)
  }, [])

  const getGroupName = (groupId?: (string | GroupCategory)[]) => {
    const response: string[] = []

    groups?.forEach((group) => {
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
        t('Event.ticketOnlyForMembersOf', {
          groups: getGroupName(ticket?.canBePurchasedBy),
        }),
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
      setTicketMessage(t('Event.ticketAlreadyPurchased'))
      setCanBeAddedToCart(false)
    }

    return false
  }

  return (
    <TableRow className="border-b dark:border-slate-700 h-20" key={ticket.id}>
      <TableCell className="text-left">{ticket.name}</TableCell>
      <TableCell className="text-left">{convertMtoKm(ticket.distance)}</TableCell>
      <TableCell className="text-left">
        {ticketMessage ? (
          <>
            <HoverCard openDelay={0}>
              <HoverCardTrigger asChild>
                <button onClick={(e) => e.stopPropagation()}>
                  <TriangleAlert className="w-4 h-4 fill-yellow-500" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent
                align="center"
                side="top"
                className="w-auto container mx-auto text-center bg-white shadow-xl p-4 z-10"
              >
                {ticketMessage}
              </HoverCardContent>
            </HoverCard>
          </>
        ) : (
          format.number(ticket.price, {
            currency: 'EUR',
            style: 'currency',
          })
        )}
      </TableCell>
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
