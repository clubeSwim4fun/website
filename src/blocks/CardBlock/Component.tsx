import React from 'react'
import type { CardBlock as CardBlockProps, Media as MediaType } from '@/payload-types'
import { ICON_MAP } from '@/components/IconMap'
import { Media } from '@/components/Media'
import RichTextColor from '@/components/RichText/RichTextColor'
import { Download } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { FormBlock } from '@/blocks/Form/Component'
import { CardPaymentVariant } from './Component.client'

// ── Color map ────────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, { bar: string; iconBg: string; iconText: string }> = {
  blue: { bar: 'bg-mid', iconBg: 'bg-pale', iconText: 'text-mid' },
  green: { bar: 'bg-green-500', iconBg: 'bg-green-50', iconText: 'text-green-700' },
  amber: { bar: 'bg-amber-400', iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
  coral: { bar: 'bg-rose-400', iconBg: 'bg-rose-50', iconText: 'text-rose-600' },
  teal: { bar: 'bg-teal-500', iconBg: 'bg-teal-50', iconText: 'text-teal-700' },
}

// ── Download button ──────────────────────────────────────────────────────────
const DownloadItem: React.FC<{ file: MediaType; label: string }> = ({ file, label }) => {
  const url = file?.url
  if (!url) return null
  const ext = url.split('.').pop()?.toUpperCase() ?? 'FILE'

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-swim-border bg-white px-4 py-3 hover:bg-pale transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-pale flex items-center justify-center flex-shrink-0 text-mid">
        <Download size={16} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink leading-tight truncate">{label}</p>
        <p className="text-[11px] text-ink-light">{ext} · Descarregar</p>
      </div>
    </a>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export const CardBlockComponent: React.FC<CardBlockProps> = async ({
  cardColor = 'blue',
  icon,
  title,
  variant,
  richText,
  stats,
  listItems,
  image,
  downloads,
  form,
  paymentAmount,
  paymentDescription,
  paymentMetadata,
  paymentAssignToGroup,
  paymentHideButton,
  paymentSuccessMessage,
}) => {
  const colors = COLOR_MAP[cardColor ?? 'blue'] ?? COLOR_MAP.blue!
  const iconNode = icon && icon !== 'none' ? ICON_MAP[icon] : null

  const metadataMap = Object.fromEntries((paymentMetadata ?? []).map((m) => [m.key, m.value]))

  return (
    <div className="container mb-4">
      <div className="bg-white rounded-2xl border border-swim-border shadow-sm overflow-hidden">
        {/* Left color bar */}
        <div className="grid grid-cols-[6px_1fr]">
          <div className={cn(colors.bar, 'self-stretch')} />

          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-swim-border">
              {iconNode && (
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    colors.iconBg,
                    colors.iconText,
                  )}
                >
                  {iconNode}
                </div>
              )}
              <h3 className="font-outfit text-lg font-bold text-deep leading-snug">{title}</h3>
            </div>

            {/* Variant: text */}
            {variant === 'text' && richText && (
              <RichTextColor data={richText} enableGutter={false} enableProse />
            )}

            {/* Variant: stats */}
            {variant === 'stats' && !!stats?.length && (
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                  <div
                    key={stat.id ?? i}
                    className="rounded-xl border border-swim-border bg-gray-50 px-4 py-5 text-center"
                  >
                    <p className="font-outfit text-2xl md:text-4xl font-extrabold leading-none mb-2 text-ink">
                      {stat.number}
                    </p>
                    <p className="text-sm text-ink-light leading-snug">{stat.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Variant: list */}
            {variant === 'list' && !!listItems?.length && (
              <ul className="flex flex-col divide-y divide-swim-border">
                {listItems.map((item, i) => (
                  <li key={item.id ?? i} className="flex items-start gap-3 py-3 first:pt-0">
                    <span className={cn('mt-1.5 w-2 h-2 rounded-full flex-shrink-0', colors.bar)} />
                    {item.text && (
                      <RichTextColor
                        data={item.text}
                        enableGutter={false}
                        enableProse={false}
                        className="text-sm text-ink leading-relaxed [&_p]:m-0"
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Variant: image */}
            {variant === 'image' && image && typeof image === 'object' && (
              <div className="rounded-xl overflow-hidden border border-swim-border">
                <Media resource={image} imgClassName="w-full h-auto object-cover" />
              </div>
            )}

            {/* Variant: form — renders form without submit button; payment field handles submission */}
            {variant === 'form' && form && typeof form === 'object' && (
              <div className="-mx-2">
                <FormBlock
                  form={form as any}
                  enableIntro={false}
                  blockType="formBlock"
                  hideSubmitButton
                  noContainer
                />
              </div>
            )}

            {/* Variant: payment */}
            {variant === 'payment' && paymentAmount != null && (
              <CardPaymentVariant
                amount={paymentAmount}
                description={
                  typeof paymentDescription === 'string' ? paymentDescription : undefined
                }
                metadata={metadataMap}
                assignToGroup={(paymentAssignToGroup as any) ?? null}
                hideButton={paymentHideButton ?? false}
                successMessage={(paymentSuccessMessage as any) ?? null}
              />
            )}

            {/* Downloads */}
            {!!downloads?.length && (
              <div className={cn('grid gap-3 sm:grid-cols-2', variant !== 'text' && 'mt-6')}>
                {downloads.map((dl, i) => {
                  if (!dl.file || typeof dl.file !== 'object') return null
                  return (
                    <DownloadItem key={dl.id ?? i} file={dl.file as MediaType} label={dl.label} />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
