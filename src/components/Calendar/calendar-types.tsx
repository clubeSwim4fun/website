import { Event } from '@/payload-types'

// setting earliest / latest available time in minutes since Midnight
export const earliestTime = 540
export const latestTime = 1320

export const months = [
  {
    value: '1',
    label: 'January',
  },
  {
    value: '2',
    label: 'February',
  },
  {
    value: '3',
    label: 'March',
  },
  {
    value: '4',
    label: 'April',
  },
  {
    value: '5',
    label: 'May',
  },
  {
    value: '6',
    label: 'June',
  },
  {
    value: '7',
    label: 'July',
  },
  {
    value: '8',
    label: 'August',
  },
  {
    value: '9',
    label: 'September',
  },
  {
    value: '10',
    label: 'October',
  },
  {
    value: '11',
    label: 'November',
  },
  {
    value: '12',
    label: 'December',
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
