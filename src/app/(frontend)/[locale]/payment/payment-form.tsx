'use client'

import { createOrder } from '@/actions/order'
import { StripePaymentForm } from '@/components/StripePayment'
import { LineItem } from '@/helpers/stripeHelper'
import { getClientSideURL } from '@/utilities/getURL'
import { useToast } from '@/hooks/use-toast'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { TypedLocale } from 'payload'

type Props = {
  amountCents: number
  description: string
  lineItems: LineItem[]
  customer: {
    name: string
    email: string
    taxNumber?: string
  }
}

export const PaymentForm: React.FC<Props> = ({ amountCents, description, lineItems, customer }) => {
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

    router.push(`/order/${response.orderId}`)
  }

  return (
    <StripePaymentForm
      amount={amountCents}
      description={description}
      metadata={{ type: 'order' }}
      customer={customer}
      lineItems={lineItems}
      onSuccess={handleSuccess}
      returnUrl={`${getClientSideURL()}/${locale}/order/confirmation`}
    />
  )
}
