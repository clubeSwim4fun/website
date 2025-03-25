'use client'

import { GroupCategory } from '@/payload-types'
import { useState } from 'react'
import { Card } from '../ui/card'

type Ticket = {
  name?: string | null
  price?: number | null
  canBePurchasedBy?: (string | GroupCategory)[] | null
  id?: string | null
}
export const EventTickets: React.FC<{
  tickets?: Ticket[] | null
}> = (props) => {
  const [topClass, setTopClass] = useState('top-4')
  const { tickets } = props
  console.log('t', tickets)

  if (tickets?.length === 0) return

  return (
    <Card
      className={`dark:bg-slate-900 transition-all duration-500 ease-in-out border rounded-xl shadow-md shadow-gray-400 border-blueSwim p-4 h-max w-full flex flex-col bg-white gap-1`}
    >
      <h3 className="font-extrabold text-2xl md:text-3xl">Tickets</h3>
    </Card>
  )
}
