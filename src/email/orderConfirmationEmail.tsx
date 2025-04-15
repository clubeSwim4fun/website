import React, { Fragment } from 'react'
import { TemplateEmail } from './template'
import { Order, User } from '@/payload-types'
import { OrderEvent, OrderEventTicket } from '@/app/(frontend)/[locale]/order/[id]/order-table'
import { convertMtoKm } from '@/utilities/util'
import { getFormatter, getLocale, getTranslations } from 'next-intl/server'

type Args = {
  order?: Order
}
export async function OrderConfirmationEmail({ order }: Args) {
  const user = order?.user as User
  const locale = await getLocale()
  const t = await getTranslations({ locale })
  const format = await getFormatter({ locale })

  return (
    <TemplateEmail title={t('Order.title')}>
      <p>
        {t('Email.dearUser', {
          name: user.name,
          surname: user.surname,
        })}
      </p>
      <p>{t('Order.description')}</p>

      {order?.events?.map((orderEvent) => {
        const eventObj = orderEvent as OrderEvent

        return (
          <Fragment key={eventObj.id}>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginTop: '12px',
              }}
            >
              <a href={`/event/${eventObj?.event?.slug}` || '/'}>{eventObj?.event?.title}</a>
            </h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '10px',
                marginBottom: '30px',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '10px 5px',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    {t('Cart.ticket')}
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '10px 5px',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    {t('Event.distance')}
                  </th>

                  {eventObj?.event?.hasTshirt && (
                    <th
                      style={{
                        textAlign: 'center',
                        padding: '10px 5px',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      {t('Cart.tShirtSize')}
                    </th>
                  )}
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '10px 5px',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    {t(
                      'Cart.eventTotalPrice',
                      {
                        price:
                          (eventObj &&
                            eventObj?.tickets &&
                            eventObj?.tickets.reduce(
                              (total, t) =>
                                total + ((typeof t.ticket === 'object' && t.ticket.price) || 0),
                              0,
                            )) ||
                          0,
                      },
                      { number: { currency: { style: 'currency', currency: 'EUR' } } },
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {eventObj?.tickets &&
                  eventObj.tickets.map((ticket) => {
                    const orderItemTicket = ticket as OrderEventTicket

                    return (
                      <tr key={ticket.id}>
                        <td style={{ padding: '8px 5px', borderBottom: '1px solid #ddd' }}>
                          {orderItemTicket.ticket.name}
                        </td>
                        <td
                          style={{
                            textAlign: 'center',
                            padding: '8px 5px',
                            borderBottom: '1px solid #ddd',
                          }}
                        >
                          {convertMtoKm(orderItemTicket.ticket.distance)}
                        </td>
                        {eventObj?.event?.hasTshirt && (
                          <td
                            style={{
                              padding: '8px 5px',
                              borderBottom: '1px solid #ddd',
                              textAlign: 'center',
                            }}
                          >
                            {orderItemTicket.tshirtSize}
                          </td>
                        )}
                        <td
                          style={{
                            padding: '8px 5px',
                            borderBottom: '1px solid #ddd',
                            textAlign: 'right',
                          }}
                        >
                          {`${format.number(orderItemTicket.ticket.price, {
                            style: 'currency',
                            currency: 'EUR',
                          })}`}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </Fragment>
        )
      })}

      <p style={{ fontWeight: 'bold', textAlign: 'right' }}>
        {t(
          'Order.totalSpent',
          { price: order?.total || 0 },
          { number: { currency: { style: 'currency', currency: 'EUR' } } },
        )}
      </p>
      <p>
        {t('Order.questionsText')}{' '}
        <strong>
          <a href={`mailto:${t('Order.contactEmail')}`}>{t('Order.contactEmail')}</a>
        </strong>
      </p>
      <p style={{ marginTop: '30px', fontSize: '14px', color: '#777' }}>
        {t('Email.thankYouMessage')}
      </p>
    </TemplateEmail>
  )
}
