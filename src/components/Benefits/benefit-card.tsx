import React from 'react'

type ColorVariant = 'blue' | 'green' | 'amber' | 'coral' | 'purple'
type CardVariant = 'code' | 'contact'

type Props = {
  color: ColorVariant
  icon: React.ReactNode
  discount: string
  name: string
  description: string
  codeLabel: string
  codeValue: string
  href: string
  visitLabel: string
  variant?: CardVariant
  disclaimer?: string
  copyButton?: React.ReactNode
}

const barColor: Record<ColorVariant, string> = {
  blue: '#0e7ea8',
  green: '#2ecc71',
  amber: '#f0a020',
  coral: '#e85d4a',
  purple: '#a78bfa',
}
const iconBg: Record<ColorVariant, string> = {
  blue: '#e0f5fb',
  green: '#e8f8f0',
  amber: '#fef6e4',
  coral: '#fdf0ee',
  purple: '#f3f0ff',
}
const iconColor: Record<ColorVariant, string> = {
  blue: '#0e7ea8',
  green: '#1a9950',
  amber: '#b07010',
  coral: '#e85d4a',
  purple: '#a78bfa',
}
const discountColor: Record<ColorVariant, string> = {
  blue: '#0e7ea8',
  green: '#1a9950',
  amber: '#b07010',
  coral: '#e85d4a',
  purple: '#a78bfa',
}

export function BenefitCard({
  color,
  icon,
  discount,
  name,
  description,
  codeLabel,
  codeValue,
  href,
  visitLabel,
  variant = 'code',
  disclaimer,
  copyButton,
}: Props) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border border-[#d4eaf2] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3bb8d8] hover:shadow-[0_12px_40px_rgba(10,74,110,0.18)]">
      {/* inner: colored bar + body */}
      <div className="grid flex-1" style={{ gridTemplateColumns: '6px 1fr' }}>
        {/* left bar */}
        <div className="self-stretch" style={{ background: barColor[color] }} />

        {/* body */}
        <div className="flex flex-1 flex-col gap-0 px-[22px] py-5">
          {/* header: icon + discount */}
          <div className="mb-3 flex items-start justify-between gap-2.5">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: iconBg[color], color: iconColor[color] }}
            >
              {icon}
            </div>
            <span
              className="font-['Outfit',sans-serif] text-[22px] font-extrabold leading-none"
              style={{ color: discountColor[color] }}
            >
              {discount}
            </span>
          </div>

          {/* name */}
          <div className="mb-[5px] font-['Outfit',sans-serif] text-[15px] font-bold text-[#0a4a6e]">
            {name}
          </div>

          {/* description */}
          <p className="flex-1 text-[13px] leading-[1.55] text-[#3d5a70]">{description}</p>

          {/* footer */}
          <div className="mt-[14px] flex flex-wrap items-center justify-between gap-2 border-t border-[#d4eaf2] pt-3">
            <div className="flex items-center gap-[7px]">
              <span className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#8aaabb]">
                {codeLabel}
              </span>
              <span className="rounded-[6px] border border-[#d4eaf2] bg-[#f0fafd] px-[9px] py-[3px] font-['Outfit',sans-serif] text-[12px] font-medium tracking-[0.5px] text-[#0f1f2e]">
                {codeValue}
              </span>
              {variant === 'code' && copyButton}
            </div>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0e7ea8] no-underline transition-[gap] duration-150 hover:gap-[7px]"
            >
              {visitLabel}
              {/* arrow icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-[11px] w-[11px] fill-none stroke-current"
                strokeWidth={2.5}
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>

          {/* disclaimer */}
          {disclaimer && (
            <p
              className="mt-2 text-[11px] font-semibold leading-snug"
              style={{ color: discountColor[color] }}
            >
              {disclaimer}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
