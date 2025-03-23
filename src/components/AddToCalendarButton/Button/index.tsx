import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import Image from 'next/image'
import GoogleIcon from 'public/common-icons/googlecalendar.svg'
import AppleIcon from 'public/common-icons/apple.svg'
import MsTeamsIcon from 'public/common-icons/teams.svg'
import OutlookIcon from 'public/common-icons/outlook.svg'
import Microsoft365Icon from 'public/common-icons/microsoft365.svg'
import { CalendarEvent } from 'calendar-link'
import * as calendarLink from 'calendar-link'
import Link from 'next/link'

export type CalendarOptionsType = 'google' | 'apple' | 'msTeams' | 'outlook' | 'microsoft365'

const iconMap: Record<CalendarOptionsType, string> = {
  google: GoogleIcon,
  apple: AppleIcon,
  msTeams: MsTeamsIcon,
  outlook: OutlookIcon,
  microsoft365: Microsoft365Icon,
}

type IconOption = keyof typeof iconMap

interface IconProps {
  option: IconOption
}

const DynamicIcon = ({ option }: IconProps) => {
  const selectedIcon = iconMap[option]

  return <Image src={selectedIcon} alt="" className="mr-2" />
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

  return (
    <DropdownMenuItem asChild>
      <Link
        href={googleUrl}
        target="_blank"
        className="flex p-2 rounded hover:bg-gray-100 focus:outline-none"
      >
        <DynamicIcon option={option} />
        <span className="capitalize">{option}</span>
      </Link>
    </DropdownMenuItem>
  )
}
