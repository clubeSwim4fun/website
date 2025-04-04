'use client'

import { useCart } from '@/providers/Cart'
import { ShoppingCart } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'
import Link from 'next/link'
import { Ticket } from '@/payload-types'
import { Button } from '../ui/button'

// TODO add cart floating to bottom on mobile
export const Cart: React.FC = () => {
  const { cart, refreshCart } = useCart()

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
          <p className="text-sm text-gray-500">€ {cartItem.price.toFixed(2)}</p>
        </Link>
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-4 relative">
      {cart?.items?.length && (
        <span className="absolute -top-3 -right-3 rounded-full px-[6px] py-[2px] bg-red-600 text-white text-xs">
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
              <p>Carrinho vazio</p>
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
