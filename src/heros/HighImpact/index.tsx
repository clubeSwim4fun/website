'use client'

import React from 'react'
import type { Page } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import Link from 'next/link'
import { ArrowRight, Calendar, Flag, User, Star } from 'lucide-react'
import { cn } from '@/utilities/ui'

// ── Icon map ────────────────────────────────────────────────────────────────
const ICONS = {
  arrow: <ArrowRight size={15} strokeWidth={2.5} />,
  calendar: <Calendar size={15} strokeWidth={2} />,
  flag: <Flag size={15} strokeWidth={2} />,
  user: <User size={15} strokeWidth={2} />,
  star: <Star size={15} strokeWidth={2} />,
  none: null,
} as const

// ── Cross-hatch background SVG (inline, matches design) ─────────────────────
const CrossPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <pattern id="cross" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <line
          x1="30"
          y1="24"
          x2="30"
          y2="36"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="24"
          y1="30"
          x2="36"
          y2="30"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#cross)" />
  </svg>
)

type HeroLink = NonNullable<Page['hero']['links']>[number]

// ── Resolve href from link ───────────────────────────────────────────────────
function resolveHref(link: HeroLink['link']): string {
  if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
    const slug = (link.reference.value as { slug?: string }).slug ?? ''
    return link.reference.relationTo === 'pages'
      ? `/${slug}`
      : `/${link.reference.relationTo}/${slug}`
  }
  return link.url ?? '#'
}

// ── CTA Button ───────────────────────────────────────────────────────────────
const HeroButton: React.FC<{ item: HeroLink }> = ({ item }) => {
  const { link } = item
  const href = resolveHref(link)
  const iconKey = (link.icon ?? 'none') as keyof typeof ICONS
  const icon = iconKey !== 'none' ? ICONS[iconKey] : null
  const isPrimary = !link.appearance || link.appearance === 'primary'

  return (
    <Link
      href={href}
      target={link.newTab ? '_blank' : undefined}
      rel={link.newTab ? 'noopener noreferrer' : undefined}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-syne font-bold text-sm transition-all duration-200 no-underline',
        isPrimary
          ? 'bg-white text-deep hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)]'
          : 'border border-white/35 text-white hover:bg-white/10 hover:border-white/60',
      )}
    >
      {icon && !link.iconRight && <span className="flex-shrink-0">{icon}</span>}
      {link.label}
      {icon && link.iconRight && <span className="flex-shrink-0">{icon}</span>}
    </Link>
  )
}

// ── Content pane ─────────────────────────────────────────────────────────────
const HeroContent: React.FC<{ hero: Page['hero']; centered?: boolean }> = ({ hero, centered }) => {
  const { badge, richText, links, stats } = hero

  return (
    <div
      className={cn(
        'relative z-10 flex flex-col',
        centered
          ? 'items-center text-center px-6 pt-12 pb-20 md:pt-16 md:pb-28 max-w-3xl mx-auto'
          : 'px-8 md:px-16 pt-12 pb-16 md:pt-16 md:pb-20',
      )}
    >
      {/* Badge */}
      {badge && (
        <div className="animate-fade-up-1 inline-flex items-center gap-2 self-start mb-6 bg-white/12 border border-white/20 rounded-full px-3.5 py-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-green flex-shrink-0" />
          <span className="text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">
            {badge}
          </span>
        </div>
      )}

      {/* Rich text — title + description */}
      {richText && (
        <div className="animate-fade-up-2 hero-richtext mb-8">
          <RichText
            data={richText}
            enableGutter={false}
            enableProse={false}
            className="hero-richtext-inner"
          />
        </div>
      )}

      {/* CTAs */}
      {Array.isArray(links) && links.length > 0 && (
        <div className="animate-fade-up-3 flex flex-wrap gap-3 mb-12">
          {links.map((item, i) => (
            <HeroButton key={i} item={item} />
          ))}
        </div>
      )}

      {/* Stats */}
      {Array.isArray(stats) && stats.length > 0 && (
        <div
          className={cn(
            'animate-fade-up-4 border-t border-white/15 pt-8 flex gap-8 flex-wrap',
            centered && 'justify-center',
          )}
        >
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="font-syne font-extrabold text-3xl text-white leading-none">
                {stat.value}
              </div>
              <div className="text-[12px] text-white/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export const HighImpactHero: React.FC<Page['hero']> = (hero) => {
  const { type, media } = hero
  const hasImage = (type === 'imageLeft' || type === 'imageRight') && media

  // No image — full-width centered
  if (type === 'noImage' || !hasImage) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-deep to-mid min-h-[calc(100vh-68px)] flex items-center justify-center">
        <CrossPattern />
        <HeroContent hero={hero} centered />
      </section>
    )
  }

  // Image left or right
  const imageOnRight = type === 'imageRight'

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-deep to-mid min-h-[calc(100vh-68px)] grid grid-cols-1 md:grid-cols-2">
      <CrossPattern />

      {/* Content — always rendered, order swaps via CSS */}
      <div
        className={cn(
          'relative z-10 flex items-center',
          imageOnRight ? 'md:order-1' : 'md:order-2',
        )}
      >
        <HeroContent hero={hero} />
      </div>

      {/* Image */}
      <div
        className={cn(
          'relative min-h-[320px] md:min-h-full overflow-hidden',
          imageOnRight ? 'md:order-2' : 'md:order-1',
        )}
      >
        {/* gradient overlay blending into the bg */}
        <div
          className={cn(
            'absolute inset-0 z-10 pointer-events-none',
            imageOnRight
              ? 'bg-gradient-to-l from-transparent to-deep/60'
              : 'bg-gradient-to-r from-transparent to-deep/60',
          )}
        />
        {typeof media === 'object' && media && (
          <Media
            fill
            imgClassName="object-cover opacity-70 saturate-[1.2]"
            priority
            resource={media}
          />
        )}
      </div>
    </section>
  )
}
