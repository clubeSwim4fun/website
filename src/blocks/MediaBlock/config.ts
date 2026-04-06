import type { Block } from 'payload'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    blockVisibilityDynamicField,
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}
