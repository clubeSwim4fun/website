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
    en: {
      label: 'January',
    },
    pt: {
      label: 'Janeiro',
    },
  },
  {
    value: '2',
    en: {
      label: 'February',
    },
    pt: {
      label: 'Fevereiro',
    },
  },
  {
    value: '3',
    en: {
      label: 'March',
    },
    pt: {
      label: 'Março',
    },
  },
  {
    value: '4',
    en: {
      label: 'April',
    },
    pt: {
      label: 'Abril',
    },
  },
  {
    value: '5',
    en: {
      label: 'May',
    },
    pt: {
      label: 'Maio',
    },
  },
  {
    value: '6',
    en: {
      label: 'June',
    },
    pt: {
      label: 'Junho',
    },
  },
  {
    value: '7',
    en: {
      label: 'July',
    },
    pt: {
      label: 'Julho',
    },
  },
  {
    value: '8',
    en: {
      label: 'August',
    },
    pt: {
      label: 'Agosto',
    },
  },
  {
    value: '9',
    en: {
      label: 'September',
    },
    pt: {
      label: 'Setembro',
    },
  },
  {
    value: '10',
    en: {
      label: 'October',
    },
    pt: {
      label: 'Outubro',
    },
  },
  {
    value: '11',
    en: {
      label: 'November',
    },
    pt: {
      label: 'Novembro',
    },
  },
  {
    value: '12',
    en: {
      label: 'December',
    },
    pt: {
      label: 'Dezembro',
    },
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
