'use client'

import { createSubscription } from '@/actions/subscription'
import { StripePaymentForm } from '@/components/StripePayment'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserPaymentAmount } from '@/helpers/userHelper'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

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
  // Key forces re-mount of StripePaymentForm when amount changes (new PaymentIntent)
  const [intentKey, setIntentKey] = useState(0)

  const currentDay = new Date().getUTCDate()

  // Stable references — prevent StripePaymentForm from seeing new objects on re-render
  const stripeMetadata = useMemo(
    () => ({ type: 'subscription', userId: user?.id ?? '' }),
    [user?.id],
  )

  const stripeCustomer = useMemo(
    () =>
      user?.name && user?.email
        ? { name: `${user.name} ${user.surname ?? ''}`.trim(), email: user.email }
        : undefined,
    [user?.name, user?.surname, user?.email],
  )

  useEffect(() => {
    const fetchAmount = async () => {
      setIsLoading(true)
      const result = await getUserPaymentAmount({ user, fees: associationFees, payForCurrentMonth })
      setFees(result)
      setIsLoading(false)
    }
    fetchAmount()
  }, [payForCurrentMonth])

  const handleMonthToggle = (checked: boolean) => {
    setPayForCurrentMonth(checked)
    setIntentKey((k) => k + 1)
  }

  const handleSuccess = async (paymentIntentId: string) => {
    const response = await createSubscription(payForCurrentMonth, paymentIntentId)

    if (!response.success) {
      toast({
        variant: 'destructive',
        description: response.message || t('Common.unexpectedError'),
      })
      return
    }

    router.push(`/subscription/order-generation?id=${response.stripePaymentIntentId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    )
  }

  // Stripe expects integer cents
  const amountCents = Math.round(fees.amount * 100)
  // Plain string — the translation key uses currency formatting which errors outside next-intl context
  const stripeDescription = `Subscription - ${user?.name ?? ''} ${user?.surname ?? ''}`
  const returnUrl = `${getClientSideURL()}/${locale}/subscription/order-generation`

  return (
    <div className="flex flex-col">
      <h1 className="font-bold text-4xl mb-6">{t('Subscription.title')}</h1>

      <div className="flex flex-col gap-0">
        <p className="font-semibold text-xl">
          {t('Subscription.userTitle', { username: user?.name || '' })}
        </p>
        <p className="text-lg">
          {t(
            'Subscription.description',
            { price: fees.amount },
            { number: { currency: { style: 'currency', currency: 'EUR' } } },
          )}
        </p>
        <p className="text-lg">
          {t('Subscription.descriptionDate', {
            dateRange: format.dateTimeRange(fees.startDate, fees.endDate),
          })}
        </p>
      </div>

      <div className="my-4 border-t border-t-gray-400 mx-[10%]" />

      {associationFees && associationFees.limitDate < currentDay && (
        <div className="flex gap-2 items-center mb-4">
          <Checkbox
            id="payForCurrentMonth"
            checked={payForCurrentMonth}
            onCheckedChange={(checked) => handleMonthToggle(!!checked.valueOf())}
          />
          <Label htmlFor="payForCurrentMonth">{t('Subscription.payForCurrentMonth')}</Label>
        </div>
      )}

      <div className="max-w-lg">
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
  )
}
