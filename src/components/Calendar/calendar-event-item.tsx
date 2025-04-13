import { MapPin, Route } from 'lucide-react'
import { EventItemProps } from './calendar-types'
import Link from 'next/link'
import { convertMtoKm } from '@/utilities/util'

const CalendarEventItem = ({ info }: EventItemProps) => {
  const { event } = info
  const [left, right] = info.timeText.split(' - ')

  const location = event.extendedProps.address

  console.log('event.extendedProps.distances', event.extendedProps)

  return (
    <Link className="w-full" href={`/event/${event.extendedProps.slug}`}>
      <div className="overflow-hidden h-full w-full">
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
          <div
            className={`p-1 flex justify-between h-full space-y-1 text-xs md:text-sm ${info.view.type === 'timeGridDay' ? 'flex-row' : 'flex-col'}`}
          >
            <div className="flex flex-col space-y-0">
              <p className="font-semibold w-full text-gray-950 line-clamp-1">{event.title}</p>
              {left && right && (
                <p className="text-gray-800 line-clamp-1">{`${left} - ${right}`}</p>
              )}{' '}
            </div>
            <div className={`flex mt-0 justify-start flex-col`}>
              {event.extendedProps &&
                event.extendedProps.distances &&
                event.extendedProps.distances.map((d: { id: string; distance: number }) => (
                  <span
                    key={d.id}
                    className={`flex text-black ${info.view.type === 'timeGridDay' && 'flex-row-reverse'}`}
                  >
                    <Route
                      className={`h-4 w-4 ${info.view.type === 'timeGridDay' ? 'ml-2' : 'mr-2'}`}
                    />{' '}
                    {convertMtoKm(d.distance)}
                  </span>
                ))}
              {location.street && location.country && (
                <span className="flex text-black">
                  {location.street} - {location.country} <MapPin className="h-4 w-4 ml-2" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

export default CalendarEventItem
