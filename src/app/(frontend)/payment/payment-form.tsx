'use client'

import { createOrder } from '@/actions/order'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/providers/Cart'
import { Check, Loader } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useFormStatus } from 'react-dom'

export const PaymentForm: React.FC = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { refreshCart } = useCart()
  const { toast } = useToast()
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      const response = await createOrder()

      if (!response.success) {
        toast({
          variant: 'destructive',
          description:
            response.message || 'Um erro inesperado aconteceu, por favor tente novamente!',
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
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Check className="w-4 h-4" /> Confirmar Pagamento
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
