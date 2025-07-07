import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params

  const terminalId = process.env.SIBS_TERMINAL_ID || '89336'
  if (!terminalId) {
    throw new Error('SIBS_TERMINAL_ID not defined')
  }

  const sibsResponse = await fetch(`${process.env.SIBS_API_URL}/v2/payments/${id}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SIBS_SECRET_KEY}`,
      'X-IBM-Client-Id': process.env.SIBS_CLIENT_ID || '',
    },
  })

  const result = await sibsResponse.json()

  return NextResponse.json(result, { status: sibsResponse.status })
}
