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

/**
 * Lexical editor config for the Hero rich text field.
 * Extends the default config with TextStateFeature so editors can
 * colour text — most importantly the brand light-blue accent (#3bb8d8).
 */
export const heroLexical: Config['editor'] = lexicalEditor({
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
          // Brand accent — renders as --light (#3bb8d8)
          'brand-blue': {
            css: { color: '#3bb8d8' },
            label: 'Brand Blue',
          },
          // Generic white for emphasis inside dark hero
          white: {
            css: { color: '#ffffff' },
            label: 'White',
          },
          // Muted white for body copy
          'white-muted': {
            css: { color: 'rgba(255,255,255,0.78)' },
            label: 'White (muted)',
          },
        },
      },
    }),
  ],
})
