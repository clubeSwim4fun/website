import type { Block } from 'payload'
import { defaultLexical } from '@/fields/defaultLexical'

export const Banner: Block = {
  slug: 'banner',
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Informativo', value: 'info' },
        { label: 'Aviso', value: 'warning' },
        { label: 'Erro', value: 'error' },
        { label: 'Sucesso', value: 'success' },
      ],
      required: true,
    },
    {
      name: 'content',
      localized: true,
      type: 'richText',
      editor: defaultLexical,
      label: false,
      required: true,
    },
  ],
  interfaceName: 'BannerBlock',
}
