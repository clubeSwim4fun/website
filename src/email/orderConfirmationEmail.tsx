import React from 'react'
import { TemplateEmail } from './template'

type Item = {
  name: string
  price: string
}

type Args = {
  customerName: string
  orderId: string
  items: Item[]
  totalPrice: string
  deliveryDate: string
}
export function OrderConfirmationEmail({
  customerName,
  orderId,
  items,
  totalPrice,
  deliveryDate,
}: Args) {
  return (
    <TemplateEmail>
      <p>Dear {customerName},</p>
      <p>Thank you for your purchase! Here are the details of your order:</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '10px 5px', borderBottom: '1px solid #ddd' }}>
              Item
            </th>
            <th style={{ textAlign: 'right', padding: '10px 5px', borderBottom: '1px solid #ddd' }}>
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={{ padding: '8px 5px', borderBottom: '1px solid #ddd' }}>{item.name}</td>
              <td
                style={{ textAlign: 'right', padding: '8px 5px', borderBottom: '1px solid #ddd' }}
              >
                {item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontWeight: 'bold', textAlign: 'right' }}>Total: {totalPrice}</p>
      <p>
        Your order ID is <strong>{orderId}</strong>, and it is expected to be delivered by{' '}
        <strong>{deliveryDate}</strong>.
      </p>
      <p>If you have any questions, feel free to contact us at support@example.com.</p>
      <p style={{ marginTop: '30px', fontSize: '14px', color: '#777' }}>
        Thank you for shopping with us!
      </p>
    </TemplateEmail>
  )
}
