'use client'

import React from 'react'
import type { Page, User } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText/HeroRichText'
import { CtaButton } from '@/components/CtaButton'
import { cn } from '@/utilities/ui'
import { shouldShowBlock } from '@/helpers/blockVisibilityHelper'
import { HeroIcon, type HeroIconType } from '@/components/Icons/HeroIcons'
import { StatsList } from '@/components/StatsList'

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

// ── CTA Button ───────────────────────────────────────────────────────────────
const HeroButton: React.FC<{ item: HeroLink }> = ({ item }) => (
  <CtaButton link={item.link as any} context="dark" />
)

// ── Content pane ─────────────────────────────────────────────────────────────
const HeroContent: React.FC<{ hero: Page['hero']; centered?: boolean; user?: User }> = ({
  hero,
  centered,
  user,
}) => {
  const { badge, richText, links, stats } = hero
  const visibleLinks = (links ?? []).filter((item) =>
    shouldShowBlock((item as any).linkVisibility, user),
  )

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
      {Array.isArray(links) && visibleLinks.length > 0 && (
        <div className="animate-fade-up-3 flex flex-wrap gap-3 mb-12">
          {visibleLinks.map((item, i) => (
            <HeroButton key={i} item={item} />
          ))}
        </div>
      )}

      {/* Stats */}
      {Array.isArray(stats) && stats.length > 0 && (
        <StatsList
          stats={stats as any}
          variant="hero-dark"
          className={cn(
            'animate-fade-up-4 border-t border-white/15 pt-8',
            centered && 'justify-center',
          )}
        />
      )}
    </div>
  )
}

// ── Compact Hero Content ─────────────────────────────────────────────────────
const CompactHeroContent: React.FC<{ hero: Page['hero']; user?: User }> = ({ hero, user }) => {
  const { badge, richText, links, bottomBadges, sideBlock } = hero
  const visibleLinks = (links ?? []).filter((item) =>
    shouldShowBlock((item as any).linkVisibility, user),
  )

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-deep to-mid">
      <CrossPattern />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Badge */}
            {badge && (
              <div className="animate-fade-up-1 inline-flex items-center gap-2 mb-6 bg-white/12 border border-white/20 rounded-full px-3.5 py-1.5">
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
            {Array.isArray(links) && visibleLinks.length > 0 && (
              <div className="animate-fade-up-3 flex flex-wrap gap-3 mb-8">
                {visibleLinks.map((item, i) => (
                  <HeroButton key={i} item={item} />
                ))}
              </div>
            )}

            {/* Bottom Badges */}
            {Array.isArray(bottomBadges) && bottomBadges.length > 0 && (
              <div className="animate-fade-up-4 flex flex-wrap gap-3">
                {bottomBadges.map((badge, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2"
                  >
                    {badge.icon && (
                      <HeroIcon type={badge.icon as HeroIconType} className="text-sm" />
                    )}
                    <span className="text-sm font-medium text-white/90">{badge.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side Block */}
          {sideBlock && (
            <div className="animate-fade-up-3 lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                {sideBlock.title && (
                  <div className="text-sm font-medium text-white/70 mb-2 uppercase tracking-wide">
                    {sideBlock.title}
                  </div>
                )}

                {sideBlock.price && (
                  <div className="mb-4">
                    <div className="text-4xl md:text-5xl font-outfit font-extrabold text-white leading-none">
                      {sideBlock.price}
                    </div>
                    {sideBlock.priceLabel && (
                      <div className="text-sm text-white/60 mt-1">{sideBlock.priceLabel}</div>
                    )}
                  </div>
                )}

                {sideBlock.secondaryPrice && (
                  <div className="border-t border-white/15 pt-4">
                    <div className="text-2xl font-outfit font-bold text-white/90">
                      {sideBlock.secondaryPrice}
                    </div>
                    {sideBlock.secondaryPriceLabel && (
                      <div className="text-xs text-white/60 mt-1">
                        {sideBlock.secondaryPriceLabel}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export const HighImpactHero: React.FC<Page['hero'] & { user?: User }> = (hero) => {
  const { type, media, floatingImage, user } = hero as Page['hero'] & { user?: User }
  const hasImage = (type === 'imageLeft' || type === 'imageRight') && media

  // Compact hero with side block
  if (type === 'compact') {
    return <CompactHeroContent hero={hero} user={user} />
  }

  // No image — full-width centered
  if (type === 'noImage' || !hasImage) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-deep to-mid min-h-[calc(100vh-52px)] md:min-h-[calc(100vh-68px)] flex items-center justify-center">
        <CrossPattern />
        <HeroContent hero={hero} centered user={user} />
      </section>
    )
  }

  const imageOnRight = type === 'imageRight'

  // Floating image layout — image anchored to bottom with rounded top corners
  if (floatingImage) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-deep to-mid grid grid-cols-1 md:grid-cols-2 md:items-end">
        <CrossPattern />

        {/* Content */}
        <div
          className={cn(
            'relative z-10 flex items-center order-2',
            imageOnRight ? 'md:order-1' : 'md:order-2',
          )}
        >
          <HeroContent hero={hero} user={user} />
        </div>

        {/* Floating image — full width on mobile (normal), anchored bottom on desktop */}
        <div
          className={cn(
            'relative order-1 min-h-[280px] md:min-h-0',
            imageOnRight ? 'md:order-2' : 'md:order-1',
          )}
        >
          {/* Mobile: full bleed image */}
          <div className="relative w-full h-[280px] md:hidden">
            {typeof media === 'object' && media && (
              <Media
                fill
                imgClassName="object-cover opacity-70 saturate-[1.2]"
                priority
                resource={media}
              />
            )}
          </div>

          {/* Desktop: floating image anchored to bottom */}
          {typeof media === 'object' && media && (
            <div className="hidden md:block ml-4 mr-16 rounded-t-[20px] overflow-hidden h-[340px] relative">
              <Media
                fill
                imgClassName="object-cover object-top saturate-[1.2]"
                priority
                resource={media}
              />
            </div>
          )}
        </div>
      </section>
    )
  }

  // Default: image left or right (full bleed)
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-deep to-mid min-h-[calc(100vh-52px)] md:min-h-[calc(100vh-68px)] grid grid-cols-1 md:grid-cols-2">
      <CrossPattern />

      {/* Content — always second on mobile (below image), order swaps on desktop */}
      <div
        className={cn(
          'relative z-10 flex items-center order-2',
          imageOnRight ? 'md:order-1' : 'md:order-2',
        )}
      >
        <HeroContent hero={hero} user={user} />
      </div>

      {/* Image — always first on mobile (top), position swaps on desktop */}
      <div
        className={cn('relative min-h-[320px] order-1', imageOnRight ? 'md:order-2' : 'md:order-1')}
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
