'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'

export async function resendOrderConfirmationEmail(
  orderId: string,
): Promise<{ success: boolean; message: string }> {
  const { user } = await getMeUser()
  if (!user || (user as any).role !== 'admin') {
    return { success: false, message: 'Unauthorized' }
  }

  const payload = await getPayload({ config })

  const order = await payload.findByID({ collection: 'orders', id: orderId, depth: 3 })
  if (!order) return { success: false, message: 'Order not found' }

  const orderUser =
    typeof order.user === 'string'
      ? await payload.findByID({ collection: 'users', id: order.user })
      : order.user

  if (!orderUser?.email) return { success: false, message: 'User email not found' }

  try {
    const React = await import('react')
    const { render } = await import('@react-email/components')
    const { OrderConfirmationEmail } = await import('@/email/orderConfirmationEmail')
    const { sendEmail } = await import('@/helpers/emailHelper')

    const emailHtml = await render(
      React.default.createElement(OrderConfirmationEmail, { order, locale: 'pt' }),
    )

    await sendEmail({
      emailHtml,
      subject: 'Confirmação de encomenda',
      to: orderUser.email,
    })

    return { success: true, message: `Email sent to ${orderUser.email}` }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, message }
  }
}
