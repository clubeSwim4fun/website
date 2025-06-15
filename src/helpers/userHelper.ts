'use server'

import { Event, Gender, Ticket, User } from '@/payload-types'
import COUNTRY_LIST from '@/utilities/countryList'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import { deleteS3Files } from '@/actions/createUser'
import { getLocale, getTranslations } from 'next-intl/server'

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

type UserData = {
  nif?: string | null
  identityCardNumber?: string | null
  identityCardFile?: File[] | null
  profilePicture?: File[] | null
  disability?: string | null
  nationality?: string | null
  birthDate?: Date
  phoneNumber?: string | null
  gender?: string | Gender | null
  address: {
    street?: string | null
    number?: string | null
    state?: string | null
    zipcode?: string | null
  }
}

export const updateUserData = async ({
  user,
  data,
  isRegistrationFix,
}: {
  user: User
  data: UserData
  isRegistrationFix?: boolean
}) => {
  const payload = await getPayload({ config })
  let tempFilesToDelete: string[] = []
  const transactionID = await payload.db.beginTransaction()
  const t = await getTranslations()
  const locale = await getLocale()

  if (!transactionID) {
    return {
      success: false,
      error: t('Common.transactionError'),
    }
  }

  try {
    // Ensure nationality is one of the allowed values or undefined/null
    const allowedNationalities = COUNTRY_LIST.map((c) => c.name)
    const nationalityValue =
      data.nationality && allowedNationalities.includes(data.nationality)
        ? (data.nationality as User['nationality'])
        : undefined

    const dataToUpdate = isRegistrationFix
      ? {
          status: 'pendingAnalysis' as User['status'],
          fieldsToUpdate: [],
          nif: data.nif,
          identity: data.identityCardNumber,
          disability: data.disability
            ? Array.isArray(data.disability)
              ? data.disability
              : [data.disability]
            : undefined,
          nationality: nationalityValue,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          Address: data.address,
        }
      : {
          identity: data.identityCardNumber,
          phone: data.phoneNumber,
          Address: data.address,
        }

    await payload.update({
      collection: 'users',
      req: { transactionID },
      data: dataToUpdate,
      where: {
        id: {
          equals: user.id,
        },
      },
    })

    if (data.identityCardFile) {
      tempFilesToDelete = await uploadUserFiles({
        transactionID,
        files: data.identityCardFile,
        user,
        dataRelatesTo: 'identityFile',
      })
    }

    if (data.profilePicture) {
      tempFilesToDelete = await uploadUserFiles({
        transactionID,
        files: data.profilePicture,
        user,
        dataRelatesTo: 'profilePicture',
      })
    }

    await payload.db.commitTransaction(transactionID)

    revalidatePath(`/${locale}/${isRegistrationFix ? 'subscription' : 'my-profle'}`)
  } catch (error) {
    console.error('Error updating user data:', error)
    await payload.db.rollbackTransaction(transactionID)

    await deleteS3Files(tempFilesToDelete)
  }
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

export const uploadUserFiles = async ({
  transactionID,
  files,
  user,
  dataRelatesTo,
}: {
  transactionID: string | number
  files: File[]
  user: User
  dataRelatesTo: string
}): Promise<string[]> => {
  const payload = await getPayload({ config })

  const tempFilesToDelete: string[] = []
  const mediaToUploadIds: string[] = []

  for (const file of files) {
    const fileBuffer = await file?.arrayBuffer()

    if (fileBuffer) {
      const mediaToUpload = await payload.create({
        req: { transactionID },
        collection: 'user-media',
        data: {
          alt: `${user.name}_image`,
          user: user.id,
        },
        file: {
          data: Buffer.from(fileBuffer),
          name: file.name,
          mimetype: file.type,
          size: file.size,
        },
      })

      tempFilesToDelete.push(`user_media/${mediaToUpload.filename}`)
      if (mediaToUpload.sizes?.square) {
        tempFilesToDelete.push(`user_media/${mediaToUpload.sizes.square.filename}`)
      }

      mediaToUploadIds.push(mediaToUpload.id)
    }
  }

  await payload.update({
    req: { transactionID },
    collection: 'users',
    data: {
      [dataRelatesTo]: dataRelatesTo === 'profilePicture' ? mediaToUploadIds[0] : mediaToUploadIds,
    },
    where: {
      id: {
        equals: user.id,
      },
    },
  })

  return tempFilesToDelete
}
