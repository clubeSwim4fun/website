'use client'

import { createPoolSubscription } from '@/actions/pool-subscription'
import { StripePaymentForm } from '@/components/StripePayment'
import { useToast } from '@/hooks/use-toast'
import { PoolCycle, User } from '@/payload-types'
import { useRouter } from '@/i18n/routing'
import { getClientSideURL } from '@/utilities/getURL'
import { useLocale, useTranslations } from 'next-intl'
import { getMonthIndex, getMonthLabel } from '@/collections/Pool/PoolCycles'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Lock } from 'lucide-react'

type Props = {
  cycle: PoolCycle
  user: User
  remainingSpots: number
}

export const SubscribeInline: React.FC<Props> = ({ cycle, user, remainingSpots }) => {
  const t = useTranslations('PoolSubscription')
  const locale = useLocale()
  const router = useRouter()
  const { toast } = useToast()
  const [showPayment, setShowPayment] = useState(false)

  const amountCents = Math.round(cycle.price * 100)
  const description = `Pool subscription - ${user.name} ${user.surname}`
  const returnUrl = `${getClientSideURL()}/${locale}/pool?confirmed=1`

  const stripeMetadata = useMemo(() => ({ type: 'pool-subscription' }), [])
  const stripeCustomer = useMemo(
    () => ({ name: `${user.name} ${user.surname ?? ''}`.trim(), email: user.email }),
    [user.name, user.surname, user.email],
  )

  const handleSuccess = async (paymentIntentId: string) => {
    const response = await createPoolSubscription(cycle.id, paymentIntentId)
    if (!response.success) {
      toast({ variant: 'destructive', description: response.message || t('cycleNotFound') })
      return
    }
    router.push(`/pool?confirmed=1`)
  }

  const monthName = new Date(cycle.year, getMonthIndex(cycle.month) - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  const formattedPrice = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(cycle.price)

  if (!showPayment) {
    return (
      <Button onClick={() => setShowPayment(true)} size="lg" className="w-full sm:w-fit">
        {t('subscribeButton')}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Payment section header */}
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('paymentDetails')}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          <span>{t('paymentSecure')}</span>
        </div>
      </div>

      {/* Stripe form */}
      <div className="rounded-xl border bg-card p-5">
        <StripePaymentForm
          amount={amountCents}
          description={description}
          metadata={stripeMetadata}
          customer={stripeCustomer}
          onSuccess={handleSuccess}
          returnUrl={returnUrl}
          payButtonLabel={`${t('payButton')} ${formattedPrice} — ${t('confirmSubscription')}`}
        />
      </div>

      {/* Order summary */}
      <div className="rounded-xl border bg-muted/30 p-4 text-sm flex flex-col gap-2">
        <p className="font-semibold mb-1">{t('orderSummary')}</p>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {t('planName')} — {monthName}
          </span>
          <span>{formattedPrice}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('processingFee')}</span>
          <span>
            {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(0)}
          </span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-2 mt-1">
          <span>{t('totalDue')}</span>
          <span>{formattedPrice}</span>
        </div>
      </div>

      {/* SSL badge */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>{t('sslBadge')}</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-fit -mt-2"
        onClick={() => setShowPayment(false)}
      >
        {t('cancelPayment')}
      </Button>
    </div>
  )
}
