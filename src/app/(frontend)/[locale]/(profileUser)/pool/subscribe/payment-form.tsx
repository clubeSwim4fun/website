'use client'

import { createPoolSubscription } from '@/actions/pool-subscription'
import { StripePaymentForm } from '@/components/StripePayment'
import { useToast } from '@/hooks/use-toast'
import { PoolCycle, User } from '@/payload-types'
import { useRouter } from '@/i18n/routing'
import { getClientSideURL } from '@/utilities/getURL'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'

type Args = {
  cycle: PoolCycle
  user: User
}

export const PoolPaymentForm: React.FC<Args> = ({ cycle, user }) => {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { toast } = useToast()

  const amountCents = Math.round(cycle.price * 100)
  const description = `Pool subscription - ${user.name} ${user.surname}`
  const returnUrl = `${getClientSideURL()}/${locale}/pool/confirmation`

  const stripeMetadata = useMemo(() => ({ type: 'pool-subscription' }), [])

  const stripeCustomer = useMemo(
    () => ({
      name: `${user.name} ${user.surname ?? ''}`.trim(),
      email: user.email,
    }),
    [user.name, user.surname, user.email],
  )

  const handleSuccess = async (paymentIntentId: string) => {
    const response = await createPoolSubscription(cycle.id, paymentIntentId)

    if (!response.success) {
      toast({
        variant: 'destructive',
        description: response.message || t('Common.unexpectedError'),
      })
      return
    }

    router.push(`/pool/confirmation`)
  }

  return (
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
  )
}
