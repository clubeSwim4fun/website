'use client'
import { CalendarEvent } from './calendar-types'
import React, { createContext, ReactNode, useContext, useState } from 'react'

interface EventsContextType {
  events: CalendarEvent[]
  addEvent: (event: CalendarEvent) => void
  deleteEvent: (id: string) => void
  eventViewOpen: boolean
  setEventViewOpen: (value: boolean) => void
  eventAddOpen: boolean
  setEventAddOpen: (value: boolean) => void
  eventEditOpen: boolean
  setEventEditOpen: (value: boolean) => void
  eventDeleteOpen: boolean
  setEventDeleteOpen: (value: boolean) => void
  availabilityCheckerEventAddOpen: boolean
  setAvailabilityCheckerEventAddOpen: (value: boolean) => void
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

export const useEvents = () => {
  const context = useContext(EventsContext)
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider')
  }
  return context
}

export const EventsProvider: React.FC<{ children: ReactNode; data: CalendarEvent[] }> = ({
  children,
  data,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>(
    data.map((event) => {
      return {
        ...event,
        id: String(event.id),
        color: typeof event.category === 'object' && event.category?.color,
      }
    }),
  )
  const [eventViewOpen, setEventViewOpen] = useState(false)
  const [eventAddOpen, setEventAddOpen] = useState(false)
  const [eventEditOpen, setEventEditOpen] = useState(false)
  const [eventDeleteOpen, setEventDeleteOpen] = useState(false)
  const [availabilityCheckerEventAddOpen, setAvailabilityCheckerEventAddOpen] = useState(false)

  const addEvent = (event: CalendarEvent) => {
    setEvents((prevEvents) => [...prevEvents, event])
  }

  const deleteEvent = (id: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => Number(event.id) !== Number(id)))
  }

  return (
    <EventsContext.Provider
      value={{
        events,
        addEvent,
        deleteEvent,
        eventViewOpen,
        setEventViewOpen,
        eventAddOpen,
        setEventAddOpen,
        eventEditOpen,
        setEventEditOpen,
        eventDeleteOpen,
        setEventDeleteOpen,
        availabilityCheckerEventAddOpen,
        setAvailabilityCheckerEventAddOpen,
      }}
    >
      {children}
    </EventsContext.Provider>
  )
}
