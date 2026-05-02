'use client'

import { StripePaymentForm } from '@/components/StripePayment'
import { getClientSideURL } from '@/utilities/getURL'
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
  const t = useTranslations()

  const handleSuccess = async (_paymentIntentId: string) => {
    // Webhook handles DB confirmation (transactionId + invoice) — just redirect
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
