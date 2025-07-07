'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { getClientSideURL } from '@/utilities/getURL'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

type Args = {
  groupSlug?: string
  transactionID?: string
  formContext?: string
  signature?: string
}

export const PaymentForm: React.FC<Args> = (props) => {
  const { formContext, transactionID, signature, groupSlug } = props
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslations()
  const locale = useLocale()

  const groupSubscriptionId = sessionStorage.getItem('groupSubscriptionId')
  // TODO - add error message to do not show payment form if groupSubscriptionId is not set

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://spg.qly.site1.sibs.pt/assets/js/widget.js?id=${transactionID}` // TODO update to env var
    script.async = true
    document.body.appendChild(script)

    setIsLoading(false)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const formConfig = {
    paymentMethodList: ['MBWAY'],
    amount: {
      value: 5,
      currency: 'EUR',
    },
    language: locale,
    redirectUrl: `${getClientSideURL()}/group-subscription/${groupSlug}/payment`,
    customerData: null,
  }

  return isLoading ? (
    <div className="flex items-center space-x-4">
      {/* TODO - add proper skeleton */}
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ) : groupSubscriptionId ? (
    <>start again... add button here removing payment path</>
  ) : (
    <form
      className="w-full paymentSPG"
      spg-context={formContext}
      spg-config={JSON.stringify(formConfig)}
      spg-signature={signature}
    ></form>
  )
}
