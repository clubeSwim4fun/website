import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { CalendarEvent } from 'calendar-link'
import * as calendarLink from 'calendar-link'
import Link from 'next/link'
import AppleIcon from '@/components/Icons/apple'
import GoogleIcon from '@/components/Icons/google-calendar'
import MsTeamsIcon from '@/components/Icons/ms-teams'
import OutlookIcon from '@/components/Icons/outlook'

export type CalendarOptionsType = 'google' | 'apple' | 'msTeams' | 'outlook'

/* eslint-disable @typescript-eslint/no-explicit-any */
const iconMap: Record<CalendarOptionsType, any> = {
  google: GoogleIcon,
  apple: AppleIcon,
  msTeams: MsTeamsIcon,
  outlook: OutlookIcon,
}

export const AddToCalendarItemButton: React.FC<{
  title: string
  description?: string
  location?: string
  startDate?: Date | string
  endDate?: Date | string
  url?: string
  option: CalendarOptionsType
}> = (props) => {
  const { title, description, location, startDate, endDate, url, option } = props

  const createCalendarLink = (option: CalendarOptionsType, event: any) => {
    try {
      const link = (calendarLink as unknown as Record<CalendarOptionsType, (event: any) => string>)[
        option
      ](event)

      return link
    } catch (e) {
      console.error(e)
      return `error while generating link for: ${option}`
    }
  }

  const event: CalendarEvent = {
    title,
    description,
    start: typeof startDate === 'string' ? new Date(startDate) : startDate,
    end: typeof endDate === 'string' ? new Date(endDate) : endDate,
    location,
    url,
  }

  const googleUrl = createCalendarLink(option, event)
  const IconToRender = iconMap[option]

  return (
    <DropdownMenuItem asChild>
      <Link
        href={googleUrl}
        target="_blank"
        className="flex p-2 rounded hover:bg-gray-100 focus:outline-none gap-2 group"
      >
        <IconToRender className="h-6 w-6 dark:group-hover:fill-black" />
        <span className="capitalize dark:group-hover:text-black">{option}</span>
      </Link>
    </DropdownMenuItem>
  )
}
