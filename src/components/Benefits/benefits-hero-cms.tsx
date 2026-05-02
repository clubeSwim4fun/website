import React from 'react'

type Stat = { value: string; label: string; id?: string | null }

type Props = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  stats?: Stat[] | null
}

const dotPatternStyle = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
}

export function BenefitsHeroCMS({ eyebrow, title, description, stats }: Props) {
  return (
    <div
      className="relative -mt-[52px] overflow-hidden px-5 pb-16 pt-[calc(52px+4rem)] md:-mt-[68px] md:px-20 md:pb-16 md:pt-[calc(68px+4rem)]"
      style={{ background: 'linear-gradient(135deg, #0a4a6e 0%, #0e7ea8 100%)' }}
    >
      <div className="pointer-events-none absolute inset-0" style={dotPatternStyle} />

      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-10 md:flex-row md:items-center">
        <div>
          {eyebrow && (
            <div className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.12] px-[14px] py-[6px] text-[12px] font-semibold uppercase tracking-[0.5px] text-white/90">
              <svg
                width="7"
                height="7"
                viewBox="0 0 7 7"
                aria-hidden="true"
                className="flex-shrink-0"
              >
                <circle cx="3.5" cy="3.5" r="3.5" fill="#2ecc71" />
              </svg>
              {eyebrow}
            </div>
          )}

          {title && (
            <h1 className="mb-[14px] font-['Syne',sans-serif] text-[44px] font-extrabold leading-[1.1] tracking-[-0.5px] text-white">
              {title}
            </h1>
          )}

          {description && (
            <p className="max-w-[520px] text-[16px] leading-[1.65] text-white/75">{description}</p>
          )}

          {/* Mobile stats */}
          {stats && stats.length > 0 && (
            <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="rounded-[12px] border border-white/[0.18] bg-white/[0.12] px-5 py-4 text-center"
                >
                  <div className="font-['Syne',sans-serif] text-[26px] font-extrabold leading-none text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.4px] text-white/60">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop stats */}
        {stats && stats.length > 0 && (
          <div className="hidden shrink-0 flex-row gap-2 md:flex">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="min-w-[90px] rounded-[12px] border border-white/[0.18] bg-white/[0.12] px-5 py-4 text-center"
              >
                <div className="font-['Syne',sans-serif] text-[26px] font-extrabold leading-none text-white">
                  {stat.value}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.4px] text-white/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
