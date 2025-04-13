'use server'

import { getPayload, Payload, TypedLocale } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { Cart, Ticket } from '@/payload-types'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { getLocale } from 'next-intl/server'
import { isTicketAvailable } from './eventHelper'

export type responseType = {
  cart?: Cart
  success: boolean
  message: string
}

async function revalidateEvent(
  ticket: Ticket,
  payload: Payload,
  locale: TypedLocale,
): Promise<void> {
  const eventFor = ticket.eventFor
  if (typeof eventFor === 'string') {
    const event = await payload.findByID({
      collection: 'events',
      id: eventFor,
      overrideAccess: true,
    })

    if (event && event.slug) {
      revalidatePath(`/${locale}/event/${event.slug}`)
    }
  } else if (typeof eventFor === 'object' && eventFor !== null) {
    revalidatePath(`/${locale}/event/${eventFor.slug}`)
  }
}

export type cartItems = {
  selectedTicket?: (string | null) | Ticket
  selectedTshirtSize?: string | null
  id?: string | null
}

async function removeExpiredTickets(cart: Cart) {
  const removedTickets: Ticket[] = []
  const failedTickets: Ticket[] = []
  const payload = await getPayload({ config })
  const locale = await getLocale()
  const t = await getTranslations({ locale })

  if (!cart || !cart.items) throw new Error(t('Cart.cartNotFound'))

  for (const item of cart.items) {
    const ticket = item.selectedTicket as Ticket
    const udpatedTicket = await payload.findByID({
      collection: 'tickets',
      id: ticket.id,
      select: {
        start: true,
        end: true,
      },
    })

    ticket.start = udpatedTicket.start
    ticket.end = udpatedTicket.end

    if (!isTicketAvailable(ticket)) {
      removedTickets.push(ticket)
      const ticketIndex = cart.items.findIndex(
        (item) =>
          typeof item?.selectedTicket === 'object' && item?.selectedTicket?.id === ticket.id,
      )

      cart.items.splice(ticketIndex, 1)

      cart.totalPrice -= ticket.price
    }
  }

  return {
    cart: cart,
    success: removedTickets.length > 0,
    removedTickets,
    failedTickets,
  }
}

export const getMyCart = async (): Promise<Cart | undefined> => {
  const userMe = await getMeUser()

  if (!userMe || !userMe.user) {
    return
  }

  const payload = await getPayload({ config })
  const locale = await getLocale()

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
    const { cart: updatedCart } = await removeExpiredTickets(cartCollection.docs[0])

    await payload.update({
      collection: 'carts',
      data: updatedCart,
      where: {
        id: {
          equals: updatedCart.id,
        },
      },
    })

    return updatedCart
  }

  const newCart = await payload.create({
    collection: 'carts',
    data: {
      user: userMe.user,
      items: [],
      totalPrice: 0,
    },
  })

  return newCart
}

export const removeFromCart = async ({ ticket }: { ticket: Ticket }): Promise<responseType> => {
  try {
    const userMe = await getMeUser()
    const locale = await getLocale()
    const t = await getTranslations({ locale })

    if (!userMe || !userMe.user) throw new Error(t('User.userNotFound'))

    const payload = await getPayload({ config })

    const cart = await getMyCart()

    if (!cart || !cart.items) throw new Error(t('Cart.cartNotFound'))

    const ticketIndex = cart.items.findIndex(
      (item) => typeof item?.selectedTicket === 'object' && item?.selectedTicket?.id === ticket.id,
    )

    if (ticketIndex === -1) throw new Error(t('Cart.ticketNotFound'))

    cart.items.splice(ticketIndex, 1)

    cart.totalPrice -= ticket.price

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
        message: response.errors[0]?.message ?? `${t('Cart.errorRemovingTicket')} ${cart.id}`, // todo improve error typing later
        success: false,
      }
    }

    await revalidateEvent(ticket, payload, locale as TypedLocale)

    return {
      message: t('Cart.removedFromCartSuccess'),
      success: true,
    }
  } catch (error) {
    const locale = await getLocale()
    const t = await getTranslations({ locale })

    return {
      message: (error as string) || t('Cart.errorRemovingTicket'), // todo improve error typing later
      success: false,
    }
  }
}

export const addToCart = async ({ ticket }: { ticket: Ticket }): Promise<responseType> => {
  try {
    const userMe = await getMeUser()
    const locale = await getLocale()
    const t = await getTranslations({ locale })

    if (!userMe || !userMe.user) throw new Error(t('User.userNotFound'))

    const payload = await getPayload({ config })

    const cart = await getMyCart()

    if (!cart || !cart.items) {
      throw new Error(t('Cart.cartNotFound'))
    }
    cart.items.push({
      selectedTicket: ticket,
    })

    cart.totalPrice += ticket.price

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
        message: response.errors[0]?.message ?? `${t('Cart.errorAddingTicket')} ${cart.id}`, // todo improve error typing later
        success: false,
      }
    }

    await revalidateEvent(ticket, payload, locale as TypedLocale)

    return {
      message: `${ticket.name} ${t('Cart.addedToCartSuccess')}`,
      success: true,
    }
  } catch (error) {
    const locale = await getLocale()
    const t = await getTranslations({ locale })

    return {
      message: (error as string) || t('Cart.errorAddingTicket'), // todo improve error typing later
      success: false,
    }
  }
}

export const updateCart = async (selectedTshirtSize?: string[]): Promise<responseType> => {
  try {
    const userMe = await getMeUser()
    const locale = await getLocale()
    const t = await getTranslations({ locale })

    if (!userMe || !userMe.user) throw new Error(t('User.userNotFound'))

    const payload = await getPayload({ config })

    const cart = await getMyCart()

    if (!cart) throw new Error(t('Cart.cartNotFound'))

    selectedTshirtSize?.forEach((size) => {
      const ticketKey = size.split('-')[0]
      const tshirtSize = size.split('-')[1]

      const ticketIndex = cart.items!.findIndex(
        (item) =>
          typeof item?.selectedTicket === 'object' && item?.selectedTicket?.id === ticketKey,
      )

      if (ticketIndex !== -1 && cart.items) {
        cart.items[ticketIndex]!.selectedTshirtSize = tshirtSize
      }
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
        message: response.errors[0]?.message ?? `${t('Cart.errorUpdatingCart')} ${cart.id}`, // todo improve error typing later
        success: false,
      }
    }

    return {
      message: t('Cart.cartUpdated'),
      success: true,
    }
  } catch (error) {
    const locale = await getLocale()
    const t = await getTranslations({ locale })

    return {
      message: (error as string) || t('Cart.errorUpdatingCart'), // todo improve error typing later
      success: false,
    }
  }
}
