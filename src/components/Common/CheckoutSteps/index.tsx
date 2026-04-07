'use client'

import { cn } from '@/utilities/ui'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

const CheckoutSteps: React.FC<{ current: number }> = ({ current = 0 }) => {
  const t = useTranslations('CheckoutSteps')
  const steps = ['cart', 'payment', 'receipt'] as const

  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, index) => {
        const isDone = index < current
        const isActive = index === current

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 relative z-10 transition-all',
                  isDone && 'border-green-500 bg-green-500 text-white',
                  isActive && 'border-[#0e7ea8] bg-[#0e7ea8] text-white',
                  !isDone && !isActive && 'border-[#d4eaf2] bg-white text-[#8aaabb]',
                )}
              >
                {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 font-medium',
                  isDone && 'text-green-700',
                  isActive && 'text-[#0e7ea8] font-semibold',
                  !isDone && !isActive && 'text-[#8aaabb]',
                )}
              >
                {t(step)}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn('h-0.5 w-16 mx-1 mb-5', isDone ? 'bg-green-500' : 'bg-[#d4eaf2]')}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default CheckoutSteps
