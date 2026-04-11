import React from 'react'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import RichTextColor from '@/components/RichText/RichTextColor'
import { CtaButton } from '@/components/CtaButton'
import {
  Users,
  Clock,
  Cloud,
  Star,
  Flag,
  Calendar,
  ArrowRight,
  Heart,
  Trophy,
  MapPin,
} from 'lucide-react'

// ── Perk icon map ────────────────────────────────────────────────────────────
const PERK_ICONS: Record<string, React.ReactNode> = {
  users: <Users size={18} strokeWidth={1.8} />,
  clock: <Clock size={18} strokeWidth={1.8} />,
  cloud: <Cloud size={18} strokeWidth={1.8} />,
  star: <Star size={18} strokeWidth={1.8} />,
  flag: <Flag size={18} strokeWidth={1.8} />,
  calendar: <Calendar size={18} strokeWidth={1.8} />,
  arrow: <ArrowRight size={18} strokeWidth={1.8} />,
  heart: <Heart size={18} strokeWidth={1.8} />,
  trophy: <Trophy size={18} strokeWidth={1.8} />,
  mapPin: <MapPin size={18} strokeWidth={1.8} />,
}

type Column = NonNullable<ContentBlockProps['columns']>[number]

// ── Media column ─────────────────────────────────────────────────────────────
const MediaColumn: React.FC<{ col: Column }> = ({ col }) => (
  <div className="relative rounded-2xl overflow-hidden h-[420px] md:h-full min-h-[320px]">
    {col.media && typeof col.media === 'object' && (
      <Media
        fill
        imgClassName="object-cover w-full h-full"
        className="absolute inset-0 w-full h-full"
        resource={col.media}
      />
    )}
    {col.mediaBadge && (
      <div className="absolute top-5 left-5 z-10">
        <span className="bg-green text-white font-syne font-bold text-sm px-4 py-2 rounded-full">
          {col.mediaBadge}
        </span>
      </div>
    )}
  </div>
)

// ── Content column ───────────────────────────────────────────────────────────
const ContentColumn: React.FC<{ col: Column }> = ({ col }) => {
  const perks = col.perks ?? []
  const links = col.links ?? []

  return (
    <div className="flex flex-col justify-center gap-0">
      {/* Sub-title / section label */}
      {col.subTitle && (
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-0.5 bg-mid rounded-full" />
          <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-mid">
            {col.subTitle}
          </span>
        </div>
      )}

      {/* Rich text — title + description */}
      {col.richText && (
        <div className="content-richtext mb-6">
          <RichTextColor
            data={col.richText as any}
            enableGutter={false}
            enableProse={false}
            className="content-richtext-inner"
          />
        </div>
      )}

      {/* Perks list */}
      {perks.length > 0 && (
        <div className="flex flex-col gap-3.5 mb-8">
          {perks.map((perk, i) => (
            <div key={i} className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-pale flex items-center justify-center flex-shrink-0 text-mid">
                {perk.icon ? (PERK_ICONS[perk.icon] ?? null) : null}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink leading-snug">{perk.title}</p>
                {perk.text && (
                  <p className="text-[13px] text-ink-light leading-snug mt-0.5">{perk.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTAs */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {links.map((item, i) => (
            <CtaButton key={i} link={item.link as any} context="light" />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Block ────────────────────────────────────────────────────────────────────
export const ContentBlock: React.FC<ContentBlockProps> = ({ columns }) => {
  if (!columns?.length) return null

  const cols = columns.slice(0, 2)
  const isSingle = cols.length === 1

  if (isSingle) {
    const col = cols[0]!
    return (
      <section className="container py-16 md:py-20">
        {col.useMedia ? <MediaColumn col={col} /> : <ContentColumn col={col} />}
      </section>
    )
  }

  const left = cols[0]!
  const right = cols[1]!

  return (
    <section className="container py-16 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>{left.useMedia ? <MediaColumn col={left} /> : <ContentColumn col={left} />}</div>
        <div>{right.useMedia ? <MediaColumn col={right} /> : <ContentColumn col={right} />}</div>
      </div>
    </section>
  )
}
