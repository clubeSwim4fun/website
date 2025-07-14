'use client'

import { createSubscription } from '@/actions/subscription'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { generateSibsPaymentTransaction } from '@/helpers/sibsHelper'
import { getUserPaymentAmount } from '@/helpers/userHelper'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/payload-types'
import { is } from 'date-fns/locale'
import { Check, Loader } from 'lucide-react'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

type Args = {
  user?: User
  associationFees?: {
    registrationFee?: number | null
    monthlyFee: number
    limitDate: number
    periodicity: '1' | '3' | '12'
  }
}

const initialFormConfig = {
  paymentMethodList: ['MBWAY'],
  amount: {
    value: 0,
    currency: 'EUR',
  },
  language: 'pt',
  redirectUrl: '',
  customerData: null,
}

export const PaymentForm: React.FC<Args> = (props) => {
  const { user, associationFees } = props
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const t = useTranslations()
  const format = useFormatter()
  const locale = useLocale()

  const [fees, setFees] = useState({ amount: 0, startDate: new Date(), endDate: new Date() })
  const [transactionID, setTransactionID] = useState('')
  const [formContext, setFormContext] = useState('')
  const [formConfig, setFormConfig] = useState(initialFormConfig)
  const [payForCurrentMonth, setPayForCurrentMonth] = useState(false)
  const formMethods = useForm<{ payForCurrentMonth: boolean }>({
    defaultValues: {
      payForCurrentMonth,
    },
  })
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = formMethods
  const currentDay = new Date().getUTCDate()

  useEffect(() => {
    const fetchAmount = async () => {
      const { amount, endDate, startDate } = await getUserPaymentAmount({
        user,
        fees: associationFees,
        payForCurrentMonth,
      })
      setFees({ amount, startDate, endDate })
      setIsLoading(false)
    }
    fetchAmount()
  }, [payForCurrentMonth])

  const onSubmit: SubmitHandler<{ payForCurrentMonth: boolean }> = async () => {
    startTransition(async () => {
      const sibsForm = await generateSibsPaymentTransaction({
        price: fees.amount,
        orderID: `subscription-${user?.id}`,
        description: t('Subscription.description', {
          username: user?.name || '',
          price: fees.amount,
        }),
      })

      if (sibsForm.error) {
        toast({
          variant: 'destructive',
          description: sibsForm.error.message || t('Common.unexpectedError'),
        })
        return
      }

      setTransactionID(sibsForm.transactionID)
      setFormContext(sibsForm.formContext)

      const response = await createSubscription(payForCurrentMonth, sibsForm.transactionID)

      if (!response.success) {
        toast({
          variant: 'destructive',
          description: response.message || t('Common.unexpectedError'),
        })
        return
      }
    })
  }

  useEffect(() => {
    if (transactionID && formContext) {
      const script = document.createElement('script')
      script.src = `https://spg.qly.site1.sibs.pt/assets/js/widget.js?id=${transactionID}` // TODO update to env var
      script.async = true
      document.body.appendChild(script)

      setFormConfig({
        paymentMethodList: ['MBWAY'],
        amount: {
          value: fees.amount,
          currency: 'EUR',
        },
        language: locale,
        redirectUrl: `${window.location.origin}/subscription/order-generation`,
        customerData: null,
      })

      return () => {
        document.body.removeChild(script)
      }
    }
  }, [transactionID, formContext])

  const PlaceOrderButton = () => {
    return (
      <Button disabled={isSubmitting} className="w-full">
        {isSubmitting || isPending ? (
          <div className="flex flex-row items-center justify-center gap-2">
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
  return isLoading ? (
    <div className="flex items-center space-x-4">
      {/* TODO - add proper skeleton */}
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ) : (
    <div className="flex flex-col">
      <h1 className="font-bold text-4xl mb-6">{t('Subscription.title')}</h1>
      <div className="flex flex-col gap-0">
        <p className="font-semibold text-xl">
          {t('Subscription.userTitle', {
            username: user?.name || '',
          })}{' '}
        </p>
        <p className="text-lg">
          {t(
            'Subscription.description',
            {
              price: fees.amount,
            },
            { number: { currency: { style: 'currency', currency: 'EUR' } } },
          )}
        </p>

        <p className="text-lg">
          {t('Subscription.descriptionDate', {
            dateRange: format.dateTimeRange(fees.startDate, fees.endDate),
          })}
        </p>
      </div>

      <div className="my-4 border-t border-t-gray-400 mx-[10%]" />
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        {associationFees && associationFees.limitDate < currentDay && (
          <div className="flex gap-2 items-center mb-4">
            <Controller
              control={control}
              name={`payForCurrentMonth`}
              render={() => (
                <Checkbox
                  defaultChecked={payForCurrentMonth}
                  id="payForCurrentMonth"
                  disabled={(!!transactionID && !!formContext) || isSubmitting || isPending}
                  onCheckedChange={(checked) => {
                    setPayForCurrentMonth(!!checked.valueOf())
                  }}
                />
              )}
            />
            <Label htmlFor="payForCurrentMonth">{t('Subscription.payForCurrentMonth')}</Label>
          </div>
        )}
        {!transactionID && !formContext && <PlaceOrderButton />}
      </form>

      <div className="mt-4">
        <form
          className="w-full paymentSPG"
          spg-context={formContext}
          spg-config={JSON.stringify(formConfig)}
        />
        {isPending ||
          (isSubmitting && (
            <div className="flex flex-col gap-20 items-center justify-center min-h-60 bg-[#f7f7f7] py-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-2 w-36 bg-slate-500 rounded-xl" />
                <Skeleton className="h-2 w-36 bg-slate-500 rounded-xl" />
                <Skeleton className="h-2 w-36 bg-slate-500 rounded-xl" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-12 w-12 bg-slate-500 rounded-xl" />
                <Skeleton className="h-12 w-36 bg-slate-500 rounded-xl" />
              </div>
              <Skeleton className="h-12 w-36 bg-slate-500 rounded-full" />
            </div>
          ))}
      </div>
    </div>
  )
}
