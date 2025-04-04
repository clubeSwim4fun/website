'use server'

import { getPayload, Payload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { Cart, Ticket } from '@/payload-types'
import { revalidatePath } from 'next/cache'
import { se } from 'date-fns/locale'
import { select } from 'node_modules/payload/dist/fields/validations'

export type responseType = {
  success: boolean
  message: string
}

async function revalidateEvent(ticket: Ticket, payload: Payload): Promise<void> {
  const eventFor = ticket.eventFor
  if (typeof eventFor === 'string') {
    const event = await payload.findByID({
      collection: 'events',
      id: eventFor,
      overrideAccess: true,
    })

    if (event && event.slug) {
      revalidatePath(`/event/${event.slug}`)
    }
  } else if (typeof eventFor === 'object' && eventFor !== null) {
    revalidatePath(`/event/${eventFor.slug}`)
  }
}

export const getMyCart = async (): Promise<Cart | undefined> => {
  const userMe = await getMeUser()

  if (!userMe || !userMe.user) {
    return
  }

  const payload = await getPayload({ config })

  const cartCollection = await payload.find({
    collection: 'carts',
    limit: 1,
    where: {
      user: {
        equals: userMe.user.id,
      },
    },
  })

  if (cartCollection?.docs?.length !== 0 && cartCollection.docs[0]) {
    return cartCollection.docs[0]
  }

  const newCart = await payload.create({
    collection: 'carts',
    data: {
      user: userMe.user,
      items: [],
    },
  })

  return newCart
}

export const removeFromCart = async ({ ticket }: { ticket: Ticket }): Promise<responseType> => {
  try {
    const userMe = await getMeUser()

    if (!userMe || !userMe.user) throw new Error('user not found')

    const payload = await getPayload({ config })

    const cart = await getMyCart()

    if (!cart || !cart.items) throw new Error('cart not found')

    const ticketIndex = cart.items.findIndex(
      (item) => typeof item?.selectedTicket === 'object' && item?.selectedTicket?.id === ticket.id,
    )

    if (ticketIndex === -1) throw new Error('ticket not found in cart')

    cart.items.splice(ticketIndex, 1)

    const response = await payload.update({
      collection: 'carts',
      data: cart,
      where: {
        _id: {
          equals: cart.id,
        },
      },
    })

    if (response && response.errors && response.errors.length > 0) {
      return {
        message: response.errors[0]?.message ?? `Error removing from cart ${cart.id}`, // todo improve error typing later
        success: false,
      }
    }

    await revalidateEvent(ticket, payload)

    return {
      message: 'Ticket removed from cart', // TODO - Add translations
      success: true,
    }
  } catch (error) {
    return {
      message: (error as string) || 'Error removing from cart', // todo improve error typing later
      success: false,
    }
  }
}

export const addToCart = async ({ ticket }: { ticket: Ticket }): Promise<responseType> => {
  try {
    const userMe = await getMeUser()

    if (!userMe || !userMe.user) throw new Error('user not found')

    const payload = await getPayload({ config })

    const cart = await getMyCart()

    if (!cart || !cart.items) {
      throw new Error('cart not found')
    }
    cart.items.push({
      selectedTicket: ticket,
    })

    const response = await payload.update({
      collection: 'carts',
      data: cart,
      where: {
        _id: {
          equals: cart.id,
        },
      },
    })

    if (response && response.errors && response.errors.length > 0) {
      return {
        message: response.errors[0]?.message ?? `Error adding to cart ${cart.id}`, // todo improve error typing later
        success: false,
      }
    }

    await revalidateEvent(ticket, payload)

    return {
      message: `${ticket.name} added to cart`,
      success: true,
    }
  } catch (error) {
    return {
      message: (error as string) || 'Error adding to cart', // todo improve error typing later
      success: false,
    }
  }
}
