'use client'

import { createPendingOrder } from '@/actions/order'
import { StripePaymentForm } from '@/components/StripePayment'
import { LineItem } from '@/helpers/stripeHelper'
import { getClientSideURL } from '@/utilities/getURL'
import { useToast } from '@/hooks/use-toast'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { TypedLocale } from 'payload'
import { useEffect, useRef, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

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

  const [orderId, setOrderId] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const creatingRef = useRef(false)

  useEffect(() => {
    if (creatingRef.current) return
    creatingRef.current = true

    createPendingOrder(locale).then((result) => {
      if (!result.success || !result.orderId) {
        setInitError(result.message ?? t('Common.unexpectedError'))
        return
      }
      setOrderId(result.orderId)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSuccess = async (_paymentIntentId: string) => {
    // Webhook handles DB confirmation — just redirect
    router.push(`/order/${orderId}`)
  }

  if (initError) {
    return <p className="text-sm text-destructive">{initError}</p>
  }

  if (!orderId) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-10 w-2/3 rounded-xl" />
      </div>
    )
  }

  return (
    <StripePaymentForm
      amount={amountCents}
      description={description}
      metadata={{ type: 'order', recordId: orderId }}
      customer={customer}
      lineItems={lineItems}
      onSuccess={handleSuccess}
      returnUrl={`${getClientSideURL()}/${locale}/order/confirmation`}
    />
  )
}
