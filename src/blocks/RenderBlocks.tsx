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
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  user?: User
}> = (props) => {
  const { blocks, user } = props

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
                  <div className={`relative z-10 ${isFill || isBrand ? 'py-16' : 'my-16'}`}>
                    {/* @ts-expect-error there may be some mismatch between the expected types here */}
                    <Block {...block} disableInnerContainer blockBackground={bg} />
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
