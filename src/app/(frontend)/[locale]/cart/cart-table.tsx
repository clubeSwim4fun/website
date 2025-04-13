'use client'

import Link from 'next/link'
import { Fragment, useTransition } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RemoveFromCart } from '@/components/Common/Cart/RemoveFromCart'
import { eventTicket } from './page'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateCart } from '@/helpers/cartHelper'
import { useToast } from '@/hooks/use-toast'
import { Controller, useForm } from 'react-hook-form'
import { Error } from '@/blocks/Form/Error'
import { cn } from '@/utilities/ui'
import { useFormatter, useTranslations } from 'next-intl'

export const CartTable: React.FC<{ eventsTickets: eventTicket; total?: number }> = (props) => {
  const { eventsTickets, total } = props
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations()
  const format = useFormatter()

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<Record<string, string>>({
    defaultValues: {},
  })

  const submitCart = (data: Record<string, string>) => {
    const selectedTshirts: string[] = []

    Object.entries(data).forEach(([key, value]) => {
      selectedTshirts.push(`${key}-${value}`)
    })

    startTransition(async () => {
      const response = await updateCart(selectedTshirts)

      if (!response.success) {
        toast({
          variant: 'destructive',
          description: response.message || t('Common.unexpectedError'),
        })
        return
      } else {
        router.push('/payment')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(submitCart)}>
      {Object.keys(eventsTickets).map((eventKey) => (
        <Fragment key={eventKey}>
          <div className="flex justify-between w-full mt-4">
            <h2 className="text-2xl font-bold mb-3 capitalize">
              <Link href={`/event/${eventsTickets[eventKey]?.slug}` || '/'}>{eventKey}</Link>
            </h2>
          </div>
          <Table className="w-full">
            <TableHeader className="bg-gray-100 dark:bg-slate-900">
              <TableRow className="border-b dark:border-slate-700">
                <TableHead className="text-left max-w-[50%]">{t('Cart.ticket')}</TableHead>
                <TableHead className="text-left max-w-[50%]">{t('Event.distance')}</TableHead>
                <TableHead className="text-center max-w-[30%]">
                  {/* TODO - add from nextitl currency formating */}
                  {t(
                    'Cart.eventTotalPrice',
                    {
                      price:
                        (eventsTickets[eventKey] &&
                          eventsTickets[eventKey].tickets.reduce(
                            (total, ticket) => total + (ticket.price || 0),
                            0,
                          )) ||
                        0,
                    },
                    { number: { currency: { style: 'currency', currency: 'EUR' } } },
                  )}
                </TableHead>
                {eventsTickets[eventKey]?.hasTshirt && (
                  <TableHead className="text-center max-w-[10%]">{t('Cart.tShirtSize')}</TableHead>
                )}
                <TableHead className="text-center max-w-[20%]">{t('Common.remove')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventsTickets[eventKey] &&
                eventsTickets[eventKey].tickets.map((ticket) => {
                  const cartItemTicket = ticket
                  if (!cartItemTicket) return null

                  return (
                    <TableRow className="border-b dark:border-slate-700" key={ticket.id}>
                      <TableCell className="text-left max-w-[50%]">{cartItemTicket.name}</TableCell>
                      <TableCell className="text-left max-w-[50%]">
                        {cartItemTicket.distance}
                      </TableCell>
                      <TableCell className="text-center max-w-[30%]">
                        {`${format.number(cartItemTicket.price, {
                          style: 'currency',
                          currency: 'EUR',
                        })}`}
                      </TableCell>
                      {eventsTickets[eventKey]?.hasTshirt && (
                        <TableCell className="flex justify-center">
                          <Controller
                            control={control}
                            defaultValue={''}
                            name={ticket.id}
                            rules={{ required: true }}
                            render={({ field: { onChange, value } }) => {
                              return (
                                <div className="flex flex-col justify-center">
                                  <Select
                                    onValueChange={(value) => onChange(value)}
                                    value={value}
                                    disabled={isPending}
                                    {...register(ticket.id, { required: true })}
                                  >
                                    <SelectTrigger
                                      className={cn('max-w-[120px]', {
                                        'border-destructive': errors[`${ticket.id}`],
                                      })}
                                    >
                                      <SelectValue placeholder="Tamanho" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {eventsTickets[eventKey]?.tshirtSizes?.map((size) => (
                                        <SelectItem key={size} value={size}>
                                          {size}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {errors[`${ticket.id}`] && <Error />}
                                </div>
                              )
                            }}
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-center max-w-[20%]">
                        <RemoveFromCart ticket={cartItemTicket} disabled={isPending} />
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </Fragment>
      ))}
      <div className="flex flex-col justify-end items-end mt-6 text-end">
        <p className="font-bold text-lg">
          {t(
            'Cart.totalPrice',
            { price: total || 0 },
            { number: { currency: { style: 'currency', currency: 'EUR' } } },
          )}
        </p>
        <Button className="group w-fit mt-4" disabled={isPending} type="submit">
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {t('Cart.proceedToPayment')}{' '}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-all duration-500" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
