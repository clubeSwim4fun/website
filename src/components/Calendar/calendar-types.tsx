import { Event } from '@/payload-types'
import {
  DayCellContentArg,
  DayHeaderContentArg,
  EventContentArg,
} from '@fullcalendar/core/index.js'

// setting earliest / latest available time in minutes since Midnight
export const earliestTime = 540
export const latestTime = 1320

export const months = [
  {
    value: '1',
    label: 'Janeiro',
  },
  {
    value: '2',
    label: 'Fevereiro',
  },
  {
    value: '3',
    label: 'Março',
  },
  {
    value: '4',
    label: 'Abril',
  },
  {
    value: '5',
    label: 'Maio',
  },
  {
    value: '6',
    label: 'Junho',
  },
  {
    value: '7',
    label: 'Julho',
  },
  {
    value: '8',
    label: 'Agosto',
  },
  {
    value: '9',
    label: 'Setembro',
  },
  {
    value: '10',
    label: 'Outubro',
  },
  {
    value: '11',
    label: 'Novembro',
  },
  {
    value: '12',
    label: 'Dezembro',
  },
]

export type CalendarEvent = Omit<Event, 'end' | 'start' | 'createdAt' | 'updatedAt'> & {
  end: Date
  start: Date
}

export type TimePickerType = 'minutes' | 'seconds' | 'hours' | '12hours'
export type Period = 'AM' | 'PM'

export type EventItemProps = {
  info: EventContentArg
}

export type DayHeaderProps = {
  info: DayHeaderContentArg
}

export type DayRenderProps = {
  info: DayCellContentArg
}
