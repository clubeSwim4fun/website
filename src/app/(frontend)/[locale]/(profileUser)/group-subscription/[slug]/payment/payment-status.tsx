'use client'

import { getClientSideURL } from '@/utilities/getURL'
import { useCallback, useEffect, useState } from 'react'

const PaymentStatus: React.FC<{ id: string }> = ({ id }) => {
  const [message, setMessage] = useState<string>('Validando...')

  const getPaymentStatus = useCallback(async () => {
    try {
      const response = await fetch(`${getClientSideURL()}/api/sibs/payment/${id}/status`, {
        method: 'GET',
      })

      return response.json()
    } catch (error) {
      console.error('Error fetching SIBS response:', error)
      // TODO - handle error properly, maybe redirect to an error page
    }
  }, [id])

  useEffect(() => {
    const interval = setInterval(async () => {
      const paymentResponse = await getPaymentStatus()
      // TODO - add paymentstatus update in the DB and link with transaction ID

      const status = (paymentResponse.paymentStatus as string).toLowerCase() || 'pending'

      console.log('Payment status fetched:', paymentResponse)

      if (status !== 'pending') {
        clearInterval(interval)

        switch (status) {
          case 'success':
            setMessage('Pagamento efetuado com sucesso!')
            break
          case 'declined':
            setMessage(
              'Pagamento recusado. Por favor, tente novamente ou entre em contato com o suporte.',
            )
            break
          case 'timeout':
            setMessage('Tempo limite excedido. Por favor, tente novamente.')
            break
          default:
            setMessage(
              'Status de pagamento desconhecido. Por favor, entre em contato com o suporte.',
            )
            break
        }
      }
    }, 1000)
  }, [getPaymentStatus])

  return <>{message}</>
}

export default PaymentStatus
