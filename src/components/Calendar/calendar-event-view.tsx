import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EventDeleteForm } from './calendar-event-delete-form'
import { EventEditForm } from './calendar-event-edit-form'
import { X } from 'lucide-react'
import { CalendarEvent } from './calendar-types'
import { useEvents } from './events-context'
import RichText from '../RichText'

interface EventViewProps {
  event?: CalendarEvent
}

export function EventView({ event }: EventViewProps) {
  const { eventViewOpen, setEventViewOpen } = useEvents()

  return (
    <>
      <AlertDialog open={eventViewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex flex-row justify-between items-center">
              <h1>{event?.title}</h1>
              <AlertDialogCancel onClick={() => setEventViewOpen(false)}>
                <X className="h-5 w-5" />
              </AlertDialogCancel>
            </AlertDialogTitle>
            <table>
              <tr>
                <th>Time:</th>
                <td>{`${event?.start.toLocaleTimeString()} - ${event?.end.toLocaleTimeString()}`}</td>
              </tr>
              {event?.description && (
                <tr>
                  <th>Description:</th>
                  <RichText
                    className="max-w-[48rem] mx-auto"
                    data={event.description}
                    enableGutter={false}
                  />
                </tr>
              )}
              <tr>
                <th>Color:</th>
                <td>
                  <div
                    className="rounded-full w-5 h-5"
                    style={{
                      backgroundColor:
                        (typeof event?.category === 'object' && event.category.color) || '',
                    }}
                  ></div>
                </td>
              </tr>
            </table>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <EventDeleteForm id={event?.id} title={event?.title} />
            <EventEditForm oldEvent={event} event={event} isDrag={false} displayButton={true} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
