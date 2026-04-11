'use client'

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
import { ArrowUp, ArrowDown, Loader, Search, X, Calendar, FileDown } from 'lucide-react'
import { FrontPagination } from '../FrontPagination'
import { fetchReceiptForPaymentIntent } from '@/actions/invoice'
import { useToast } from '@/hooks/use-toast'

const PAGE_SIZE = EVENTS_PAGE_SIZE

type Args = { userId: string }

export const UserFutureEvents: React.FC<Args> = ({ userId }) => {
  const t = useTranslations('User.Events')
  const format = useFormatter()
  const { toast } = useToast()

  const [userEvents, setUserEvents] = useState<UserEventsType[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filteredCount, setFilteredCount] = useState(0)
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const [dateFilter, setDateFilter] = useState<EventDateFilter>('future')
  const [sortOrder, setSortOrder] = useState<EventSortOrder>('asc')
  const [nameSearch, setNameSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

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

  const handleDownloadInvoice = async (paymentIntentId: string, rowId: string) => {
    setDownloadingId(rowId)
    const result = await fetchReceiptForPaymentIntent(paymentIntentId)
    setDownloadingId(null)
    if (result.error || !result.receipt) {
      toast({ variant: 'destructive', description: t('invoiceNotAvailable') })
      return
    }
    if (result.receipt.permalink)
      window.open(result.receipt.permalink, '_blank', 'noopener,noreferrer')
  }

  const showPagination =
    !isLoadingPage && totalPages > 1 && !(debouncedSearch && filteredCount < PAGE_SIZE)

  const filterOptions: { value: EventDateFilter; label: string }[] = [
    { value: 'all', label: t('filterAll') },
    { value: 'future', label: t('filterFuture') },
    { value: 'past', label: t('filterPast') },
  ]

  const emptyState = (
    <div className="flex flex-col items-center py-10 gap-3" style={{ color: '#8aaabb' }}>
      <Calendar className="w-8 h-8" style={{ stroke: '#d4eaf2' }} />
      <span className="text-[13px]">{t('noResults')}</span>
    </div>
  )

  const loadingState = (
    <div className="flex justify-center py-10">
      <Loader className="w-5 h-5 animate-spin" style={{ stroke: '#8aaabb' }} />
    </div>
  )

  return (
    <article>
      {/* Section title */}
      <div className="mb-3">
        <h2
          className="text-[15px] sm:text-[16px] font-bold tracking-wide"
          style={{ color: '#0a4a6e' }}
        >
          {t('title')}
        </h2>
      </div>

      {/* Search */}
      <div className="relative mb-2.5">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
          style={{ stroke: '#8aaabb' }}
        />
        <input
          value={nameSearch}
          onChange={(e) => {
            setNameSearch(e.target.value)
            setCurrentPage(1)
          }}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-8 pr-8 py-[10px] text-[13px] sm:text-[14px] rounded-[10px] outline-none transition-all"
          style={{ border: '1.5px solid #d4eaf2', background: '#fff', color: '#0f1f2e' }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#0e7ea8'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,126,168,.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#d4eaf2'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        {nameSearch && (
          <button
            onClick={handleSearchClear}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: '#8aaabb' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters + sort — horizontally scrollable on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-2.5 mb-1" style={{ scrollbarWidth: 'none' }}>
        {filterOptions.map(({ value, label }) => {
          const isActive = dateFilter === value
          return (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className="px-[14px] py-[7px] rounded-full text-[12px] font-semibold transition-all whitespace-nowrap shrink-0"
              style={{
                border: `1.5px solid ${isActive ? '#0e7ea8' : '#d4eaf2'}`,
                background: isActive ? '#e0f5fb' : '#fff',
                color: isActive ? '#0a4a6e' : '#3d5a70',
              }}
            >
              {label}
            </button>
          )
        })}
        <button
          onClick={handleSortToggle}
          className="flex items-center gap-1 px-[14px] py-[7px] rounded-full text-[12px] font-semibold transition-all whitespace-nowrap shrink-0"
          style={{ border: '1.5px solid #d4eaf2', background: '#fff', color: '#3d5a70' }}
        >
          {sortOrder === 'asc' ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )}
          {t('date')}
        </button>
      </div>

      {/* ── Desktop: table ── */}
      <div
        className="hidden sm:block rounded-[14px] overflow-hidden"
        style={{ border: '2px solid #d4eaf2', background: '#fff' }}
      >
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {[
                t('date'),
                t('event'),
                t('ticketName'),
                t('distance'),
                t('dorsal'),
                t('invoice'),
              ].map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[.6px] whitespace-nowrap"
                  style={{
                    color: '#8aaabb',
                    borderBottom: '1.5px solid #d4eaf2',
                    background: '#f0fafd',
                    cursor: i === 0 ? 'pointer' : 'default',
                  }}
                  onClick={i === 0 ? handleSortToggle : undefined}
                >
                  {col}
                  {i === 0 && (
                    <span className="ml-1 opacity-60 text-[10px]">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              <tr>
                <td colSpan={6}>{loadingState}</td>
              </tr>
            ) : userEvents.length === 0 ? (
              <tr>
                <td colSpan={6}>{emptyState}</td>
              </tr>
            ) : (
              userEvents.map((ev, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid #d4eaf2' }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = '#f0fafd')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')
                  }
                >
                  <td
                    className="px-4 py-[13px] font-medium tabular-nums"
                    style={{ color: '#0f1f2e' }}
                  >
                    {ev.eventDate
                      ? format.dateTime(ev.eventDate, { dateStyle: 'medium' })
                      : t('noDate')}
                  </td>
                  <td className="px-4 py-[13px]">
                    <Link
                      href={`/event/${ev.eventUrl}`}
                      className="font-medium hover:underline"
                      style={{ color: '#0e7ea8' }}
                    >
                      {ev.eventName}
                    </Link>
                  </td>
                  <td className="px-4 py-[13px]" style={{ color: '#3d5a70' }}>
                    {ev.ticket.name}
                  </td>
                  <td className="px-4 py-[13px]" style={{ color: '#3d5a70' }}>
                    {convertMtoKm(ev.ticket.distance)}
                  </td>
                  <td className="px-4 py-[13px]" style={{ color: '#3d5a70' }}>
                    {ev.eventPurchaseId ?? '—'}
                  </td>
                  <td className="px-4 py-[13px]">
                    {ev.stripePaymentIntentId && (
                      <button
                        onClick={() =>
                          handleDownloadInvoice(
                            ev.stripePaymentIntentId!,
                            ev.stripePaymentIntentId!,
                          )
                        }
                        disabled={downloadingId === ev.stripePaymentIntentId}
                        title={t('downloadInvoice')}
                        className="w-7 h-7 rounded-[7px] flex items-center justify-center transition-all disabled:opacity-50"
                        style={{ border: '1px solid #d4eaf2', background: 'transparent' }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.background = '#e0f5fb'
                          ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#3bb8d8'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                          ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#d4eaf2'
                        }}
                      >
                        {downloadingId === ev.stripePaymentIntentId ? (
                          <Loader className="w-3 h-3 animate-spin" style={{ stroke: '#3d5a70' }} />
                        ) : (
                          <FileDown className="w-3 h-3" style={{ stroke: '#3d5a70' }} />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: cards ── */}
      <div className="sm:hidden">
        {isPending
          ? loadingState
          : userEvents.length === 0
            ? emptyState
            : userEvents.map((ev, i) => {
                const isFuture = ev.eventDate ? ev.eventDate > new Date() : false
                return (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden mb-2.5"
                    style={{ border: '2px solid #d4eaf2', background: '#fff' }}
                  >
                    <div className="grid" style={{ gridTemplateColumns: '6px 1fr' }}>
                      {/* Colored left bar */}
                      <div
                        className="self-stretch"
                        style={{ background: isFuture ? '#0e7ea8' : '#8aaabb' }}
                      />
                      <div className="p-3.5">
                        <Link
                          href={`/event/${ev.eventUrl}`}
                          className="font-semibold text-[14px] block mb-1.5 hover:underline"
                          style={{ color: '#0f1f2e' }}
                        >
                          {ev.eventName}
                        </Link>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span
                            className="flex items-center gap-1 text-[12px]"
                            style={{ color: '#3d5a70' }}
                          >
                            <svg
                              className="w-3 h-3 shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#8aaabb"
                              strokeWidth="2"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {ev.eventDate
                              ? format.dateTime(ev.eventDate, { dateStyle: 'medium' })
                              : t('noDate')}
                          </span>
                          <span
                            className="flex items-center gap-1 text-[12px]"
                            style={{ color: '#3d5a70' }}
                          >
                            <svg
                              className="w-3 h-3 shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#8aaabb"
                              strokeWidth="2"
                            >
                              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                            {convertMtoKm(ev.ticket.distance)}
                          </span>
                        </div>
                        <span
                          className="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={
                            isFuture
                              ? { background: '#e8f8f0', color: '#1a9950' }
                              : { background: '#f0fafd', color: '#0e7ea8' }
                          }
                        >
                          {ev.ticket.name}
                        </span>
                        {ev.stripePaymentIntentId && (
                          <button
                            onClick={() =>
                              handleDownloadInvoice(
                                ev.stripePaymentIntentId!,
                                ev.stripePaymentIntentId!,
                              )
                            }
                            disabled={downloadingId === ev.stripePaymentIntentId}
                            title={t('downloadInvoice')}
                            className="mt-2 w-7 h-7 rounded-[7px] flex items-center justify-center transition-all disabled:opacity-50"
                            style={{ border: '1px solid #d4eaf2', background: 'transparent' }}
                          >
                            {downloadingId === ev.stripePaymentIntentId ? (
                              <Loader
                                className="w-3 h-3 animate-spin"
                                style={{ stroke: '#3d5a70' }}
                              />
                            ) : (
                              <FileDown className="w-3 h-3" style={{ stroke: '#3d5a70' }} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
      </div>

      {showPagination && (
        <FrontPagination
          page={currentPage}
          totalPages={totalPages}
          totalDocs={filteredCount || userEvents.length}
          perPage={PAGE_SIZE}
          onPageClick={setCurrentPage}
          className="mt-3"
        />
      )}
    </article>
  )
}
