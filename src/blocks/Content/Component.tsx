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

// ── Card colour map ──────────────────────────────────────────────────────────
const CARD_COLORS: Record<string, { bar: string; text: string }> = {
  blue: { bar: 'bg-mid', text: 'text-mid' },
  amber: { bar: 'bg-amber', text: 'text-amber' },
  coral: { bar: 'bg-coral', text: 'text-coral' },
}

type Column = NonNullable<ContentBlockProps['columns']>[number]
type Perk = NonNullable<Column['perks']>[number]
type PerkCard = NonNullable<Column['perkCards']>[number]
type PerkBar = NonNullable<Column['perkBars']>[number]

// ── Icons list ───────────────────────────────────────────────────────────────
const PerkIcons: React.FC<{ perks: Perk[] }> = ({ perks }) => (
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
)

// ── Cards list ───────────────────────────────────────────────────────────────
const PerkCards: React.FC<{ cards: PerkCard[] }> = ({ cards }) => (
  <div className="grid grid-cols-2 gap-3 mb-8">
    {cards.map((card, i) => {
      const color = CARD_COLORS[card.cardColor ?? 'blue']!
      return (
        <div key={i} className="bg-white border-2 border-swim-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[4px_1fr]">
            <div className={`${color.bar} self-stretch`} />
            <div className="p-3.5">
              <p className="font-syne text-[11px] font-bold uppercase tracking-[0.6px] text-deep mb-1">
                {card.title}
              </p>
              {card.text && <p className="text-[12px] text-ink-mid leading-snug">{card.text}</p>}
            </div>
          </div>
        </div>
      )
    })}
  </div>
)

// ── Bars list ────────────────────────────────────────────────────────────────
const PerkBars: React.FC<{ bars: PerkBar[]; onDark?: boolean }> = ({ bars, onDark }) => (
  <div className="flex flex-col gap-2 mb-8">
    {bars.map((bar, i) => (
      <div
        key={i}
        className={`text-base leading-snug pl-4 border-l-2 ${
          bar.highlighted
            ? onDark
              ? 'border-light text-white font-semibold'
              : 'border-mid text-ink font-semibold'
            : onDark
              ? 'border-white/20 text-white/80'
              : 'border-white/20 text-ink-mid'
        }`}
      >
        {bar.text}
      </div>
    ))}
  </div>
)
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
const ContentColumn: React.FC<{ col: Column; pairedMedia?: Column; onDark?: boolean }> = ({
  col,
  pairedMedia,
  onDark,
}) => {
  const links = col.links ?? []

  return (
    <div className="flex flex-col justify-center gap-0">
      {/* Sub-title / section label */}
      {col.subTitle && (
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-6 h-0.5 rounded-full ${onDark ? 'bg-light' : 'bg-mid'}`} />
          <span
            className={`text-[11px] font-bold uppercase tracking-[1.2px] ${onDark ? 'text-light' : 'text-mid'}`}
          >
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

      {/* Paired image — visible only on mobile, sits between richText and list */}
      {pairedMedia && (
        <div className="md:hidden mb-6">
          <MediaColumn col={pairedMedia} />
        </div>
      )}

      {/* Perks list */}
      {col.perksStyle === 'cards'
        ? (col.perkCards?.length ?? 0) > 0 && <PerkCards cards={col.perkCards!} />
        : col.perksStyle === 'bars'
          ? (col.perkBars?.length ?? 0) > 0 && <PerkBars bars={col.perkBars!} onDark={onDark} />
          : (col.perks?.length ?? 0) > 0 && <PerkIcons perks={col.perks!} />}

      {/* CTAs */}
      {links.length > 0 && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          {links.map((item, i) => (
            <CtaButton
              key={i}
              link={item.link as any}
              context={onDark ? 'dark' : 'light'}
              className="w-full sm:w-auto"
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Block ────────────────────────────────────────────────────────────────────
export const ContentBlock: React.FC<ContentBlockProps & { blockBackground?: string }> = ({
  columns,
  blockBackground,
}) => {
  if (!columns?.length) return null

  const onDark = blockBackground === 'brand'
  const cols = columns.slice(0, 2)
  const isSingle = cols.length === 1

  if (isSingle) {
    const col = cols[0]!
    return (
      <section className="container py-16 md:py-20">
        {col.useMedia ? <MediaColumn col={col} /> : <ContentColumn col={col} onDark={onDark} />}
      </section>
    )
  }

  const left = cols[0]!
  const right = cols[1]!

  return (
    <section className="container py-16 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className={left.useMedia ? 'hidden md:block' : undefined}>
          {left.useMedia ? (
            <MediaColumn col={left} />
          ) : (
            <ContentColumn
              col={left}
              pairedMedia={right.useMedia ? right : undefined}
              onDark={onDark}
            />
          )}
        </div>
        <div className={right.useMedia ? 'hidden md:block' : undefined}>
          {right.useMedia ? (
            <MediaColumn col={right} />
          ) : (
            <ContentColumn
              col={right}
              pairedMedia={left.useMedia ? left : undefined}
              onDark={onDark}
            />
          )}
        </div>
      </div>
    </section>
  )
}
