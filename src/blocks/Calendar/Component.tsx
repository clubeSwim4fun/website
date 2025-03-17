import React from 'react'

import type { Calendar as CalendarBlockProps } from '@/payload-types'

import { EventsProvider } from '@/components/Calendar/events-context'

import { getPayload } from 'payload'
import config from '@payload-config'
import { CalendarEvent } from '@/components/Calendar/calendar-types'
import { Calendar } from '@/components/Calendar/calendar'

export const CalendarBlock: React.FC<CalendarBlockProps> = async (props) => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 12,
    select: {
      slug: true,
      title: true,
      description: true,
      start: true,
      end: true,
      distance: true,
      category: true,
      address: {
        street: true,
        country: true,
      },
    },
  })

  const { defaultView } = props

  return (
    <div className="max-w-6xl mx-auto">
      <EventsProvider data={result.docs as unknown as CalendarEvent[]}>
        <Calendar defaultView={defaultView || 'dayGridMonth'} />
      </EventsProvider>
    </div>
  )
}
