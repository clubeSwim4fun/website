import React from 'react'

type RacesData = {
  swimgpLabel?: string | null
  swimgpTitle?: string | null
  swimgpDescription?: string | null
  teamCodeLabel?: string | null
  teamCode?: string | null
  promoCodeLabel?: string | null
  promoCode?: string | null
}

type Props = {
  races: RacesData
  teamCopyButton?: React.ReactNode
  promoCopyButton?: React.ReactNode
}

const dotPatternStyle = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
}

export function SwimGPCardCMS({ races, teamCopyButton, promoCopyButton }: Props) {
  return (
    <div
      className="relative mt-4 overflow-hidden rounded-[14px] p-8"
      style={{ background: 'linear-gradient(135deg, #0a4a6e 0%, #0e7ea8 100%)' }}
    >
      <div className="pointer-events-none absolute inset-0" style={dotPatternStyle} />

      <div className="relative z-10 grid gap-10 md:grid-cols-2">
        <div>
          {races.swimgpLabel && (
            <div className="mb-2.5 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[1px] text-white/60">
              {races.swimgpLabel}
            </div>
          )}
          {races.swimgpTitle && (
            <h3 className="mb-3 font-['Syne',sans-serif] text-2xl font-extrabold leading-[1.2] text-white">
              {races.swimgpTitle}
            </h3>
          )}
          {races.swimgpDescription && (
            <p className="text-[14px] leading-[1.65] text-white/80">{races.swimgpDescription}</p>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {races.teamCode && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[11px] border border-white/20 bg-white/10 px-[18px] py-[14px]">
              <div>
                {races.teamCodeLabel && (
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.6px] text-white/55">
                    {races.teamCodeLabel}
                  </div>
                )}
                <div className="break-all font-['DM_Sans',sans-serif] text-[13px] font-medium text-white">
                  {races.teamCode}
                </div>
              </div>
              {teamCopyButton}
            </div>
          )}

          {races.promoCode && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[11px] border border-white/20 bg-white/10 px-[18px] py-[14px]">
              <div>
                {races.promoCodeLabel && (
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.6px] text-white/55">
                    {races.promoCodeLabel}
                  </div>
                )}
                <div className="break-all font-['DM_Sans',sans-serif] text-[13px] font-medium text-white">
                  {races.promoCode}
                </div>
              </div>
              {promoCopyButton}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
