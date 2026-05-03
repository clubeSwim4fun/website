import { getTranslations } from 'next-intl/server'

type Props = { t: Awaited<ReturnType<typeof getTranslations>> }

const dotPatternStyle = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
}

const STATS = [
  { value: '6', labelKey: 'hero.statPartners' as const },
  { value: '20%', labelKey: 'hero.statDiscount' as const },
  { value: '5%', labelKey: 'hero.statSwimGP' as const },
]

export function BenefitsHero({ t }: Props) {
  return (
    <div
      className="relative overflow-hidden px-5 py-16 md:px-20"
      style={{ background: 'linear-gradient(135deg, #0a4a6e 0%, #0e7ea8 100%)' }}
    >
      {/* dot-pattern overlay */}
      <div className="pointer-events-none absolute inset-0" style={dotPatternStyle} />

      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-10 md:flex-row md:items-center">
        {/* text */}
        <div>
          {/* eyebrow badge */}
          <div className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.12] px-[14px] py-[6px] text-[12px] font-semibold uppercase tracking-[0.5px] text-white/90">
            {/* SVG dot decoration */}
            <svg
              width="7"
              height="7"
              viewBox="0 0 7 7"
              aria-hidden="true"
              className="flex-shrink-0"
            >
              <circle cx="3.5" cy="3.5" r="3.5" fill="#2ecc71" />
            </svg>
            {t('hero.eyebrow')}
          </div>

          <h1 className="mb-[14px] font-['Outfit',sans-serif] text-[44px] font-extrabold leading-[1.1] tracking-[-0.5px] text-white">
            {t('hero.title')}
          </h1>

          <p className="max-w-[520px] text-[16px] leading-[1.65] text-white/75">
            {t('hero.description')}
          </p>

          {/* mobile stats (grid, inside text column on small screens) */}
          <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
            {STATS.map(({ value, labelKey }) => (
              <div
                key={labelKey}
                className="rounded-[12px] border border-white/[0.18] bg-white/[0.12] px-5 py-4 text-center"
              >
                <div className="font-['Outfit',sans-serif] text-[26px] font-extrabold leading-none text-white">
                  {value}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.4px] text-white/60">
                  {t(labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* desktop stats (flex-row, right side) */}
        <div className="hidden shrink-0 flex-row gap-2 md:flex">
          {STATS.map(({ value, labelKey }) => (
            <div
              key={labelKey}
              className="min-w-[90px] rounded-[12px] border border-white/[0.18] bg-white/[0.12] px-5 py-4 text-center"
            >
              <div className="font-['Outfit',sans-serif] text-[26px] font-extrabold leading-none text-white">
                {value}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.4px] text-white/60">
                {t(labelKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
