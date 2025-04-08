import { cn } from '@/utilities/ui'
import { useTranslations } from 'next-intl'
import React from 'react'

const CheckoutSteps: React.FC<{ current: number }> = ({ current = 0 }) => {
  const t = useTranslations('CheckoutSteps')
  return (
    <div className="flex flex-between items-center flex-col md:flex-row space-x-2 space-y-2 mb-10 container mx-auto w-fit">
      {['cart', 'payment', 'receipt'].map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={cn(
              'p-2 w-56 rounded-full text-center text-sm',
              index === current && 'bg-secondary',
            )}
          >
            {t(step)}
          </div>
          {step !== 'receipt' && <hr className="w-16 border-t border-gray-300 mx-2" />}
        </React.Fragment>
      ))}
    </div>
  )
}

export default CheckoutSteps
