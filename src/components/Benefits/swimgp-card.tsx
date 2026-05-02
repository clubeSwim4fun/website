import { getTranslations } from 'next-intl/server'
import React from 'react'

type Props = {
  t: Awaited<ReturnType<typeof getTranslations>>
  teamCopyButton: React.ReactNode
  promoCopyButton: React.ReactNode
}

const TEAM_CODE = 'SGP26_Team_2383639023701783287038'
const PROMO_CODE = 'SWIMGP26_CLUBE SWIM4FUN'

const dotPatternStyle = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
}

export function SwimGPCard({ t, teamCopyButton, promoCopyButton }: Props) {
  return (
    <div
      className="relative mt-4 overflow-hidden rounded-[14px] p-8"
      style={{ background: 'linear-gradient(135deg, #0a4a6e 0%, #0e7ea8 100%)' }}
    >
      {/* dot-pattern overlay */}
      <div className="pointer-events-none absolute inset-0" style={dotPatternStyle} />

      <div className="relative z-10 grid gap-10 md:grid-cols-2">
        {/* left: label + title + description */}
        <div>
          <div className="mb-2.5 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[1px] text-white/60">
            {t('races.swimgp.label')}
          </div>
          <h3 className="mb-3 font-['Syne',sans-serif] text-2xl font-extrabold leading-[1.2] text-white">
            {t('races.swimgp.title')}
          </h3>
          <p className="text-[14px] leading-[1.65] text-white/80">
            {t('races.swimgp.description')}
          </p>
        </div>

        {/* right: code rows */}
        <div className="flex flex-col gap-2.5">
          {/* team code row */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[11px] border border-white/20 bg-white/10 px-[18px] py-[14px]">
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.6px] text-white/55">
                {t('races.swimgp.teamCodeLabel')}
              </div>
              <div className="break-all font-['DM_Sans',sans-serif] text-[13px] font-medium text-white">
                {TEAM_CODE}
              </div>
            </div>
            {teamCopyButton}
          </div>

          {/* promo code row */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[11px] border border-white/20 bg-white/10 px-[18px] py-[14px]">
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.6px] text-white/55">
                {t('races.swimgp.promoCodeLabel')}
              </div>
              <div className="break-all font-['DM_Sans',sans-serif] text-[13px] font-medium text-white">
                {PROMO_CODE}
              </div>
            </div>
            {promoCopyButton}
          </div>
        </div>
      </div>
    </div>
  )
}
