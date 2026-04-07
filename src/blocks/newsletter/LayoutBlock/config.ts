import type { Block } from 'payload'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { NewsletterPostsBlock } from '@/blocks/newsletter/PostsBlock/config'
import { NewsletterCtaBlock } from '@/blocks/newsletter/CtaBlock/config'

export const NewsletterLayoutBlock: Block = {
  slug: 'newsletterLayout',
  interfaceName: 'NewsletterLayoutBlock',
  labels: {
    singular: { en: 'Columns', pt: 'Colunas' },
    plural: { en: 'Columns', pt: 'Colunas' },
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'size',
          label: { en: 'Width', pt: 'Largura' },
          type: 'select',
          defaultValue: 'half',
          options: [
            { label: '1/3', value: 'oneThird' },
            { label: '1/2', value: 'half' },
            { label: '2/3', value: 'twoThirds' },
            { label: '100%', value: 'full' },
          ],
        },
        {
          name: 'richText',
          label: false,
          type: 'richText',
          localized: true,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
              FixedToolbarFeature(),
              InlineToolbarFeature(),
              BlocksFeature({ blocks: [NewsletterPostsBlock, NewsletterCtaBlock] }),
            ],
          }),
        },
      ],
    },
  ],
}
