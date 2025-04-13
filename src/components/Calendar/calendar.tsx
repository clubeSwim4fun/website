'use client'

import { useEvents } from './events-context'
import './styles/index.scss'
import { DateSelectArg, EventChangeArg, EventClickArg } from '@fullcalendar/core/index.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import multiMonthPlugin from '@fullcalendar/multimonth'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'

import { useRef, useState } from 'react'

import { Card } from '@/components/ui/card'
import { EventEditForm } from './calendar-event-edit-form'
import { EventView } from './calendar-event-view'
import CalendarNav from './calendar-nav'
import { CalendarEvent, earliestTime, latestTime } from './calendar-types'
import { getDateFromMinutes } from '@/utilities/calendar-utils'
import { cn } from '@/utilities/ui'
import CalendarEventItem from './calendar-event-item'
import CalendarDayHeader from './calendar-day-header'
import CalendarDayRender from './calendar-day-render'
import { useRouter } from 'next/navigation'

export const Calendar: React.FC<{ defaultView: string }> = ({ defaultView = 'dayGridMonth' }) => {
  const { events, setEventAddOpen, setEventEditOpen } = useEvents()

  const calendarRef = useRef<FullCalendar | null>(null)
  const [currentView, setCurrentView] = useState(defaultView)
  const [viewedDate, setViewedDate] = useState(new Date())
  const [selectedStart, setSelectedStart] = useState(new Date())
  const [selectedEnd, setSelectedEnd] = useState(new Date())
  const [selectedOldEvent, setSelectedOldEvent] = useState<CalendarEvent | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>()
  const [isDrag, setIsDrag] = useState(false)
  const router = useRouter()

  const handleEventClick = (info: EventClickArg) => {
    router.push(`/event/${info.event.extendedProps.slug}`)
  }

  const handleEventChange = (info: EventChangeArg) => {
    const event: CalendarEvent = {
      id: info.event.id,
      title: info.event.title,
      description: info.event.extendedProps.description,
      start: info.event.start!,
      end: info.event.end!,
      distances: info.event.extendedProps.distances,
      category: info.event.extendedProps.category,
    }

    const oldEvent: CalendarEvent = {
      id: info.event.id,
      title: info.event.title,
      description: info.event.extendedProps.description,
      start: info.event.start!,
      end: info.event.end!,
      distances: info.event.extendedProps.distances,
      category: info.event.extendedProps.category,
    }

    setIsDrag(true)
    setSelectedOldEvent(oldEvent)
    setSelectedEvent(event)
    setEventEditOpen(true)
  }

  const handleDateSelect = (info: DateSelectArg) => {
    setSelectedStart(info.start)
    setSelectedEnd(info.end)
  }

  const earliestHour = getDateFromMinutes(earliestTime).getHours().toString().padStart(2, '0')
  const earliestMin = getDateFromMinutes(earliestTime).getMinutes().toString().padStart(2, '0')
  const latestHour = getDateFromMinutes(latestTime).getHours().toString().padStart(2, '0')
  const latestMin = getDateFromMinutes(latestTime).getMinutes().toString().padStart(2, '0')

  const calendarEarliestTime = `${earliestHour}:${earliestMin}`
  const calendarLatestTime = `${latestHour}:${latestMin}`

  return (
    <div className="space-y-5">
      <CalendarNav
        calendarRef={calendarRef}
        start={selectedStart}
        defaultTab={defaultView}
        end={selectedEnd}
        viewedDate={viewedDate}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <Card
        className={cn(
          'p-3',
          (currentView === 'timeGridDay' || currentView === 'timeGridWeek') && 'min-h-[79vh]',
          currentView === 'dayGridMonth' && 'min-h-[65vh]',
        )}
      >
        <FullCalendar
          initialView={defaultView}
          locale={'pt'}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, multiMonthPlugin, interactionPlugin, listPlugin]}
          headerToolbar={false}
          slotMinTime={calendarEarliestTime}
          slotMaxTime={calendarLatestTime}
          allDaySlot={false}
          firstDay={1}
          height={'32vh'}
          displayEventEnd={true}
          windowResizeDelay={0}
          events={events}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }}
          eventBorderColor={'black'}
          contentHeight={'auto'}
          expandRows={true}
          dayCellContent={(dayInfo) => <CalendarDayRender info={dayInfo} />}
          eventContent={(eventInfo) => <CalendarEventItem info={eventInfo} />}
          dayHeaderContent={(headerInfo) => <CalendarDayHeader info={headerInfo} />}
          eventClick={(eventInfo) => handleEventClick(eventInfo)}
          eventChange={(eventInfo) => handleEventChange(eventInfo)}
          select={handleDateSelect}
          datesSet={(dates) => setViewedDate(dates.view.currentStart)}
          dateClick={() => setEventAddOpen(true)}
          nowIndicator
          editable
          selectable
        />
      </Card>
      <EventEditForm
        oldEvent={selectedOldEvent}
        event={selectedEvent}
        isDrag={isDrag}
        displayButton={false}
      />
      <EventView event={selectedEvent} />
    </div>
  )
}
