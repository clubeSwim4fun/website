'use server'

import { Event, Ticket, User } from '@/payload-types'
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

export type FeesType = {
  registrationFee?: number | null
  monthlyFee: number
  limitDate: number
  periodicity: '1' | '3' | '12'
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

  await payload.update({
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

export type FeeDataResponse = { amount: number; startDate: Date; endDate: Date }

const getMonthlyData = async ({
  monthlyFee,
  periodicityNumber,
  payForCurrentMonth,
  limitDate,
}: {
  monthlyFee: number
  periodicityNumber: number
  limitDate: number
  payForCurrentMonth?: boolean
}): Promise<FeeDataResponse> => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth() + (currentDay < limitDate || payForCurrentMonth ? 0 : 1)

  if (periodicityNumber === 12) {
    const monthsToPay = periodicityNumber - currentMonth
    const startDate = new Date(Date.UTC(currentYear, 0, 1))
    const endDate = new Date(Date.UTC(currentYear, 11, 31))

    return {
      amount: monthsToPay * monthlyFee,
      endDate,
      startDate,
    }
  }

  if (periodicityNumber === 3) {
    const monthsToPay = 3
    const startDate = new Date(Date.UTC(currentYear, currentMonth, 1))
    const maxMonth = currentMonth + 3 > 12 ? 12 : currentMonth + 3
    const endDate = new Date(Date.UTC(currentYear, maxMonth, 1))
    endDate.setDate(endDate.getDate() - 1)

    return {
      amount: monthsToPay * monthlyFee,
      startDate,
      endDate,
    }
  }
  if (periodicityNumber === 1) {
    const startDate = new Date(Date.UTC(currentYear, currentMonth, 1))
    const endDate = new Date(Date.UTC(currentYear, currentMonth + 1, 1))
    endDate.setDate(endDate.getDate() - 1)

    return {
      amount: monthlyFee,
      startDate,
      endDate,
    }
  } else {
    throw new Error('Periodicity does not match available options')
  }
}

export const getUserPaymentAmount = async ({
  user,
  fees,
  payForCurrentMonth,
}: {
  user?: User
  fees?: FeesType
  payForCurrentMonth?: boolean
}): Promise<FeeDataResponse> => {
  if (!fees) {
    return {
      amount: 0,
      startDate: new Date(Date.UTC(new Date().getFullYear(), 0, 1)),
      endDate: new Date(Date.UTC(new Date().getFullYear(), 11, 31)),
    }
  }

  const { monthlyFee, periodicity, registrationFee, limitDate } = fees
  const periodicityNumber = Number(periodicity)

  if (user?.status === 'pendingPayment') {
    let total = 0

    const monthlyData = await getMonthlyData({
      monthlyFee,
      periodicityNumber,
      limitDate,
      payForCurrentMonth,
    })

    total += registrationFee || 0
    total += monthlyData.amount

    return {
      amount: total,
      startDate: monthlyData.startDate,
      endDate: monthlyData.endDate,
    }
  }

  if (user?.status === 'expired') {
    const monthlyData = await getMonthlyData({
      monthlyFee,
      periodicityNumber,
      limitDate,
      payForCurrentMonth,
    })

    return {
      amount: monthlyData.amount,
      startDate: monthlyData.startDate,
      endDate: monthlyData.endDate,
    }
  }

  return {
    amount: 0,
    startDate: new Date(Date.UTC(new Date().getFullYear(), 0, 1)),
    endDate: new Date(Date.UTC(new Date().getFullYear(), 11, 31)),
  }
}

export const verifyUserStatus = async (user?: User) => {
  const payload = await getPayload({ config })

  if (user && user.status === 'active') {
    const today = new Date()
    const result = await payload.find({
      collection: 'subscription',
      sort: '-endDate',
      limit: 1,
      where: {
        user: {
          equals: user.id,
        },
      },
    })

    const lastPaidFee = result.docs[0]
    const lastSubscriptionDay = lastPaidFee?.endDate ? new Date(lastPaidFee.endDate) : undefined
    if (!lastSubscriptionDay || today > lastSubscriptionDay) {
      await payload.update({
        collection: 'users',
        data: {
          status: 'expired',
        },
        where: {
          id: {
            equals: user.id,
          },
        },
      })
    }
  }
}
