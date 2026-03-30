'use client'

import { Event, GroupCategory, Order, Ticket, User } from '@/payload-types'
import { convertMtoKm, isObjectNotEmpty } from '@/utilities/util'
import { formatDate } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Calendar1, Clock, ExternalLink, MapPin, Route, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getClientSideURL } from '@/utilities/getURL'
import { AddToCalendarButton } from '../AddToCalendarButton'
import Swimmer from '../Icons/swimmer'
import { Card } from '@/components/ui/card'
import { EventTickets } from '../EventTickets'
import { useTranslations } from 'next-intl'
import { canBuyTickets } from '@/helpers/eventHelper'

export const EventDetails: React.FC<{
  user?: User
  event: Event
  slug?: string | null
  orderedEvent?: Order
  groups?: GroupCategory[]
}> = (props) => {
  const [topClass, setTopClass] = useState('top-4')
  const { event, slug, user, orderedEvent } = props
  const t = useTranslations()

  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      if (window.scrollY < lastScrollY) {
        setTopClass('top-24')
      } else {
        setTopClass('top-4')
      }
      lastScrollY = window.scrollY
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!event) return null

  const {
    distances,
    start,
    end,
    address,
    tickets,
    timeToBeConfirmed,
    category,
    title,
    promoCode,
    memberDiscount,
    externalRegistrationUrl,
  } = event

  const eventUrl = `${getClientSideURL()}/event/${slug}`
  const eventCalendarLocation =
    `${address?.street ?? ''} ${address?.number ?? ''} ${address?.zipcode ?? ''}, ${address?.country ?? ''}`.trim()

  const initialDay = new Date(start).getDay()
  const finalDay = new Date(end).getDay()
  const isSameDay = initialDay === finalDay

  const startDate = isSameDay
    ? formatDate(start, 'PPP', { locale: pt })
    : formatDate(start, 'dd-MM-yyyy')

  const endDate = formatDate(end, 'dd-MM-yyyy')
  const startTime = formatDate(start, 'HH:mm')
  const endTime = formatDate(end, 'HH:mm')

  return (
    <aside
      className={`h-full lg:sticky ${topClass} transition-all duration-500 ease-in-out w-full lg:w-1/3 flex flex-col min-w-72`}
    >
      {/* Promo / discount badges */}
      {(promoCode || (memberDiscount && memberDiscount > 0)) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {promoCode && (
            <span className="inline-flex items-center gap-1 text-sm font-medium border border-blueSwim text-blueSwim rounded-full px-3 py-0.5">
              <Tag className="w-3 h-3" />
              {promoCode}
            </span>
          )}
          {memberDiscount && memberDiscount > 0 && (
            <span className="inline-flex items-center text-sm font-semibold bg-blueSwim text-white rounded-full px-3 py-0.5">
              {memberDiscount}% {t('Event.memberDiscount')}
            </span>
          )}
        </div>
      )}

      {/* Details card */}
      <Card className="dark:bg-slate-900 border rounded-xl shadow-md shadow-gray-400 border-blueSwim p-4 h-max w-full flex flex-col bg-white gap-1 mb-4">
        <h3 className="font-extrabold text-2xl md:text-3xl">{t('Event.details')}</h3>

        <div className="flex gap-2 items-center">
          <Calendar1 className="shrink-0" />
          <span>
            {startDate}
            {!isSameDay && ` - ${endDate}`}
          </span>
        </div>

        {startTime && (
          <div className="flex gap-2 items-center">
            <Clock className="shrink-0" />
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
          <div className="flex gap-2 items-start">
            <MapPin className="shrink-0 mt-0.5" />
            <span>
              {[address?.street, address?.state, address?.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {distances && distances.length > 0 && (
          <div className="flex gap-2 items-center">
            <Route className="shrink-0" />
            <span>{distances.map((d) => convertMtoKm(d.distance)).join(' / ')}</span>
          </div>
        )}

        {!!category && (
          <div className="flex gap-2 items-center">
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

        {externalRegistrationUrl && (
          <a
            href={externalRegistrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-blueSwim px-4 py-2 text-sm font-semibold text-white hover:bg-blueSwim/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {t('Event.register')}
          </a>
        )}
      </Card>

      {/* Internal ticket purchase — only shown when no external registration URL */}
      {user && canBuyTickets(event) && !externalRegistrationUrl && (
        <EventTickets
          tickets={tickets as Ticket[]}
          user={user}
          orderedEvent={orderedEvent}
          groups={props.groups}
        />
      )}
    </aside>
  )
}
