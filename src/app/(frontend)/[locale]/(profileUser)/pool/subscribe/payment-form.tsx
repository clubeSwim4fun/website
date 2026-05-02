'use client'

import { createPendingPoolSubscription } from '@/actions/pool-subscription'
import { StripePaymentForm } from '@/components/StripePayment'
import { useToast } from '@/hooks/use-toast'
import { PoolCycle, User } from '@/payload-types'
import { useRouter } from '@/i18n/routing'
import { getClientSideURL } from '@/utilities/getURL'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader } from 'lucide-react'

type Args = {
  cycle: PoolCycle
  user: User
}

export const PoolPaymentForm: React.FC<Args> = ({ cycle, user }) => {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { toast } = useToast()
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    createPendingPoolSubscription(cycle.id).then((result) => {
      if (!result.success || !result.subscriptionId) {
        setInitError(result.message || t('Common.unexpectedError'))
        return
      }
      setSubscriptionId(result.subscriptionId)
    })
  }, [])

  const amountCents = Math.round(cycle.price * 100)
  const description = `Pool subscription - ${user.name} ${user.surname}`
  const returnUrl = `${getClientSideURL()}/${locale}/pool/confirmation`

  const stripeMetadata = useMemo<Record<string, string>>(() => {
    const meta: Record<string, string> = { type: 'pool-subscription' }
    if (subscriptionId) meta.recordId = subscriptionId
    return meta
  }, [subscriptionId])

  const stripeCustomer = useMemo(
    () => ({
      name: `${user.name} ${user.surname ?? ''}`.trim(),
      email: user.email,
    }),
    [user.name, user.surname, user.email],
  )

  const handleSuccess = async (_paymentIntentId: string) => {
    // Webhook handles DB confirmation — just redirect
    router.push(`/pool/confirmation`)
  }

  if (initError) {
    return <p className="text-sm text-destructive">{initError}</p>
  }

  if (!subscriptionId) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader className="w-4 h-4 animate-spin" />
        <span>A preparar pagamento...</span>
      </div>
    )
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
