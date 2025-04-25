'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { convertMtoKm } from '@/utilities/util'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { getUserFutureEvents, UserEvents as UserEventsType } from '@/helpers/userHelper'
import { useFormatter, useTranslations } from 'next-intl'
import { Loader } from 'lucide-react'
import { FrontPagination } from '../FrontPagination'

type Args = {
  userId: string
}

export const UserFutureEvents: React.FC<Args> = (props) => {
  const { userId } = props
  const t = useTranslations()
  const format = useFormatter()

  const [userEvents, setUserEvents] = useState<UserEventsType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const { events, totalPages } = await getUserFutureEvents({ userId, page: currentPage })
      setTotalPages(totalPages)
      setUserEvents(events)
      setIsLoadingPage(false)
    })
  }, [currentPage])

  const onPageClickHandler = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const onNextClickHandler = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const onPreviouslickHandler = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <article>
      <h2 className="text-2xl font-semibold leading-none tracking-tight">
        {t('User.Events.title')}
      </h2>
      <Table className="w-full mt-4">
        <TableHeader className="bg-gray-100 dark:bg-slate-900">
          <TableRow className="border-b dark:border-slate-700">
            <TableHead className="text-left max-w-[50%]">{t('User.Events.date')}</TableHead>
            <TableHead className="text-left max-w-[50%]">{t('User.Events.event')}</TableHead>
            <TableHead className="text-left max-w-[50%]">{t('User.Events.ticketName')}</TableHead>
            <TableHead className="text-left max-w-[50%]">{t('User.Events.distance')}</TableHead>
            <TableHead className="text-left max-w-[50%]">{t('User.Events.dorsal')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                <Loader className="w-8 h-8 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : (
            userEvents.map((userEvent, index) => (
              <TableRow key={index} className="border-b dark:border-slate-700">
                <TableCell className="text-left max-w-[50%]">
                  {userEvent.eventDate ? format.dateTime(userEvent.eventDate) : t('noDate')}
                </TableCell>
                <TableCell className="text-left max-w-[50%]">
                  <Link href={`/event/${userEvent.eventUrl}`} className="underline">
                    {userEvent.eventName}
                  </Link>
                </TableCell>
                <TableCell className="text-left max-w-[50%]">{userEvent.ticket.name}</TableCell>
                <TableCell className="text-left max-w-[50%]">
                  {convertMtoKm(userEvent.ticket.distance)}
                </TableCell>
                <TableCell className="text-left max-w-[50%]">{userEvent.eventPurchaseId}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isLoadingPage && (
        <FrontPagination
          page={currentPage}
          totalPages={totalPages}
          onPreviousClick={onPreviouslickHandler}
          onPageClick={onPageClickHandler}
          onNextClick={onNextClickHandler}
        />
      )}
    </article>
  )
}
