'use server'

import { getMyCart } from '@/helpers/cartHelper'
import { TypedLocale } from 'payload'
import config from '@payload-config'
import { Event, Ticket } from '@/payload-types'
import payload from 'payload'
import { revalidatePath } from 'next/cache'
import { render } from '@react-email/components'
import { OrderConfirmationEmail } from '@/email/orderConfirmationEmail'
import { sendEmail } from '@/helpers/emailHelper'
import { getMeUser } from '@/utilities/getMeUser'
import { getTranslations } from 'next-intl/server'
import React from 'react'

type eventTicket = {
  [key: string]: {
    id?: string | null
    tickets: Ticket[]
  }
}

export const createOrder = async (locale: TypedLocale, stripePaymentIntentId: string) => {
  // TODO integrate with payment gateway

  const { user } = await getMeUser()
  const t = await getTranslations({ locale, namespace: 'Email' })
  const cart = await getMyCart()
  // const payload = await getPayload({ config })

  await payload.init({ config })

  if (!cart) {
    return {
      success: false,
      message: 'Cart not found',
    }
  }

  if (cart.items && cart.items.length === 0) {
    return {
      success: false,
      message: 'Cart is empty',
    }
  }

  const transactionID = await payload.db.beginTransaction()

  if (!transactionID) {
    return {
      success: false,
      message: 'Error creating transaction',
    }
  }

  try {
    const eventsTickets: eventTicket = {}

    cart?.items?.forEach((item) => {
      const ticket = item.selectedTicket as Ticket
      const eventFor = ticket.eventFor as Event

      if (!eventsTickets[eventFor.title]) {
        eventsTickets[eventFor.title] = { id: eventFor.id, tickets: [] }
      }

      eventsTickets[eventFor.title]?.tickets.push(ticket)
    })

    const newOrder = {
      user: cart.user,
      events: Object.keys(eventsTickets).map((eventTitle) => {
        return {
          event: eventsTickets[eventTitle]?.id,
          tickets: eventsTickets[eventTitle]?.tickets.map((ticket) => {
            return {
              ticket: ticket.id,
              tshirtSize: cart.items?.find(
                (item) =>
                  typeof item?.selectedTicket !== 'string' &&
                  item?.selectedTicket?.id === ticket.id,
              )?.selectedTshirtSize,
              ticketPurchased: false,
            }
          }),
        }
      }),
      total: cart.totalPrice,
      stripePaymentIntentId,
      paymentStatus: 'paid' as const,
    }

    const response = await payload.create({
      collection: 'orders',
      data: newOrder,
      req: { transactionID },
    })

    const cartResponse = await payload.update({
      collection: 'carts',
      data: {
        items: [],
        totalPrice: 0,
      },
      where: {
        id: {
          equals: cart.id,
        },
      },
      req: { transactionID },
    })

    await payload.db.commitTransaction(transactionID)

    revalidatePath(`/${locale}/payment`)

    // Email is best-effort — don't let it fail the order
    try {
      const firstEventTitle = Object.keys(eventsTickets)[0] ?? ''
      const emailHtml = await render(
        React.createElement(OrderConfirmationEmail, { order: response }),
      )
      await sendEmail({
        emailHtml,
        subject: t('OrderConfirmation.subject', { eventName: firstEventTitle }),
        to: user?.email ?? '',
      })
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError)
    }

    // Fire-and-forget invoice creation
    ;(async () => {
      try {
        const { createDraftInvoice } = await import('@/helpers/invoiceHelper')

        // Aggregate line items: one per distinct eventTitle+ticketName pair
        const lineItemMap = new Map<
          string,
          {
            name: string
            description: string
            unit_price: string
            quantity: number
            tax: { name: 'IVA0' }
          }
        >()
        cart?.items?.forEach((item) => {
          const ticket = item.selectedTicket as Ticket
          const eventFor = ticket.eventFor as Event
          const key = `${eventFor.title}__${ticket.name}`
          const existing = lineItemMap.get(key)
          if (existing) {
            existing.quantity += 1
          } else {
            lineItemMap.set(key, {
              name: typeof eventFor.title === 'string' ? eventFor.title : String(eventFor.title),
              description: typeof ticket.name === 'string' ? ticket.name : String(ticket.name),
              unit_price: ticket.price.toFixed(2),
              quantity: 1,
              tax: { name: 'IVA0' },
            })
          }
        })

        const fullUser = await payload.findByID({
          collection: 'users',
          id: typeof cart.user === 'string' ? cart.user : cart.user!.id,
        })

        await createDraftInvoice({
          user: {
            name: fullUser.name,
            surname: fullUser.surname,
            email: fullUser.email,
            associateId: fullUser.associateId ?? '',
            nif: fullUser.nif,
          },
          lineItems: Array.from(lineItemMap.values()),
          context: 'order',
          stripePaymentIntentId,
        })
      } catch (err) {
        console.error('[createOrder] Invoice creation failed:', err)
      }
    })()

    return {
      success: true,
      message: 'Order created successfully',
      orderId: response.id,
    }
  } catch (error) {
    // Rollback the transaction
    await payload.db.rollbackTransaction(transactionID)

    return {
      success: false,
      message: 'Error creating order: ' + JSON.stringify(error),
    }
  }
}
