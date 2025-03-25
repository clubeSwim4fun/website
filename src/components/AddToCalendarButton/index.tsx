import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddToCalendarItemButton, CalendarOptionsType } from './Button'

export const AddToCalendarButton: React.FC<{
  title: string
  description?: string
  label?: string
  location?: string
  startDate?: Date | string
  endDate?: Date | string
  url?: string
  options?: CalendarOptionsType[]
}> = (props) => {
  const { label, options, endDate } = props

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="mt-2">
          {label || 'Add ao Calendário'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[calc(100vw-51%)] md:w-[calc(100vw-72%)] lg:w-[calc(30vw-30%)] lg:max-w-[328px]"
      >
        {options?.map((option, idx) => (
          <AddToCalendarItemButton key={idx} option={option} {...props} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
