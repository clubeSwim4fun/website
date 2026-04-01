'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEffect, useState, useTransition, useCallback } from 'react'
import {
  getUserSubscriptions,
  SubscriptionRow,
  SubscriptionTypeFilter,
  SubscriptionSortOrder,
} from '@/helpers/subscriptionHelper'
import { useFormatter, useTranslations } from 'next-intl'
import { ArrowUp, ArrowDown, Loader, FileDown } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { Link } from '@/i18n/routing'
import { fetchReceiptForPaymentIntent } from '@/actions/invoice'
import { useToast } from '@/hooks/use-toast'

type Args = { userId: string }

export const UserSubscriptions: React.FC<Args> = ({ userId }) => {
  const t = useTranslations('User.Subscriptions')
  const format = useFormatter()
  const { toast } = useToast()

  const [rows, setRows] = useState<SubscriptionRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const [typeFilter, setTypeFilter] = useState<SubscriptionTypeFilter>('all')
  const [sortOrder, setSortOrder] = useState<SubscriptionSortOrder>('desc')

  const fetchData = useCallback(() => {
    startTransition(async () => {
      const data = await getUserSubscriptions({ userId, typeFilter, sortOrder })
      setRows(data)
      setIsLoading(false)
    })
  }, [userId, typeFilter, sortOrder])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDownloadInvoice = async (paymentIntentId: string, rowId: string) => {
    setDownloadingId(rowId)
    console.log('HEEERE ', paymentIntentId)
    const result = await fetchReceiptForPaymentIntent(paymentIntentId)
    setDownloadingId(null)
    if (result.error || !result.receipt) {
      toast({
        variant: 'destructive',
        description: t('invoiceNotAvailable'),
      })
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
    // Use Intl to get month name from number
    const date = new Date(row.year, row.month - 1, 1)
    return `${format.dateTime(date, { month: 'long', year: 'numeric' })}`
  }

  const formatStatus = (row: SubscriptionRow) => {
    if (row.kind === 'memberFee') {
      return t(
        `status${row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1)}` as
          | 'statusPaid'
          | 'statusPending'
          | 'statusFailed',
      )
    }
    if (row.status === 'active') return t('statusSubscribed')
    if (row.status === 'waitlisted') return t('statusWaitlisted')
    return t('statusCancelled')
  }

  const statusColor = (row: SubscriptionRow) => {
    if (row.kind === 'memberFee') {
      if (row.paymentStatus === 'paid') return 'text-green-600'
      if (row.paymentStatus === 'failed') return 'text-red-500'
      return 'text-yellow-600'
    }
    if (row.status === 'active') return 'text-green-600'
    if (row.status === 'waitlisted') return 'text-yellow-600'
    return 'text-muted-foreground'
  }

  return (
    <article className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">{t('title')}</h2>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-900 rounded-lg p-1">
          {filterOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-all',
                typeFilter === value
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Table className="w-full">
        <TableHeader className="bg-gray-100 dark:bg-slate-900">
          <TableRow className="border-b dark:border-slate-700">
            <TableHead className="text-left">
              <button
                onClick={() => setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'))}
                className="flex items-center gap-1 font-medium hover:text-foreground transition-colors group"
              >
                {t('period')}
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
            </TableHead>
            <TableHead className="text-left">{t('type')}</TableHead>
            <TableHead className="text-left">{t('status')}</TableHead>
            <TableHead className="text-right">{t('amount')}</TableHead>
            <TableHead className="text-right">{t('invoice')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading || isPending ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <Loader className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                {t('noResults')}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className="border-b dark:border-slate-700">
                <TableCell className="text-left tabular-nums">{formatPeriod(row)}</TableCell>
                <TableCell className="text-left">
                  {row.kind === 'memberFee' ? t('typeMemberFee') : t('typePool')}
                </TableCell>
                <TableCell className={cn('text-left font-medium', statusColor(row))}>
                  {row.kind === 'memberFee' && row.linkToSubscription ? (
                    <Link href="/subscription" className="underline hover:no-underline">
                      {formatStatus(row)}
                    </Link>
                  ) : row.kind === 'pool' && row.linkToMyPool ? (
                    <Link href="/pool/my-subscription" className="underline hover:no-underline">
                      {formatStatus(row)}
                    </Link>
                  ) : (
                    formatStatus(row)
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {format.number(row.amount, { style: 'currency', currency: 'EUR' })}
                </TableCell>
                <TableCell className="text-right">
                  {row.paymentStatus === 'paid' && row.stripePaymentIntentId ? (
                    <button
                      onClick={() => handleDownloadInvoice(row.stripePaymentIntentId!, row.id)}
                      disabled={downloadingId === row.id}
                      title={t('downloadInvoice')}
                      className="inline-flex items-center justify-end text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      {downloadingId === row.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileDown className="w-4 h-4" />
                      )}
                    </button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </article>
  )
}
