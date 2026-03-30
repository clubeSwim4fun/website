'use client'

import { createOrder } from '@/actions/order'
import { StripePaymentForm } from '@/components/StripePayment'
import { getClientSideURL } from '@/utilities/getURL'
import { useToast } from '@/hooks/use-toast'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { TypedLocale } from 'payload'

type Props = {
  /** Cart total in EUR cents */
  amountCents: number
}

export const PaymentForm: React.FC<Props> = ({ amountCents }) => {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations()
  const locale = useLocale() as TypedLocale

  const handleSuccess = async (paymentIntentId: string) => {
    const response = await createOrder(locale, paymentIntentId)

    if (!response.success) {
      toast({
        variant: 'destructive',
        description: response.message || t('Common.unexpectedError'),
      })
      throw new Error(response.message)
    }

    router.push(`/${locale}/order/${response.orderId}`)
  }

  return (
    <StripePaymentForm
      amount={amountCents}
      description="Event ticket purchase"
      metadata={{ type: 'order' }}
      onSuccess={handleSuccess}
      returnUrl={`${getClientSideURL()}/${locale}/order/confirmation`}
    />
  )
}
