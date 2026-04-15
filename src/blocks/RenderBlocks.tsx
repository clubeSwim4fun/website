import React, { Fragment } from 'react'

import type { Page, User } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { CalendarBlock } from './Calendar/Component'
import { SponsorsBlockComponent } from './SponsorsBlock/Component'
import { TeamBlockComponent } from './TeamBlock/Component'
import { SectionWithAsideBlock } from './SectionWithAside/Component'
import { StripePaymentBlockComponent } from './StripePaymentBlock/Component'
import { PaymentConfirmationBlockComponent } from './PaymentConfirmationBlock/Component'
import { CardBlockComponent } from './CardBlock/Component'
import { shouldShowBlock, type BlockVisibilityConfig } from '@/helpers/blockVisibilityHelper'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  calendarBlock: CalendarBlock,
  sponsorsBlock: SponsorsBlockComponent,
  teamBlock: TeamBlockComponent,
  sectionWithAside: SectionWithAsideBlock,
  stripePaymentBlock: StripePaymentBlockComponent,
  paymentConfirmationBlock: PaymentConfirmationBlockComponent,
  cardBlock: CardBlockComponent,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  user?: User
  noHero?: boolean
  compact?: boolean
}> = (props) => {
  const { blocks, user, noHero, compact } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              // Check if block should be visible based on visibility settings
              const blockVisibility = (block as any)?.blockVisibility as
                | BlockVisibilityConfig
                | undefined
              if (!shouldShowBlock(blockVisibility, user)) {
                return null
              }

              const bg = (block as any)?.blockBackground as string | undefined
              const isFill = bg === 'fill'
              const isBrand = bg === 'brand'

              // In compact mode (inside SectionWithAside) skip outer spacing/bg wrappers
              if (compact) {
                return (
                  <Fragment key={index}>
                    {/* @ts-expect-error Block components accept user and compact props */}
                    <Block {...block} user={user} compact />
                  </Fragment>
                )
              }

              return (
                <div
                  key={index}
                  className={
                    isBrand
                      ? 'relative bg-gradient-to-br from-deep to-mid overflow-hidden'
                      : isFill
                        ? 'bg-gray-100'
                        : ''
                  }
                >
                  {isBrand && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <defs>
                        <pattern
                          id="cross-bg"
                          x="0"
                          y="0"
                          width="60"
                          height="60"
                          patternUnits="userSpaceOnUse"
                        >
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
                      <rect width="100%" height="100%" fill="url(#cross-bg)" />
                    </svg>
                  )}
                  <div
                    className={`relative z-10 ${isFill || isBrand ? 'py-16' : 'my-16'} ${noHero && index === 0 ? '!pt-0 !mt-0' : ''}`}
                  >
                    {/* @ts-expect-error Block components accept user prop */}
                    <Block {...block} user={user} />
                  </div>
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
