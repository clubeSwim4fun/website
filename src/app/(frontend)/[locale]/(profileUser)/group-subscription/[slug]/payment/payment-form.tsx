'use client'

import { updateGroupSubscription } from '@/actions/group-subscription'
import { StripePaymentForm } from '@/components/StripePayment'
import { getClientSideURL } from '@/utilities/getURL'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

type Props = {
  amountCents: number
  groupSlug: string
  groupSubscriptionId?: string
  groupName: string
  locale: string
  customer: {
    name: string
    email: string
    taxNumber?: string
  }
}

export const PaymentForm: React.FC<Props> = ({
  amountCents,
  groupSlug,
  groupSubscriptionId,
  groupName,
  locale,
  customer,
}) => {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations()

  const handleSuccess = async (paymentIntentId: string) => {
    if (groupSubscriptionId) {
      await updateGroupSubscription({ id: groupSubscriptionId, transactionId: paymentIntentId })
    }

    router.push(`/group-subscription/${groupSlug}`)
  }

  if (!groupSubscriptionId) {
    return <p className="text-destructive">{t('GroupSubscription.missingSubscriptionId')}</p>
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="font-bold text-4xl">{groupName}</h1>
      <StripePaymentForm
        amount={amountCents}
        description={groupName}
        metadata={{ type: 'group-subscription', recordId: groupSubscriptionId }}
        customer={customer}
        onSuccess={handleSuccess}
        returnUrl={`${getClientSideURL()}/${locale}/group-subscription/${groupSlug}`}
      />
    </div>
  )
}
