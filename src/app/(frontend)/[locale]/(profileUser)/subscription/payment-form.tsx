'use client'

import { createPendingSubscription } from '@/actions/subscription'
import { StripePaymentForm } from '@/components/StripePayment'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserPaymentAmount } from '@/helpers/userHelper'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'
import { Lock } from 'lucide-react'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useEffect, useMemo, useState, useRef } from 'react'

type Args = {
  user?: User
  associationFees?: {
    registrationFee?: number | null
    monthlyFee: number
    limitDate: number
    periodicity: '1' | '3' | '12'
  }
}

export const PaymentForm: React.FC<Args> = ({ user, associationFees }) => {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations()
  const format = useFormatter()
  const locale = useLocale()

  const [isLoading, setIsLoading] = useState(true)
  const [payForCurrentMonth, setPayForCurrentMonth] = useState(false)
  const [fees, setFees] = useState({ amount: 0, startDate: new Date(), endDate: new Date() })
  // subscriptionId is created before the payment intent so it can be passed as metadata
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [intentKey, setIntentKey] = useState(0)
  const pendingRef = useRef(false)

  const currentDay = new Date().getUTCDate()

  const stripeMetadata = useMemo<Record<string, string>>(() => {
    const meta: Record<string, string> = { type: 'subscription' }
    if (subscriptionId) meta.recordId = subscriptionId
    return meta
  }, [subscriptionId])

  const stripeCustomer = useMemo(
    () =>
      user?.name && user?.email
        ? {
            name: `${user.name} ${user.surname ?? ''}`.trim(),
            email: user.email,
            taxNumber: user.nif ?? undefined,
          }
        : undefined,
    [user?.name, user?.surname, user?.email, user?.nif],
  )

  const createPending = async (forCurrentMonth: boolean) => {
    if (pendingRef.current) return
    pendingRef.current = true
    setIsLoading(true)

    const [amountResult, pendingResult] = await Promise.all([
      getUserPaymentAmount({ user, fees: associationFees, payForCurrentMonth: forCurrentMonth }),
      createPendingSubscription(forCurrentMonth),
    ])

    setFees(amountResult)

    if (!pendingResult.success || !pendingResult.subscriptionId) {
      toast({ variant: 'destructive', description: t('Common.unexpectedError') })
      pendingRef.current = false
      setIsLoading(false)
      return
    }

    setSubscriptionId(pendingResult.subscriptionId)
    pendingRef.current = false
    setIsLoading(false)
  }

  useEffect(() => {
    createPending(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMonthToggle = async (checked: boolean) => {
    setPayForCurrentMonth(checked)
    setSubscriptionId(null)
    setIntentKey((k) => k + 1)
    pendingRef.current = false
    await createPending(checked)
  }

  const handleSuccess = async (_paymentIntentId: string) => {
    // Webhook handles DB confirmation — just redirect
    router.push(`/subscription/order-generation?id=${_paymentIntentId}`)
  }

  const amountCents = Math.round(fees.amount * 100)
  const stripeDescription = t('Subscription.invoiceItemName')
  const returnUrl = `${getClientSideURL()}/${locale}/subscription/order-generation`

  const isAnnual = associationFees?.periodicity === '12'

  const periodLabel = isLoading
    ? '...'
    : isAnnual
      ? String(fees.startDate.getUTCFullYear())
      : format.dateTimeRange(fees.startDate, fees.endDate, { month: 'short', year: 'numeric' })

  const amountLabel = isLoading
    ? '...'
    : format.number(fees.amount, { style: 'currency', currency: 'EUR' })

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <p className="text-xs text-muted-foreground">
        {t('Subscription.breadcrumbAccount')} ›{' '}
        <span className="text-primary">{t('Subscription.breadcrumbPayment')}</span>
      </p>

      {/* Hero banner */}
      <div className="rounded-xl bg-gradient-to-br from-[#0a4a6e] to-[#0e7ea8] p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">
            {t('Subscription.bannerSup')}
          </p>
          <p className="font-bold text-lg leading-tight">
            {t('Subscription.bannerTitle', { username: user?.name ?? '' })}
          </p>
        </div>
        <div className="flex gap-6 shrink-0">
          <div>
            <p className="font-extrabold text-xl">{amountLabel}</p>
            <p className="text-[10px] opacity-65 mt-0.5">{t('Subscription.bannerAmountLabel')}</p>
          </div>
          <div>
            <p className="font-extrabold text-xl">{periodLabel}</p>
            <p className="text-[10px] opacity-65 mt-0.5">
              {isAnnual ? t('Subscription.bannerSeasonLabel') : t('Subscription.bannerPeriodLabel')}
            </p>
          </div>
        </div>
      </div>

      {/* Current month checkbox */}
      {associationFees && associationFees.limitDate < currentDay && (
        <div className="flex gap-3 items-start rounded-xl border border-amber-300 bg-amber-50 p-3.5">
          <Checkbox
            id="payForCurrentMonth"
            checked={payForCurrentMonth}
            onCheckedChange={(checked) => handleMonthToggle(!!checked.valueOf())}
            className="mt-0.5"
          />
          <div>
            <Label
              htmlFor="payForCurrentMonth"
              className="text-sm font-medium text-amber-900 cursor-pointer"
            >
              {t('Subscription.payForCurrentMonth')}
            </Label>
            {!isLoading && (
              <p className="text-xs text-amber-700 mt-0.5">
                {format.dateTimeRange(fees.startDate, fees.endDate)} · {amountLabel}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stripe payment form */}
      {isLoading || !subscriptionId ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-10 w-2/3 rounded-xl" />
        </div>
      ) : (
        <div className="rounded-xl border-2 border-border overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
            <div className="w-8 h-8 rounded-full bg-[#e0f5fb] flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5 text-[#0e7ea8]" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#0a4a6e]">
                {t('Subscription.securePaymentTitle')}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {t('Subscription.securePaymentSub')}
              </p>
            </div>
          </div>
          <div className="p-5">
            <StripePaymentForm
              key={intentKey}
              amount={amountCents}
              description={stripeDescription}
              metadata={stripeMetadata}
              customer={stripeCustomer}
              onSuccess={handleSuccess}
              returnUrl={returnUrl}
            />
          </div>
        </div>
      )}

      {/* Order summary */}
      {!isLoading && (
        <div className="rounded-xl border border-border bg-[#f0fafd] p-4 flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('Subscription.summaryFee')} — {periodLabel}
            </span>
            <span className="font-medium">{amountLabel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('Subscription.summaryProcessingFee')}</span>
            <span className="font-medium">
              {format.number(0, { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
          <div className="flex justify-between text-sm border-t border-border pt-2 mt-1">
            <span className="font-bold text-[#0a4a6e]">{t('Subscription.summaryTotal')}</span>
            <span className="font-extrabold text-[#0a4a6e] text-base">{amountLabel}</span>
          </div>
        </div>
      )}

      {/* Security hint */}
      <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <Lock className="w-2.5 h-2.5" />
        {t('Subscription.securityHint')}
      </p>
    </div>
  )
}
