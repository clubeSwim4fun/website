'use client'

import { useEffect, useState, useTransition, useCallback } from 'react'
import { getUserSubscriptions } from '@/helpers/subscriptionHelper'
import type {
  SubscriptionRow,
  SubscriptionTypeFilter,
  SubscriptionSortOrder,
} from '@/helpers/subscriptionHelperTypes'
import { SUBS_PAGE_SIZE } from '@/helpers/subscriptionHelperTypes'
import { getMonthIndex } from '@/collections/Pool/PoolCycles'
import { useFormatter, useTranslations } from 'next-intl'
import { Loader, FileDown, Receipt } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { fetchReceiptForPaymentIntent } from '@/actions/invoice'
import { useToast } from '@/hooks/use-toast'
import { FrontPagination } from '../FrontPagination'

type Args = { userId: string }

const StatusBadge: React.FC<{
  label: string
  variant: 'green' | 'amber' | 'coral' | 'blue' | 'gray' | 'purple'
}> = ({ label, variant }) => {
  const styles: Record<string, { background: string; color: string }> = {
    green: { background: '#e8f8f0', color: '#1a9950' },
    amber: { background: '#fef6e4', color: '#b07010' },
    coral: { background: '#fdf0ee', color: '#e85d4a' },
    blue: { background: '#e0f5fb', color: '#0a4a6e' },
    gray: { background: '#f1f5f9', color: '#64748b' },
    purple: { background: '#f3f0ff', color: '#7c3aed' },
  }
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-[9px] py-[3px] rounded-full uppercase tracking-[.5px] whitespace-nowrap"
      style={styles[variant]}
    >
      {label}
    </span>
  )
}

const TypeBadge: React.FC<{ label: string; isPool: boolean }> = ({ label, isPool }) => (
  <span
    className="inline-flex items-center text-[10px] font-bold px-[9px] py-[3px] rounded-full uppercase tracking-[.5px] whitespace-nowrap"
    style={
      isPool
        ? { background: '#f0fafd', color: '#0e7ea8' }
        : { background: '#f1f5f9', color: '#64748b' }
    }
  >
    {label}
  </span>
)

// Left bar color per status
const barColor = (row: SubscriptionRow) => {
  if (row.kind === 'memberFee') {
    if (row.paymentStatus === 'paid') return '#2ecc71'
    if (row.paymentStatus === 'failed') return '#e85d4a'
    return '#f0a020'
  }
  if (row.status === 'active') return '#0e7ea8'
  if (row.status === 'waitlisted') return '#a78bfa'
  return '#8aaabb'
}

export const UserSubscriptions: React.FC<Args> = ({ userId }) => {
  const t = useTranslations('User.Subscriptions')
  const format = useFormatter()
  const { toast } = useToast()

  const [rows, setRows] = useState<SubscriptionRow[]>([])
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const [typeFilter, setTypeFilter] = useState<SubscriptionTypeFilter>('all')
  const [sortOrder, setSortOrder] = useState<SubscriptionSortOrder>('desc')

  const fetchData = useCallback(() => {
    startTransition(async () => {
      const result = await getUserSubscriptions({
        userId,
        typeFilter,
        sortOrder,
        page: currentPage,
      })
      setRows(result.rows)
      setTotalDocs(result.totalDocs)
      setTotalPages(result.totalPages)
      setIsLoading(false)
    })
  }, [userId, typeFilter, sortOrder, currentPage])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFilterChange = (f: SubscriptionTypeFilter) => {
    setTypeFilter(f)
    setCurrentPage(1)
  }
  const handleSortToggle = () => {
    setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'))
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
    const url = result.receipt.permalink
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const filterOptions: { value: SubscriptionTypeFilter; label: string }[] = [
    { value: 'all', label: t('filterAll') },
    { value: 'memberFee', label: t('filterMemberFee') },
    { value: 'pool', label: t('filterPool') },
  ]

  const formatPeriod = (row: SubscriptionRow) => {
    if (row.kind === 'memberFee') {
      return `${format.dateTime(new Date(row.startDate), { dateStyle: 'short' })} – ${format.dateTime(new Date(row.endDate), { dateStyle: 'short' })}`
    }
    return format.dateTime(new Date(row.year, getMonthIndex(row.month) - 1, 1), {
      month: 'long',
      year: 'numeric',
    })
  }

  const getStatusBadge = (row: SubscriptionRow) => {
    if (row.kind === 'memberFee') {
      if (row.paymentStatus === 'paid')
        return <StatusBadge label={t('statusPaid')} variant="green" />
      if (row.paymentStatus === 'failed')
        return <StatusBadge label={t('statusFailed')} variant="coral" />
      return <StatusBadge label={t('statusPending')} variant="amber" />
    }
    if (row.status === 'active') return <StatusBadge label={t('statusSubscribed')} variant="blue" />
    if (row.status === 'waitlisted')
      return <StatusBadge label={t('statusWaitlisted')} variant="purple" />
    return <StatusBadge label={t('statusCancelled')} variant="gray" />
  }

  const getStatusCell = (row: SubscriptionRow) => {
    const badge = getStatusBadge(row)
    if (row.kind === 'memberFee' && row.linkToSubscription)
      return <Link href="/subscription">{badge}</Link>
    if (row.kind === 'pool' && row.linkToMyPool)
      return <Link href="/pool/my-subscription">{badge}</Link>
    return badge
  }

  const InvoiceBtn = ({ row }: { row: SubscriptionRow }) => {
    if (row.paymentStatus !== 'paid' || !row.stripePaymentIntentId) return null
    return (
      <button
        onClick={() => handleDownloadInvoice(row.stripePaymentIntentId!, row.id)}
        disabled={downloadingId === row.id}
        title={t('downloadInvoice')}
        className="w-7 h-7 rounded-[7px] flex items-center justify-center transition-all disabled:opacity-50 shrink-0"
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
        {downloadingId === row.id ? (
          <Loader className="w-3 h-3 animate-spin" style={{ stroke: '#3d5a70' }} />
        ) : (
          <FileDown className="w-3 h-3" style={{ stroke: '#3d5a70' }} />
        )}
      </button>
    )
  }

  const emptyState = (
    <div className="flex flex-col items-center py-10 gap-3" style={{ color: '#8aaabb' }}>
      <Receipt className="w-8 h-8" style={{ stroke: '#d4eaf2' }} />
      <span className="text-[13px]">{t('noResults')}</span>
    </div>
  )

  const loadingState = (
    <div className="flex justify-center py-10">
      <Loader className="w-5 h-5 animate-spin" style={{ stroke: '#8aaabb' }} />
    </div>
  )

  return (
    <article className="mt-8">
      {/* Section title */}
      <div className="mb-3">
        <h2
          className="text-[15px] sm:text-[16px] font-bold tracking-wide"
          style={{ color: '#0a4a6e' }}
        >
          {t('title')}
        </h2>
      </div>

      {/* Filter pills — scrollable on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-2.5 mb-1" style={{ scrollbarWidth: 'none' }}>
        {filterOptions.map(({ value, label }) => {
          const isActive = typeFilter === value
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
      </div>

      {/* ── Desktop: table ── */}
      <div
        className="hidden sm:block rounded-[14px] overflow-hidden"
        style={{ border: '2px solid #d4eaf2', background: '#fff' }}
      >
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th
                className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[.6px] cursor-pointer select-none whitespace-nowrap"
                style={{
                  color: '#8aaabb',
                  borderBottom: '1.5px solid #d4eaf2',
                  background: '#f0fafd',
                }}
                onClick={handleSortToggle}
              >
                {t('period')}
                <span className="ml-1 opacity-60 text-[10px]">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              </th>
              {[t('type'), t('status'), t('amount'), t('invoice')].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[.6px] whitespace-nowrap"
                  style={{
                    color: '#8aaabb',
                    borderBottom: '1.5px solid #d4eaf2',
                    background: '#f0fafd',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading || isPending ? (
              <tr>
                <td colSpan={5}>{loadingState}</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5}>{emptyState}</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
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
                    {formatPeriod(row)}
                  </td>
                  <td className="px-4 py-[13px]">
                    <TypeBadge
                      label={row.kind === 'memberFee' ? t('typeMemberFee') : t('typePool')}
                      isPool={row.kind === 'pool'}
                    />
                  </td>
                  <td className="px-4 py-[13px]">{getStatusCell(row)}</td>
                  <td className="px-4 py-[13px] tabular-nums" style={{ color: '#3d5a70' }}>
                    {format.number(row.amount, { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-4 py-[13px]">
                    <InvoiceBtn row={row} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: cards ── */}
      <div className="sm:hidden">
        {isLoading || isPending
          ? loadingState
          : rows.length === 0
            ? emptyState
            : rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-xl overflow-hidden mb-2.5"
                  style={{ border: '2px solid #d4eaf2', background: '#fff' }}
                >
                  <div className="grid" style={{ gridTemplateColumns: '6px 1fr' }}>
                    {/* Colored left bar */}
                    <div className="self-stretch" style={{ background: barColor(row) }} />
                    <div className="p-3.5">
                      {/* Top row: period + amount */}
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="font-semibold text-[13px] tabular-nums"
                          style={{ color: '#0f1f2e' }}
                        >
                          {formatPeriod(row)}
                        </div>
                        <div
                          className="font-bold text-[15px] shrink-0 ml-2 tabular-nums"
                          style={{ color: '#0a4a6e' }}
                        >
                          {format.number(row.amount, { style: 'currency', currency: 'EUR' })}
                        </div>
                      </div>
                      {/* Bottom row: type + status + invoice */}
                      <div className="flex items-center gap-2">
                        <TypeBadge
                          label={row.kind === 'memberFee' ? t('typeMemberFee') : t('typePool')}
                          isPool={row.kind === 'pool'}
                        />
                        {getStatusCell(row)}
                        <div className="ml-auto">
                          <InvoiceBtn row={row} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
      </div>

      <FrontPagination
        page={currentPage}
        totalPages={totalPages}
        totalDocs={totalDocs}
        perPage={SUBS_PAGE_SIZE}
        onPageClick={(p) => setCurrentPage(p)}
        className="mt-3"
      />
    </article>
  )
}
