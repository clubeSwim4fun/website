'use client'

import { useCart } from '@/providers/Cart'
import { useEffect } from 'react'

export const OrderPageClient = () => {
  const { refreshCart } = useCart()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    refreshCart()
  }, [])

  return null
}
