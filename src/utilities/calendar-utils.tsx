'use client'
import FullCalendar from '@fullcalendar/react'
import { ChangeEvent, Dispatch, SetStateAction, RefObject } from 'react'
import { type Locale } from 'date-fns/locale'
import { format } from 'date-fns'
import { Period, TimePickerType } from '@/components/Calendar/calendar-types'

export type calendarRef = RefObject<FullCalendar | null>

export function generateDaysInMonth(daysInMonth: number) {
  const daysArray = []

  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push({
      value: String(day),
      label: String(day),
    })
  }

  return daysArray
}

export function goPrev(calendarRef: calendarRef) {
  const calendarApi = calendarRef.current!.getApi()
  calendarApi.prev()
}

export function goNext(calendarRef: calendarRef) {
  const calendarApi = calendarRef.current!.getApi()
  calendarApi.next()
}

export function goToday(calendarRef: calendarRef) {
  const calendarApi = calendarRef.current!.getApi()
  calendarApi.today()
}

export function handleDayChange(calendarRef: calendarRef, currentDate: Date, day: string) {
  const calendarApi = calendarRef.current!.getApi()
  const newDate = currentDate.setDate(Number(day))
  calendarApi.gotoDate(newDate)
}

export function handleMonthChange(calendarRef: calendarRef, currentDate: Date, month: string) {
  const calendarApi = calendarRef.current!.getApi()
  const newDate = new Date(currentDate)
  newDate.setMonth(Number(month) - 1)
  calendarApi.gotoDate(newDate)
}

export function handleYearChange(
  calendarRef: calendarRef,
  currentDate: Date,
  e: ChangeEvent<HTMLInputElement>,
) {
  const calendarApi = calendarRef.current!.getApi()
  const newDate = currentDate.setFullYear(Number(e.target.value))
  calendarApi.gotoDate(newDate)
}

export function setView(
  calendarRef: calendarRef,
  viewName: string,
  setCurrentView: Dispatch<SetStateAction<string>>,
) {
  const calendarApi = calendarRef.current!.getApi()
  setCurrentView(viewName)
  calendarApi.changeView(viewName)
}

export function getDateFromMinutes(minutes: number) {
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Set time to midnight
  now.setMinutes(minutes)
  return now
}

// ---------- utils start ----------
/**
 * regular expression to check for valid hour format (01-23)
 */
function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value)
}

/**
 * regular expression to check for valid 12 hour format (01-12)
 */
function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value)
}

/**
 * regular expression to check for valid minute format (00-59)
 */
function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value)
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean }

function getValidNumber(value: string, { max, min = 0, loop = false }: GetValidNumberConfig) {
  let numericValue = parseInt(value, 10)

  if (!Number.isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max
      if (numericValue < min) numericValue = min
    } else {
      if (numericValue > max) numericValue = min
      if (numericValue < min) numericValue = max
    }
    return numericValue.toString().padStart(2, '0')
  }

  return '00'
}

function getValidHour(value: string) {
  if (isValidHour(value)) return value
  return getValidNumber(value, { max: 23 })
}

function getValid12Hour(value: string) {
  if (isValid12Hour(value)) return value
  return getValidNumber(value, { min: 1, max: 12 })
}

function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value
  return getValidNumber(value, { max: 59 })
}

type GetValidArrowNumberConfig = {
  min: number
  max: number
  step: number
}

function getValidArrowNumber(value: string, { min, max, step }: GetValidArrowNumberConfig) {
  let numericValue = parseInt(value, 10)
  if (!Number.isNaN(numericValue)) {
    numericValue += step
    return getValidNumber(String(numericValue), { min, max, loop: true })
  }
  return '00'
}

function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 23, step })
}

function getValidArrow12Hour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 1, max: 12, step })
}

function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 59, step })
}

function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value)
  date.setMinutes(parseInt(minutes, 10))
  return date
}

function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value)
  date.setSeconds(parseInt(seconds, 10))
  return date
}

function setHours(date: Date, value: string) {
  const hours = getValidHour(value)
  date.setHours(parseInt(hours, 10))
  return date
}

function set12Hours(date: Date, value: string, period: Period) {
  const hours = parseInt(getValid12Hour(value), 10)
  const convertedHours = convert12HourTo24Hour(hours, period)
  date.setHours(convertedHours)
  return date
}

export function setDateByType(date: Date, value: string, type: TimePickerType, period?: Period) {
  switch (type) {
    case 'minutes':
      return setMinutes(date, value)
    case 'seconds':
      return setSeconds(date, value)
    case 'hours':
      return setHours(date, value)
    case '12hours': {
      if (!period) return date
      return set12Hours(date, value, period)
    }
    default:
      return date
  }
}

export function getDateByType(date: Date | null, type: TimePickerType) {
  if (!date) return '00'
  switch (type) {
    case 'minutes':
      return getValidMinuteOrSecond(String(date.getMinutes()))
    case 'seconds':
      return getValidMinuteOrSecond(String(date.getSeconds()))
    case 'hours':
      return getValidHour(String(date.getHours()))
    case '12hours':
      return getValid12Hour(String(display12HourValue(date.getHours())))
    default:
      return '00'
  }
}

export function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case 'minutes':
      return getValidArrowMinuteOrSecond(value, step)
    case 'seconds':
      return getValidArrowMinuteOrSecond(value, step)
    case 'hours':
      return getValidArrowHour(value, step)
    case '12hours':
      return getValidArrow12Hour(value, step)
    default:
      return '00'
  }
}

/**
 * handles value change of 12-hour input
 * 12:00 PM is 12:00
 * 12:00 AM is 00:00
 */
function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === 'PM') {
    if (hour <= 11) {
      return hour + 12
    }
    return hour
  }

  if (period === 'AM') {
    if (hour === 12) return 0
    return hour
  }
  return hour
}

/**
 * time is stored in the 24-hour form,
 * but needs to be displayed to the user
 * in its 12-hour representation
 */
export function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return '12'
  if (hours >= 22) return `${hours - 12}`
  if (hours % 12 > 9) return `${hours}`
  return `0${hours % 12}`
}

function genMonths(locale: Pick<Locale, 'options' | 'localize' | 'formatLong'>) {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2021, i), 'MMMM', { locale }),
  }))
}

function genYears(yearRange = 50) {
  const today = new Date()
  return Array.from({ length: yearRange * 2 + 1 }, (_, i) => ({
    value: today.getFullYear() - yearRange + i,
    label: (today.getFullYear() - yearRange + i).toString(),
  }))
}

// ---------- utils end ----------
