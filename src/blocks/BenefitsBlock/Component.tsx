import React from 'react'
import type { BenefitsBlock as BenefitsBlockProps } from '@/payload-types'
import { BenefitsHeroCMS } from '@/components/Benefits/benefits-hero-cms'
import BenefitsAnchorNav from '@/components/Benefits/benefits-anchor-nav.client'
import { BenefitCard } from '@/components/Benefits/benefit-card'
import { PoolCardCMS } from '@/components/Benefits/pool-card-cms'
import { SwimGPCardCMS } from '@/components/Benefits/swimgp-card-cms'
import { BenefitsMobileBottomNav } from '@/components/Benefits/benefits-mobile-bottom-nav.client'
import { CopyButton } from '@/components/Benefits/copy-button.client'
import RichText from '@/components/RichText'
import { getTranslations } from 'next-intl/server'
import { getLocale } from 'next-intl/server'

type ColorVariant = 'blue' | 'green' | 'amber' | 'coral' | 'purple'

// ── Partner icons ─────────────────────────────────────────────────────────────
const svgProps = {
  viewBox: '0 0 24 24',
  width: 19,
  height: 19,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  'aria-hidden': true,
} as const

const PARTNER_ICONS: Record<string, React.ReactNode> = {
  circle: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  ),
  nutrition: (
    <svg {...svgProps}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  drop: (
    <svg {...svgProps}>
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
    </svg>
  ),
  heart: (
    <svg {...svgProps}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  waves: (
    <svg {...svgProps}>
      <path d="M2 12h20M2 17c3.3-3 6.7-3 10-3s6.7 0 10 3M2 7c3.3 3 6.7 3 10 3s6.7 0 10-3" />
    </svg>
  ),
  star: (
    <svg {...svgProps}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  bolt: (
    <svg {...svgProps}>
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  leaf: (
    <svg {...svgProps}>
      <path d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 0 0 1.38 1.38C8.55 18.9 14.9 16.8 17 8z" />
      <path d="M3 21l4-4" />
    </svg>
  ),
  shield: (
    <svg {...svgProps}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  tag: (
    <svg {...svgProps}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
}

const getPartnerIcon = (icon?: string | null) =>
  PARTNER_ICONS[icon ?? 'circle'] ?? PARTNER_ICONS.circle

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width={15}
    height={15}
    fill="none"
    stroke="#0e7ea8"
    strokeWidth={2}
    className="mt-[1px] shrink-0"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const SectionHeader = ({
  label,
  title,
  description,
}: {
  label?: string | null
  title?: string | null
  description?: string | null
}) => (
  <>
    {label && (
      <div className="mb-[14px] inline-flex items-center gap-[7px] text-[11px] font-bold uppercase tracking-[1.2px] text-[#0e7ea8] before:h-[2px] before:w-6 before:rounded-full before:bg-[#0e7ea8] before:content-['']">
        {label}
      </div>
    )}
    {title && (
      <h2 className="mb-1.5 font-['Outfit',sans-serif] text-[30px] font-extrabold leading-[1.15] text-[#0a4a6e]">
        {title}
      </h2>
    )}
    {description && (
      <p className="mb-7 max-w-[580px] text-[15px] leading-[1.65] text-[#3d5a70]">{description}</p>
    )}
  </>
)

export const BenefitsBlockComponent: React.FC<BenefitsBlockProps> = async (props) => {
  const { hero, infoBox, pool, nutrition, equipment, races } = props
  const locale = await getLocale()
  const t = await getTranslations('Benefits')

  const anchorLabels = {
    pool: t('anchor.pool'),
    nutrition: t('anchor.nutrition'),
    equipment: t('anchor.equipment'),
    races: t('anchor.races'),
  }

  return (
    <div className="min-h-screen bg-[#f8f4ef]">
      {/* Hero */}
      {hero && (
        <header>
          <BenefitsHeroCMS
            eyebrow={hero.eyebrow}
            title={hero.title}
            description={hero.description}
            stats={hero.stats}
          />
        </header>
      )}

      {/* Anchor nav */}
      <BenefitsAnchorNav labels={anchorLabels} ariaLabel={t('anchorNavAriaLabel')} />

      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        {/* Info box */}
        {infoBox?.content && (
          <div className="mb-5 flex gap-2.5 rounded-[10px] border border-[#3bb8d8] bg-[#e0f5fb] px-[18px] py-[14px] text-[13px] leading-[1.6] text-[#0a4a6e]">
            <LockIcon />
            <RichText
              data={infoBox.content}
              enableGutter={false}
              enableProse={false}
              className="[&_strong]:font-bold [&_p]:m-0"
            />
          </div>
        )}

        {/* Pool section */}
        {pool && (
          <section id="piscina" className="mb-[60px]">
            <SectionHeader
              label={pool.sectionLabel}
              title={pool.title}
              description={pool.description}
            />
            <PoolCardCMS pool={pool} locale={locale} />
          </section>
        )}

        {/* Nutrition section */}
        {nutrition && (
          <section id="nutricao" className="mb-[60px]">
            <SectionHeader
              label={nutrition.sectionLabel}
              title={nutrition.title}
              description={nutrition.description}
            />
            {nutrition.partners && nutrition.partners.length > 0 && (
              <div className="grid gap-5 md:grid-cols-3">
                {nutrition.partners.map((partner, i) => (
                  <BenefitCard
                    key={i}
                    color={(partner.color as ColorVariant) || 'blue'}
                    icon={getPartnerIcon(partner.icon)}
                    discount={partner.discount}
                    name={partner.name}
                    description={partner.description || ''}
                    codeLabel={t('codeLabel')}
                    codeValue={partner.code || ''}
                    href={partner.href}
                    visitLabel={t('visitLabel')}
                    variant="code"
                    copyButton={
                      partner.code ? (
                        <CopyButton
                          code={partner.code}
                          ariaLabel={t('copyAriaLabel')}
                          copiedLabel={t('copied')}
                        />
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Equipment section */}
        {equipment && (
          <section id="equipamentos" className="mb-[60px]">
            <SectionHeader
              label={equipment.sectionLabel}
              title={equipment.title}
              description={equipment.description}
            />
            {equipment.partners && equipment.partners.length > 0 && (
              <div className="grid gap-5 md:grid-cols-3">
                {equipment.partners.map((partner, i) => {
                  const isContact = partner.variant === 'contact'
                  return (
                    <BenefitCard
                      key={i}
                      color={(partner.color as ColorVariant) || 'blue'}
                      icon={getPartnerIcon(partner.icon)}
                      discount={partner.discount}
                      name={partner.name}
                      description={partner.description || ''}
                      codeLabel={isContact ? t('viaLabel') : t('codeLabel')}
                      codeValue={partner.codeOrContact || ''}
                      href={partner.href}
                      visitLabel={t('visitLabel')}
                      variant={isContact ? 'contact' : 'code'}
                      disclaimer={partner.disclaimer || undefined}
                      copyButton={
                        !isContact && partner.codeOrContact ? (
                          <CopyButton
                            code={partner.codeOrContact}
                            ariaLabel={t('copyAriaLabel')}
                            copiedLabel={t('copied')}
                          />
                        ) : undefined
                      }
                    />
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* Races section */}
        {races && (
          <section id="provas" className="mb-[60px]">
            <SectionHeader
              label={races.sectionLabel}
              title={races.title}
              description={races.description}
            />
            <SwimGPCardCMS
              races={races}
              teamCopyButton={
                races.teamCode ? (
                  <CopyButton
                    code={races.teamCode}
                    ariaLabel={t('copyAriaLabel')}
                    copiedLabel={t('copied')}
                    variant="dark"
                  />
                ) : undefined
              }
              promoCopyButton={
                races.promoCode ? (
                  <CopyButton
                    code={races.promoCode}
                    ariaLabel={t('copyAriaLabel')}
                    copiedLabel={t('copied')}
                    variant="dark"
                  />
                ) : undefined
              }
            />
          </section>
        )}
      </main>

      {/* Mobile bottom nav */}
      <BenefitsMobileBottomNav
        labels={{
          home: t('nav.home'),
          calendar: t('nav.calendar'),
          benefits: t('nav.benefits'),
          account: t('nav.account'),
        }}
        ariaLabel={t('bottomNavAriaLabel')}
        locale={locale}
      />
    </div>
  )
}
