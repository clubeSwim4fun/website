'use client'

import { Ticket } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/helpers/cartHelper'
import { useTransition } from 'react'
import { useToast } from '@/hooks/use-toast'
import { CirclePlus, LoaderCircle, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/providers/Cart'
import { useTranslations } from 'next-intl'

export const AddToCart: React.FC<{
  ticket: Ticket
  disabled: boolean
}> = (props) => {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const { ticket, disabled } = props
  const { refreshCart } = useCart()
  const t = useTranslations()
  const onClickHandler = async () => {
    startTransition(async () => {
      const response = await addToCart({ ticket })

      if (!response.success) {
        toast({
          title: t('Common.error'),
          description: response.message,
          variant: 'destructive',
        })
      } else {
        await refreshCart()
        toast({
          title: t('Common.success'),
          description: response.message,
          action: (
            <Button asChild variant={'outline'} size="sm" className="bg-gray-900 text-white">
              <Link href="/cart" className="flex gap-2 items-center">
                <span>{t('Cart.goToCart')}</span>
                <ShoppingCart />
              </Link>
            </Button>
          ),
        })
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClickHandler}
      disabled={isPending || disabled}
      aria-label={t('Cart.addToCart')}
    >
      {isPending ? (
        <span className="flex gap-2 items-center">
          <LoaderCircle className="w-4 h-4 animate-spin" />
        </span>
      ) : (
        <CirclePlus className="w-4 h-4" />
      )}
    </Button>
  )
}
