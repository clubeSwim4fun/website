'use client'

import { Button } from '@/components/ui/button'
import { testEmail } from '@/helpers/cartHelper'
import { useCart } from '@/providers/Cart'
import { useEffect } from 'react'

export const CartPageClient = () => {
  const { refreshCart } = useCart()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    refreshCart()
  }, [])

  const sendEmail = async () => {
    testEmail()
  }

  return <Button onClick={() => sendEmail()}>Send Email</Button>
}
