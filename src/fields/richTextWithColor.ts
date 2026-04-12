/**
 * Shared Lexical editor config with TextStateFeature colour picker.
 * Used in Hero and Content blocks wherever coloured text is needed.
 */
import { Config } from 'payload'
import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  TextStateFeature,
  UnderlineFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const richTextWithColor: Config['editor'] = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    ParagraphFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({
      enabledCollections: ['pages', 'posts'],
      fields: ({ defaultFields }) => {
        const withoutUrl = defaultFields.filter((f) => !('name' in f && f.name === 'url'))
        return [
          ...withoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: { condition: ({ linkType }) => linkType !== 'internal' },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: (value: any, options: any) => {
              if (options?.siblingData?.linkType === 'internal') return true
              return value ? true : 'URL is required'
            },
          },
        ]
      },
    }),
    TextStateFeature({
      state: {
        color: {
          black: { css: { color: '#0f1f2e' }, label: 'Black (default)' },
          'brand-blue': { css: { color: '#3bb8d8' }, label: 'Brand Blue' },
          'deep-blue': { css: { color: '#0a4a6e' }, label: 'Deep Blue' },
          white: { css: { color: '#ffffff' }, label: 'White' },
          'white-muted': { css: { color: 'rgba(255,255,255,0.78)' }, label: 'White (muted)' },
        },
      },
    }),
  ],
})
