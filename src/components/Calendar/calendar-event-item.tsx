import { MapPin, Route } from 'lucide-react'
import { EventItemProps } from './calendar-types'

const CalendarEventItem = ({ info }: EventItemProps) => {
  const { event } = info
  const [left, right] = info.timeText.split(' - ')

  const location = event.extendedProps.address

  return (
    <div className="overflow-hidden w-full">
      {info.view.type == 'dayGridMonth' ? (
        <div
          style={{ backgroundColor: info.backgroundColor }}
          className={`flex flex-col rounded-md w-full px-2 py-1 line-clamp-1 text-[0.5rem] sm:text-[0.6rem] md:text-xs`}
        >
          <p className="font-semibold text-gray-950 line-clamp-1 w-11/12">{event.title}</p>

          {left && <p className="text-gray-800">{left}</p>}
          {right && <p className="text-gray-800">{right}</p>}
        </div>
      ) : (
        <div className="p-1 flex flex-col justify-between h-full space-y-1 text-xs md:text-sm">
          <div className="flex flex-col space-y-0">
            <p className="font-semibold w-full text-gray-950 line-clamp-1">{event.title}</p>
            {left && right && (
              <p className="text-gray-800 line-clamp-1">{`${left} - ${right}`}</p>
            )}{' '}
            {info.view.type == 'timeGridDay' && (
              <p className="text-gray-500 line-clamp-1">{event.extendedProps.description}</p>
            )}
          </div>
          <div className="flex space-x-2 justify-between">
            {event.extendedProps.distance && (
              <span className="flex text-black">
                <Route className="h-4 w-4 mr-2" /> {event.extendedProps.distance}
              </span>
            )}

            {location.street && location.country && (
              <span className="flex text-black">
                {location.street} - {location.country} <MapPin className="h-4 w-4 ml-2" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarEventItem
