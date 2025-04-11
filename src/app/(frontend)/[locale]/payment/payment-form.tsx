'use client'

import { createOrder } from '@/actions/order'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Check, Loader } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { TypedLocale } from 'payload'
import { useTransition } from 'react'
import { useFormStatus } from 'react-dom'

export const PaymentForm: React.FC = () => {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const { toast } = useToast()
  const t = useTranslations()
  const locale = useLocale() as TypedLocale

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      const response = await createOrder(locale)

      if (!response.success) {
        toast({
          variant: 'destructive',
          description: response.message || t('Common.unexpectedError'),
        })
      } else {
        router.push(`/order/${response.orderId}`)
      }
    })
  }

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus()

    return (
      <Button disabled={pending} className="w-full">
        {pending ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader className="w-4 h-4 animate-spin" /> {t('Payment.payButtonLoading')}
          </div>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" /> {t('Payment.payButton')}
          </>
        )}
      </Button>
    )
  }

  // TODO integrate with payment gateway
  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <PlaceOrderButton />
    </form>
  )
}
