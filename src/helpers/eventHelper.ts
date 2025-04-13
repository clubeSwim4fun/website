import { Event, Ticket } from '@/payload-types'

export function isPastDate(date: Date | string | number): boolean {
  const currentDate = new Date().toISOString()
  const isoDate = new Date(date).toISOString()

  return isoDate < currentDate
}

export const isTicketAvailable = (ticket: Ticket): boolean => {
  return isPastDate(ticket.start) && !isPastDate(ticket.end)
}

export const canBuyTickets = (event: Event): boolean => {
  const eventStartDate = event.start

  if (isPastDate(eventStartDate)) {
    return false
  }

  if (!event || !event.tickets || (event.tickets && event.tickets.length === 0)) {
    return false
  } else {
    const allTicketsPast = event.tickets.every((ticket) => !isTicketAvailable(ticket as Ticket))

    return !allTicketsPast
  }
}
