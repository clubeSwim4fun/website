import { Event } from '@/payload-types'

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

export type CalendarEvent = Omit<
  Event,
  'backgroundColor' | 'end' | 'start' | 'createdAt' | 'updatedAt'
> & {
  backgroundColor: string
  end: Date
  start: Date
}

export type TimePickerType = 'minutes' | 'seconds' | 'hours' | '12hours'
export type Period = 'AM' | 'PM'
