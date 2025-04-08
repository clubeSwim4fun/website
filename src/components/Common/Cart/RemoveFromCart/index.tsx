'use client'

import { Ticket } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { removeFromCart } from '@/helpers/cartHelper'
import { useTransition } from 'react'
import { useToast } from '@/hooks/use-toast'
import { CircleMinus, LoaderCircle } from 'lucide-react'
import { useCart } from '@/providers/Cart'
import { useTranslations } from 'next-intl'

export const RemoveFromCart: React.FC<{
  ticket: Ticket
  disabled?: boolean
}> = (props) => {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const { ticket, disabled } = props
  const { refreshCart } = useCart()
  const t = useTranslations()

  const onClickHandler = async () => {
    startTransition(async () => {
      const response = await removeFromCart({ ticket })

      if (!response.success) {
        toast({
          title: t('Common.error'),
          description: response.message,
          variant: 'destructive',
        })
      } else {
        await refreshCart()
      }
    })
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClickHandler}
      disabled={isPending || disabled}
      aria-label={t('Cart.removeFromCart')}
    >
      {isPending ? (
        <span className="flex gap-2 items-center">
          <LoaderCircle className="w-4 h-4 animate-spin" />
        </span>
      ) : (
        <CircleMinus className="w-4 h-4" />
      )}
    </Button>
  )
}
