import { NextRequest, NextResponse } from 'next/server'

export type SibsPaymentBody = {
  amount: number
  merchantTransactionId: string
  description: string
}

function generateFiveDigitNumber(): string {
  return String(Math.floor(10000 + Math.random() * 90000))
}

export async function POST(req: NextRequest) {
  const body: SibsPaymentBody = await req.json()

  const paymentMethods = process.env.SIBS_PAYMENT_METHODS?.split(',') || []
  const now = new Date()
  const nowIso = now.toISOString()
  const limit = new Date(now.getTime() + 4 * 60 * 1000).toISOString()

  const terminalId = process.env.SIBS_TERMINAL_ID || '89336'
  if (!terminalId) {
    throw new Error('SIBS_TERMINAL_ID not defined')
  }

  const bodyObj = {
    merchant: {
      terminalId: Number(terminalId),
      channel: 'web',
      merchantTransactionId: generateFiveDigitNumber(),
    },
    transaction: {
      transactionTimestamp: nowIso,
      description: body.description,
      moto: false,
      paymentType: 'PURS',
      amount: {
        value: body.amount,
        currency: 'EUR',
      },
      paymentMethod: paymentMethods,
      paymentReference: {
        initialDatetime: nowIso,
        finalDatetime: limit,
        maxAmount: {
          value: body.amount,
          currency: 'EUR',
        },
        minAmount: {
          value: body.amount,
          currency: 'EUR',
        },
        entity: process.env.SIBS_ENTITY || '53412',
      },
    },
  }

  const sibsResponse = await fetch(`${process.env.SIBS_API_URL}/v2/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SIBS_SECRET_KEY}`,
      'X-IBM-Client-Id': process.env.SIBS_CLIENT_ID || '',
    },
    body: JSON.stringify(bodyObj),
  })

  const result = await sibsResponse.json()

  return NextResponse.json(result, { status: sibsResponse.status })
}
