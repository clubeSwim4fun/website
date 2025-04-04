'use client'

import { getMyCart } from '@/helpers/cartHelper'
import { Cart } from '@/payload-types'
import React, { createContext, useEffect } from 'react'

type CartContextType = {
  cart?: Cart | null
  refreshCart: () => void
}
const cartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [cart, setCart] = React.useState<Cart | null | undefined>(null)

  const refreshCart = async () => {
    const cartData = await getMyCart()
    setCart(cartData)
  }

  useEffect(() => {
    refreshCart()
  }, [])

  return <cartContext.Provider value={{ cart, refreshCart }}>{children}</cartContext.Provider>
}

export const useCart = (): CartContextType => {
  const context = React.useContext(cartContext)

  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }

  return context
}
