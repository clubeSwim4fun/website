'use client'

import { createPoolSubscription } from '@/actions/pool-subscription'
import { StripePaymentForm } from '@/components/StripePayment'
import { useToast } from '@/hooks/use-toast'
import { PoolCycle, User } from '@/payload-types'
import { useRouter } from '@/i18n/routing'
import { getClientSideURL } from '@/utilities/getURL'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

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
  const returnUrl = `${getClientSideURL()}/${locale}/pool/confirmation`

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
    router.push(`/pool/confirmation`)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">{t('remainingSpots', { count: remainingSpots })}</p>
      <p className="text-sm text-muted-foreground">{t('noRefundNotice')}</p>

      {!showPayment ? (
        <Button onClick={() => setShowPayment(true)} className="w-fit">
          {t('subscribeButton')}
        </Button>
      ) : (
        <div className="max-w-lg">
          <StripePaymentForm
            amount={amountCents}
            description={description}
            metadata={stripeMetadata}
            customer={stripeCustomer}
            onSuccess={handleSuccess}
            returnUrl={returnUrl}
          />
        </div>
      )}
    </div>
  )
}
