'use server'

import { getMyCart } from '@/helpers/cartHelper'
import { TypedLocale } from 'payload'
import config from '@payload-config'
import { Event, Ticket } from '@/payload-types'
import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import { getMeUser } from '@/utilities/getMeUser'

type eventTicket = {
  [key: string]: {
    id?: string | null
    tickets: Ticket[]
  }
}

/**
 * Creates a pending order record before payment starts.
 * Pass the returned `orderId` as `recordId` in the Stripe payment intent metadata
 * with `type: 'order'`.
 * The webhook confirms payment, sends the confirmation email, and creates the invoice.
 */
export const createPendingOrder = async (
  locale: TypedLocale,
): Promise<{ success: boolean; orderId?: string; message?: string }> => {
  const cart = await getMyCart()
  const payload = await getPayload({ config })

  if (!cart) return { success: false, message: 'Cart not found' }
  if (!cart.items?.length) return { success: false, message: 'Cart is empty' }

  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) return { success: false, message: 'Error creating transaction' }

  try {
    const eventsTickets: eventTicket = {}

    cart.items.forEach((item) => {
      const ticket = item.selectedTicket as Ticket
      const eventFor = ticket.eventFor as Event
      if (!eventsTickets[eventFor.title]) {
        eventsTickets[eventFor.title] = { id: eventFor.id, tickets: [] }
      }
      eventsTickets[eventFor.title]!.tickets.push(ticket)
    })

    const response = await payload.create({
      collection: 'orders',
      data: {
        user: cart.user,
        cartId: cart.id,
        events: Object.keys(eventsTickets).map((eventTitle) => ({
          event: eventsTickets[eventTitle]?.id,
          tickets: eventsTickets[eventTitle]?.tickets.map((ticket) => ({
            ticket: ticket.id,
            tshirtSize: cart.items?.find(
              (item) =>
                typeof item?.selectedTicket !== 'string' && item?.selectedTicket?.id === ticket.id,
            )?.selectedTshirtSize,
            ticketPurchased: false,
          })),
        })),
        total: cart.totalPrice,
        paymentStatus: 'pending' as const,
      },
      req: { transactionID },
    })

    // Cart is intentionally NOT cleared here.
    // It will be cleared by the Stripe webhook after payment_intent.succeeded,
    // so the /payment page can still validate the cart on re-renders.

    await payload.db.commitTransaction(transactionID)

    revalidatePath(`/${locale}/payment`)

    return { success: true, orderId: response.id }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    return { success: false, message: 'Error creating order: ' + JSON.stringify(error) }
  }
}

/**
 * @deprecated Use createPendingOrder + webhook instead.
 * Kept temporarily — callers should migrate to the pre-create pattern.
 */
export const createOrder = createPendingOrder
