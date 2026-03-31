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
import { Link } from '@/i18n/routing'
import { useEffect, useState, useTransition, useCallback } from 'react'
import {
  getUserFutureEvents,
  UserEvents as UserEventsType,
  EventDateFilter,
  EventSortOrder,
} from '@/helpers/userHelper'
import { EVENTS_PAGE_SIZE } from '@/helpers/userHelperConstants'
import { useFormatter, useTranslations } from 'next-intl'
import { ArrowUp, ArrowDown, Loader, Search, X } from 'lucide-react'
import { FrontPagination } from '../FrontPagination'
import { cn } from '@/utilities/ui'

// Must match the limit set in getUserFutureEvents
// PAGE_SIZE is defined in userHelper and shared with the BE query
const PAGE_SIZE = EVENTS_PAGE_SIZE

type Args = { userId: string }

export const UserFutureEvents: React.FC<Args> = ({ userId }) => {
  const t = useTranslations('User.Events')
  const format = useFormatter()

  const [userEvents, setUserEvents] = useState<UserEventsType[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filteredCount, setFilteredCount] = useState(0)
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [isPending, startTransition] = useTransition()

  const [dateFilter, setDateFilter] = useState<EventDateFilter>('future')
  const [sortOrder, setSortOrder] = useState<EventSortOrder>('asc')
  const [nameSearch, setNameSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Only fire search after 3 characters (or when cleared)
  useEffect(() => {
    if (nameSearch.length === 0 || nameSearch.length >= 3) {
      const timer = setTimeout(() => setDebouncedSearch(nameSearch), 300)
      return () => clearTimeout(timer)
    }
  }, [nameSearch])

  const fetchEvents = useCallback(() => {
    startTransition(async () => {
      const { events, totalPages, filteredCount } = await getUserFutureEvents({
        userId,
        page: currentPage,
        dateFilter,
        nameSearch: debouncedSearch,
        sortOrder,
      })
      setTotalPages(totalPages)
      setFilteredCount(filteredCount)
      setUserEvents(events)
      setIsLoadingPage(false)
    })
  }, [userId, currentPage, dateFilter, debouncedSearch, sortOrder])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleFilterChange = (filter: EventDateFilter) => {
    setDateFilter(filter)
    setCurrentPage(1)
  }

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    setCurrentPage(1)
  }

  const handleSearchClear = () => {
    setNameSearch('')
    setCurrentPage(1)
  }

  // When a name search is active, the name filter runs client-side after Payload paginates,
  // so totalPages from Payload is based on unfiltered data and can't be trusted.
  // We hide pagination if the filtered results on this page are fewer than a full page —
  // that means the filter narrowed things down and there's nothing meaningful on the next pages.
  const showPagination =
    !isLoadingPage && totalPages > 1 && !(debouncedSearch && filteredCount < PAGE_SIZE)

  const filterOptions: { value: EventDateFilter; label: string }[] = [
    { value: 'future', label: t('filterFuture') },
    { value: 'past', label: t('filterPast') },
    { value: 'all', label: t('filterAll') },
  ]

  return (
    <article>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">{t('title')}</h2>

        {/* Filter pills */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-900 rounded-lg p-1">
          {filterOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-all',
                dateFilter === value
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 border rounded-md px-3 h-9 mb-3 bg-background focus-within:ring-1 focus-within:ring-ring">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          value={nameSearch}
          onChange={(e) => {
            setNameSearch(e.target.value)
            setCurrentPage(1)
          }}
          placeholder={t('searchPlaceholder')}
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {nameSearch && (
          <button
            onClick={handleSearchClear}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <Table className="w-full">
        <TableHeader className="bg-gray-100 dark:bg-slate-900">
          <TableRow className="border-b dark:border-slate-700">
            <TableHead className="text-left">
              <button
                onClick={handleSortToggle}
                className="flex items-center gap-1 font-medium hover:text-foreground transition-colors group"
                aria-label="Sort by date"
              >
                {t('date')}
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
            </TableHead>
            <TableHead className="text-left">{t('event')}</TableHead>
            <TableHead className="text-left">{t('ticketName')}</TableHead>
            <TableHead className="text-left">{t('distance')}</TableHead>
            <TableHead className="text-left">{t('dorsal')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <Loader className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              </TableCell>
            </TableRow>
          ) : userEvents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                {t('noResults')}
              </TableCell>
            </TableRow>
          ) : (
            userEvents.map((userEvent, index) => (
              <TableRow key={index} className="border-b dark:border-slate-700">
                <TableCell className="text-left tabular-nums">
                  {userEvent.eventDate ? format.dateTime(userEvent.eventDate) : t('noDate')}
                </TableCell>
                <TableCell className="text-left">
                  <Link
                    href={`/event/${userEvent.eventUrl}`}
                    className="underline hover:no-underline transition-all"
                  >
                    {userEvent.eventName}
                  </Link>
                </TableCell>
                <TableCell className="text-left">{userEvent.ticket.name}</TableCell>
                <TableCell className="text-left">
                  {convertMtoKm(userEvent.ticket.distance)}
                </TableCell>
                <TableCell className="text-left">{userEvent.eventPurchaseId}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showPagination && (
        <FrontPagination
          page={currentPage}
          totalPages={totalPages}
          onPreviousClick={setCurrentPage}
          onPageClick={setCurrentPage}
          onNextClick={setCurrentPage}
        />
      )}
    </article>
  )
}
