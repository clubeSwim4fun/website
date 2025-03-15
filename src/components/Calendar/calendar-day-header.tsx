import { DayHeaderProps } from './calendar-types'

const CalendarDayHeader = ({ info }: DayHeaderProps) => {
  const [weekday] = info.text.split(' ')

  return (
    <div className="flex items-center h-full overflow-hidden">
      {info.view.type == 'timeGridDay' ? (
        <div className="flex flex-col rounded-sm">
          <p>
            {info.date.toLocaleDateString('pt-PT', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      ) : info.view.type == 'timeGridWeek' ? (
        <div className="flex flex-col space-y-0.5 rounded-sm items-center w-full text-xs sm:text-sm md:text-md">
          <p className="flex font-semibold">{weekday}</p>
          {info.isToday ? (
            <div className="flex bg-black dark:bg-white h-6 w-6 rounded-full items-center justify-center text-xs sm:text-sm md:text-md">
              <p className="font-light dark:text-black text-white">{info.date.getDate()}</p>
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full items-center justify-center">
              <p className="font-light">{info.date.getDate()}</p>
            </div>
          )}
        </div>
      ) : info.view.type === 'listMonth' ? (
        <div className="flex flex-row justify-between w-full rounded-sm">
          <p>{info.text}</p>
          <p>{info.sideText}</p>
        </div>
      ) : (
        <div className="flex flex-col rounded-sm">
          <p>{weekday}</p>
        </div>
      )}
    </div>
  )
}

export default CalendarDayHeader
