import type { Block, Field } from 'payload'
import { link } from '@/fields/link'
import { defaultLexical } from '@/fields/defaultLexical'

const columnFields: Field[] = [
  {
    name: 'size',
    label: {
      en: 'Size',
      pt: 'Tamanho',
    },
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: '1/3',
        value: 'oneThird',
      },
      {
        label: '1/2',
        value: 'half',
      },
      {
        label: '2/3',
        value: 'twoThirds',
      },
      {
        label: '100%',
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    localized: true,
    type: 'richText',
    editor: defaultLexical,
    label: false,
  },
  {
    name: 'enableLink',
    label: {
      en: 'Enable Link?',
      pt: 'Habilitar Link?',
    },
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_, { enableLink }) => Boolean(enableLink),
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
