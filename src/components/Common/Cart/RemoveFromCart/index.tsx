'use client'

import { Ticket } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { removeFromCart } from '@/helpers/cartHelper'
import { useTransition } from 'react'
import { useToast } from '@/hooks/use-toast'
import { CircleMinus, LoaderCircle } from 'lucide-react'

export const RemoveFromCart: React.FC<{
  ticket: Ticket
}> = (props) => {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const { ticket } = props

  const onClickHandler = async () => {
    startTransition(async () => {
      const response = await removeFromCart({ ticket })

      if (!response.success) {
        toast({
          title: 'Error', // TODO - Add translations
          description: response.message,
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClickHandler}
      disabled={isPending}
      aria-label="Remove from cart"
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
