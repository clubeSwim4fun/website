'use client'

import { Event } from '@/payload-types'
import { convertMtoKm, isObjectNotEmpty } from '@/utilities/util'
import { formatDate } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Calendar1, Clock, MapPin, Route } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getClientSideURL } from '@/utilities/getURL'
import { AddToCalendarButton } from '../AddToCalendarButton'
import Swimmer from '../Icons/swimmer'

export const EventDetails: React.FC<{
  event: Event
  slug?: string | null
}> = (props) => {
  const [topClass, setTopClass] = useState('top-4')
  const { event, slug } = props

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

  const { distance, start, end, address, tickets, timeToBeConfirmed, category, title, id } = event

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
      className={`sticky ${topClass} dark:bg-slate-900 transition-all duration-500 ease-in-out border rounded-xl shadow-md shadow-gray-400 border-blueSwim p-4 h-max w-full lg:w-1/3 flex flex-col bg-white`}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-extrabold text-2xl md:text-3xl">Detalhes</h3>
        <div className="flex gap-2">
          <Calendar1 />
          {<span>{`${startDate}${isSameDay && `-${endDate}`}`}</span>}
        </div>
        {startTime && (
          <div className="flex gap-2">
            <Clock />
            <span>{startTime}</span>
            {endTime && <span> - {endTime}</span>}
            {timeToBeConfirmed && (
              <span className="text-xs text-gray-600 italic flex items-center">(A confirmar)</span>
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
        {!!distance && (
          <div className="flex gap-2">
            <Route />
            <span>{convertMtoKm(distance)}</span>
          </div>
        )}
        {!!category && (
          <div className="flex gap-2">
            <Swimmer />
            <span>{typeof category === 'string' ? category : category.title}</span>
          </div>
        )}
        <AddToCalendarButton
          title={title}
          description={eventUrl}
          label="Adicionar ao calendário"
          location={eventCalendarLocation}
          startDate={start}
          endDate={end}
          url={eventUrl}
          options={['google', 'apple', 'msTeams', 'outlook']}
        />
      </div>
    </aside>
  )
}
