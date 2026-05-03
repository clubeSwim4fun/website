import React from 'react'
import { cn } from '@/utilities/ui'

export type StatItem = { value: string; label: string; id?: string | null }

type Props = {
  stats: StatItem[]
  /** 'hero-dark' — white text on dark bg (HighImpact hero, BenefitsHero)
   *  'card'      — dark text on light bg (CardBlock stats variant) */
  variant?: 'hero-dark' | 'card'
  className?: string
}

export const StatsList: React.FC<Props> = ({ stats, variant = 'hero-dark', className }) => {
  if (!stats.length) return null

  if (variant === 'card') {
    return (
      <div className={cn('grid grid-cols-2 gap-3', className)}>
        {stats.map((stat, i) => (
          <div
            key={stat.id ?? i}
            className="rounded-xl border border-swim-border bg-gray-50 px-4 py-5 text-center"
          >
            <p className="font-outfit text-2xl md:text-4xl font-extrabold leading-none mb-2 text-ink">
              {stat.value}
            </p>
            <p className="text-sm text-ink-light leading-snug">{stat.label}</p>
          </div>
        ))}
      </div>
    )
  }

  // hero-dark
  return (
    <div className={cn('flex gap-8 flex-wrap', className)}>
      {stats.map((stat, i) => (
        <div key={stat.id ?? i}>
          <div className="font-outfit font-extrabold text-3xl text-white leading-none">
            {stat.value}
          </div>
          <div className="text-[12px] text-white/60 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
