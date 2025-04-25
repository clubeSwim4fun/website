'use client'

import { useCart } from '@/providers/Cart'
import { ShoppingCart } from 'lucide-react'
import React, { useEffect } from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import Link from 'next/link'
import { Ticket } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { useFormatter, useTranslations } from 'next-intl'

export const Cart: React.FC = () => {
  const { cart, refreshCart } = useCart()
  const t = useTranslations('Cart')
  const format = useFormatter()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    refreshCart()
  }, [])

  const CartItem: React.FC<{ cartItem: Ticket }> = ({ cartItem }) => {
    return (
      <Button asChild variant={'ghost'} size={'clear'}>
        <Link
          href={
            typeof cartItem.eventFor === 'object' && 'slug' in cartItem.eventFor
              ? `/event/${cartItem.eventFor.slug}`
              : '#'
          }
          className="flex items-center justify-between border-b-2 border-gray-200 pb-2 last:border-b-0"
        >
          <div className="flex flex-col">
            <p className="text-sm font-medium">{cartItem.name}</p>
            <p className="text-xs text-gray-500">
              {typeof cartItem.eventFor === 'object' ? cartItem.eventFor.title : cartItem.eventFor}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            {format.number(cartItem.price, {
              currency: 'EUR',
              style: 'currency',
            })}
          </p>
        </Link>
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-4 relative">
      {cart?.items && cart.items.length > 0 && (
        <span className="absolute -top-2 -right-2 rounded-full w-4 h-4 flex items-center justify-center bg-red-600 text-white text-xs">
          {cart?.items?.length}
        </span>
      )}
      <Link href="/cart" className="flex md:hidden items-center justify-center">
        <ShoppingCart className="w-6 h-6" />
      </Link>
      <div className="hidden md:block">
        <HoverCard openDelay={0}>
          <HoverCardTrigger asChild>
            <Link href="/cart" className="flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </Link>
          </HoverCardTrigger>
          <HoverCardContent align="end" className="w-[300px] p-4">
            {!cart?.items?.length ? (
              <p>{t('emptyCart')}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {cart?.items?.map((item) => (
                  <CartItem key={item.id} cartItem={item.selectedTicket as Ticket} />
                ))}
              </div>
            )}
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  )
}
