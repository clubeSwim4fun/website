'use client'

import { useCart } from '@/providers/Cart'
import { useEffect } from 'react'

export const OrderPageClient = () => {
  const { refreshCart } = useCart()

  useEffect(() => {
    console.log('updated')
    refreshCart()
  }, [])

  return null
}
