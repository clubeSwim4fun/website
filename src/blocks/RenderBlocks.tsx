import React, { Fragment } from 'react'

import type { Page, User } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { CalendarBlock } from './Calendar/Component'
import { SponsorsBlockComponent } from './SponsorsBlock/Component'
import { shouldShowBlock, type BlockVisibilityConfig } from '@/helpers/blockVisibilityHelper'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  calendarBlock: CalendarBlock,
  sponsorsBlock: SponsorsBlockComponent,
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

              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
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
