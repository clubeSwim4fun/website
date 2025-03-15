import { DayRenderProps } from './calendar-types'

const CalendarDayRender = ({ info }: DayRenderProps) => {
  return (
    <div className="flex">
      {info.view.type == 'dayGridMonth' && info.isToday ? (
        <div className="flex h-7 w-7 rounded-full bg-black dark:bg-white items-center justify-center text-sm text-white dark:text-black">
          {info.dayNumberText}
        </div>
      ) : (
        <div className="flex h-7 w-7 rounded-full items-center justify-center text-sm">
          {info.dayNumberText}
        </div>
      )}
    </div>
  )
}

export default CalendarDayRender
