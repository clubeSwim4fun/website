'use client'

import { Cart, Event, GroupCategory, Order, Ticket, User } from '@/payload-types'
import { convertMtoKm, isObjectNotEmpty } from '@/utilities/util'
import { formatDate } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Calendar1, Clock, MapPin, Route } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getClientSideURL } from '@/utilities/getURL'
import { AddToCalendarButton } from '../AddToCalendarButton'
import Swimmer from '../Icons/swimmer'
import { Card } from '../ui/card'
import { EventTickets } from '../EventTickets'
import { useTranslations } from 'next-intl'
import { canBuyTickets } from '@/helpers/eventHelper'

export const EventDetails: React.FC<{
  user?: User
  event: Event
  slug?: string | null
  cart?: Cart | null
  orderedEvent?: Order
  groups?: GroupCategory[]
}> = (props) => {
  const [topClass, setTopClass] = useState('top-4')
  const { event, slug, cart, user, orderedEvent } = props
  const t = useTranslations()

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      if (window.scrollY < lastScrollY) {
        // Scrolling up
        setTopClass('top-24')
      } else {
        // Scrolling down or idle
        setTopClass('top-4')
      }
      lastScrollY = window.scrollY
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  if (!event) return

  const { distances, start, end, address, tickets, timeToBeConfirmed, category, title } = event

  const eventUrl = `${getClientSideURL()}/event/${slug}`
  const eventCalendarLocation = `${address?.street} ${address?.number} ${address?.zipcode}, ${address?.country}`

  const initialDay = new Date(start).getDay()
  const finalDay = new Date(end).getDay()
  const isSameDay = initialDay === finalDay

  const startDate = isSameDay
    ? formatDate(start, 'PPP', {
        locale: pt,
      })
    : formatDate(start, 'dd-MM-yyyy')

  const endDate = formatDate(end, 'dd-MM-yyyy')
  const startTime = formatDate(start, 'hh:mm a')
  const endTime = formatDate(end, 'hh:mm a')

  return (
    <aside
      className={`h-full lg:sticky ${topClass} transition-all duration-500 ease-in-out w-full lg:w-1/3 flex flex-col min-w-72`}
    >
      <Card className="dark:bg-slate-900 border rounded-xl shadow-md shadow-gray-400 border-blueSwim p-4 h-max w-full flex flex-col bg-white gap-1 mb-4">
        <h3 className="font-extrabold text-2xl md:text-3xl">{t('Event.details')}</h3>
        <div className="flex gap-2">
          <Calendar1 />
          {
            <span>
              {startDate}
              {!isSameDay && `-${endDate}`}
            </span>
          }
        </div>
        {startTime && (
          <div className="flex gap-2">
            <Clock />
            <span>{startTime}</span>
            {endTime && <span> - {endTime}</span>}
            {timeToBeConfirmed && (
              <span className="text-xs text-gray-600 italic flex items-center">
                ({t('Event.toBeConfirmed')})
              </span>
            )}
          </div>
        )}
        {isObjectNotEmpty(address) && (
          <div className="flex gap-2">
            <MapPin />
            <span>{address?.street}</span>
            {address?.country && <span>- {address?.country}</span>}
          </div>
        )}
        {distances &&
          distances.map((d) => (
            <div className="flex gap-2">
              <Route />
              <span>{convertMtoKm(d.distance)}</span>
            </div>
          ))}
        {!!category && (
          <div className="flex gap-2">
            <Swimmer />
            <span>{typeof category === 'string' ? category : category.title}</span>
          </div>
        )}
        <AddToCalendarButton
          title={title}
          description={eventUrl}
          label={t('Event.addToCalendar')}
          location={eventCalendarLocation}
          startDate={start}
          endDate={end}
          url={eventUrl}
          options={['google', 'apple', 'msTeams', 'outlook']}
        />
      </Card>
      {user && canBuyTickets(event) && (
        <EventTickets
          tickets={tickets as Ticket[]}
          cart={cart}
          user={user}
          orderedEvent={orderedEvent}
          groups={props.groups}
        />
      )}
    </aside>
  )
}
