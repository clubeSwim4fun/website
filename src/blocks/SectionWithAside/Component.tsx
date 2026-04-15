import React from 'react'
import type { SectionWithAsideBlock as SectionWithAsideBlockProps } from '@/payload-types'
import type { User } from '@/payload-types'
import RichText from '@/components/RichText'
import { CtaButton } from '@/components/CtaButton'
import { CheckCircle2 } from 'lucide-react'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { SectionWithAsideClient } from './Component.client'
import { shouldShowBlock } from '@/helpers/blockVisibilityHelper'

// ── Aside / Sidebar (server) ─────────────────────────────────────────────────
const Aside: React.FC<{ aside: SectionWithAsideBlockProps['aside']; user?: User }> = ({
  aside,
  user,
}) => {
  if (!aside) return null
  const { showPriceCard, priceLabel, priceAmount, pricePeriod, summaryItems, richText, links } =
    aside

  return (
    <aside className="flex flex-col gap-4">
      {showPriceCard && (
        <div className="bg-white rounded-2xl border border-swim-border shadow-sm overflow-hidden">
          <div className="bg-deep px-6 py-5 text-center">
            {priceLabel && (
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-1">
                {priceLabel}
              </p>
            )}
            {priceAmount != null && (
              <p className="font-syne font-extrabold text-white leading-none">
                <sup className="text-xl font-semibold align-super">€</sup>
                <span className="text-5xl">{priceAmount}</span>
              </p>
            )}
            {pricePeriod && <p className="text-xs text-white/50 mt-1.5">{pricePeriod}</p>}
          </div>

          {!!summaryItems?.length && (
            <div className="px-5 py-4">
              <p className="text-[11px] font-semibold text-ink-light uppercase tracking-wider mb-3">
                O que está incluído
              </p>
              <ul className="flex flex-col gap-1.5">
                {summaryItems.map((item, i) => (
                  <li key={item.id ?? i} className="flex items-center gap-2.5 text-sm text-ink">
                    <CheckCircle2 size={15} className="text-mid flex-shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!showPriceCard && !!summaryItems?.length && (
        <div className="bg-white rounded-2xl border border-swim-border shadow-sm px-5 py-4">
          <ul className="flex flex-col gap-1.5">
            {summaryItems.map((item, i) => (
              <li key={item.id ?? i} className="flex items-center gap-2.5 text-sm text-ink">
                <CheckCircle2 size={15} className="text-mid flex-shrink-0" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {richText && (
        <div className="bg-white rounded-2xl border border-swim-border shadow-sm p-5">
          <RichText data={richText} enableGutter={false} enableProse />
        </div>
      )}

      {!!links?.length && (
        <div className="flex flex-col gap-2">
          {links
            .filter((item) => shouldShowBlock((item as any).linkVisibility, user))
            .map((item, i) => (
              <CtaButton
                key={item.id ?? i}
                link={item.link}
                context="light"
                className="w-full justify-center"
              />
            ))}
        </div>
      )}
    </aside>
  )
}

// ── Main export (server component) ───────────────────────────────────────────
export const SectionWithAsideBlock: React.FC<SectionWithAsideBlockProps & { user?: User }> = ({
  navigation,
  mainContent,
  aside,
  user,
}) => {
  const steps = navigation?.steps ?? []

  // Pre-render each step's blocks server-side
  const stepPanels = steps.map((_, stepIndex) => {
    const stepNumber = stepIndex + 1
    const rows = (mainContent ?? []).filter((row) => row.step === stepNumber)
    const blocks = rows.flatMap((row) => row.blocks ?? [])

    return (
      <div key={stepIndex} data-step={stepIndex}>
        {blocks.length > 0 && <RenderBlocks blocks={blocks as any} noHero compact />}
      </div>
    )
  })

  // Tell the client shell which steps contain a stripe payment block
  const stripeSteps = steps.reduce<number[]>((acc, _, stepIndex) => {
    const stepNumber = stepIndex + 1
    const hasStripe = (mainContent ?? [])
      .filter((row) => row.step === stepNumber)
      .flatMap((row) => row.blocks ?? [])
      .some((b) => (b as any).blockType === 'stripePaymentBlock')
    if (hasStripe) acc.push(stepIndex)
    return acc
  }, [])

  return (
    <SectionWithAsideClient
      steps={steps}
      nextStepLabel={aside?.nextStepLabel ?? undefined}
      stripeSteps={stripeSteps}
      aside={<Aside aside={aside} user={user} />}
    >
      {stepPanels}
    </SectionWithAsideClient>
  )
}
