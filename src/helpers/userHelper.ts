'use server'

import { Event, Ticket } from '@/payload-types'
import COUNTRY_LIST from '@/utilities/countryList'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { UserFormData } from '@/components/User/user-update-form'
import { revalidatePath } from 'next/cache'

export type UserEvents = {
  eventDate?: Date | null
  eventName?: string | null
  eventUrl?: string | null
  tshirtSize?: string | null
  eventPurchaseId?: string | null
  ticket: Ticket
}

export const getCountryCode = async (countryName?: string): Promise<string | undefined> => {
  return COUNTRY_LIST.find((c) => c.name.toLowerCase() === countryName?.toLowerCase())?.code || 'PT'
}

export const getUserFutureEvents = async ({
  userId,
  page = 1,
}: {
  userId: string
  page?: number
}) => {
  const payload = await getPayload({ config })
  const userEvents: UserEvents[] = []

  const ordersCollection = await payload.find({
    collection: 'orders',
    sort: 'events.event.start',
    depth: 2,
    limit: 5,
    pagination: true,
    page,
    where: {
      and: [
        {
          user: {
            equals: userId,
          },
        },
        {
          'events.event.start': {
            greater_than: new Date(),
          },
        },
      ],
    },
  })

  ordersCollection.docs.forEach((doc) => {
    doc.events?.forEach((eventData) => {
      const event = eventData.event as Event
      eventData.tickets?.forEach((ticketData) => {
        const purchasedEvent: UserEvents = {
          ticket: ticketData.ticket as Ticket,
          eventDate: new Date(event.start),
          eventName: event.title,
          tshirtSize: ticketData.tshirtSize,
          eventPurchaseId: ticketData.eventPurchaseId,
          eventUrl: event.slug,
        }

        userEvents.push(purchasedEvent)
      })
    })
  })

  return { events: userEvents, totalPages: ordersCollection.totalPages }
}

export const updateUserData = async ({ user, userId }: { user: UserFormData; userId: string }) => {
  const payload = await getPayload({ config })

  const response = await payload.update({
    collection: 'users',
    data: {
      identity: user.identityCardNumber,
      phone: user.phoneNumber,
      Address: user.address,
    },
    where: {
      id: {
        equals: userId,
      },
    },
  })

  revalidatePath('/pt/my-profle')
}
