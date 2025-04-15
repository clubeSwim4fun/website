'use client'

import { Button } from '@/components/ui/button'
import { sendEmail as sendEmailFn } from '@/helpers/emailHelper'
import { useCart } from '@/providers/Cart'
import { useEffect } from 'react'
import { render } from '@react-email/components'
import { OrderConfirmationEmail } from '@/email/orderConfirmationEmail'

export const CartPageClient = () => {
  const { refreshCart } = useCart()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    refreshCart()
  }, [])

  const sendEmail = async () => {
    const emailHtml = await render(
      <OrderConfirmationEmail
        customerName="Luiz"
        deliveryDate="01/01/2025"
        items={[{ name: 'p1', price: '€20' }]}
        orderId="12345"
        totalPrice="€20"
        key={1}
      />,
    )
    await sendEmailFn(emailHtml)
  }

  return <Button onClick={() => sendEmail()}>Send email</Button>
}
