import React from 'react'
import { TemplateEmail } from './template'
import { Subscription, User } from '@/payload-types'
import { getTranslations } from 'next-intl/server'
import { getFormatter } from 'next-intl/server'

type Args = {
  subscription: Subscription
  locale: string
}

export async function SubscriptionConfirmationEmail({ subscription, locale }: Args) {
  const t = await getTranslations({ locale, namespace: 'Email' })
  const format = await getFormatter({ locale })
  const user = subscription.user as User

  const startDate = format.dateTime(new Date(subscription.startDate), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const endDate = format.dateTime(new Date(subscription.endDate), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const amount = format.number(subscription.amount, { style: 'currency', currency: 'EUR' })

  return (
    <TemplateEmail title={t('SubscriptionConfirmation.title')}>
      <p>
        {t('dearUser', {
          name: user.name,
          surname: user.surname,
        })}
      </p>
      <p>{t('SubscriptionConfirmation.description')}</p>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '16px',
          marginBottom: '24px',
        }}
      >
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px 4px', fontWeight: 'bold', width: '40%' }}>
              {t('SubscriptionConfirmation.period')}
            </td>
            <td style={{ padding: '8px 4px' }}>
              {startDate} – {endDate}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>
              {t('SubscriptionConfirmation.amount')}
            </td>
            <td style={{ padding: '8px 4px' }}>{amount}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>
              {t('SubscriptionConfirmation.status')}
            </td>
            <td style={{ padding: '8px 4px', color: '#2ecc71', fontWeight: 'bold' }}>
              {t('SubscriptionConfirmation.paid')}
            </td>
          </tr>
        </tbody>
      </table>
      <p>{t('SubscriptionConfirmation.footer')}</p>
    </TemplateEmail>
  )
}
