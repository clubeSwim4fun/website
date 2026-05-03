'use client'

import { cn } from '@/utilities/ui'
import { StepConfig, StepId } from './types'
import { useTranslations } from 'next-intl'

type Props = {
  currentStep: StepId
  steps: StepConfig[]
  done: boolean
}

export function ProgressBanner({ currentStep, steps, done }: Props) {
  const t = useTranslations('Registration')
  const stepLabel = done ? t('allDone') : (steps.find((s) => s.id === currentStep)?.title ?? '')
  const counter = done ? '4 / 4' : `${currentStep} / 4`

  return (
    <div
      className="w-full rounded-xl px-6 py-5 flex items-center justify-between gap-4"
      style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2a7fa8 100%)' }}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-white/60 font-medium">
          {t('progressLabel')}
        </p>
        <p
          className="text-lg font-bold text-white truncate"
          style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}
        >
          {stepLabel}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {steps.map((s) => {
          const isActive = !done && s.id === currentStep
          const isComplete = done || s.id < currentStep
          return (
            <span
              key={s.id}
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                isActive ? 'w-7 bg-white' : isComplete ? 'w-2.5 bg-[#2ecc71]' : 'w-2.5 bg-white/30',
              )}
            />
          )
        })}
      </div>

      <div className="flex flex-col items-end shrink-0">
        <p
          className="text-2xl font-extrabold text-white leading-none"
          style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}
        >
          {counter}
        </p>
        <p className="text-[10px] text-white/60 uppercase tracking-widest">{t('steps')}</p>
      </div>
    </div>
  )
}
