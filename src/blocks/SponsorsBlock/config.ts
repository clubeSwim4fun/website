import type { Block } from 'payload'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'

export const SponsorsBlock: Block = {
  slug: 'sponsorsBlock',
  interfaceName: 'SponsorsBlock',
  labels: {
    singular: { en: 'Sponsors', pt: 'Patrocinadores' },
    plural: { en: 'Sponsors Blocks', pt: 'Blocos de Patrocinadores' },
  },
  fields: [
    blockVisibilityDynamicField,
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: { en: 'Section Title', pt: 'Título da Secção' },
    },
    {
      name: 'sponsors',
      type: 'array',
      label: { en: 'Sponsors', pt: 'Patrocinadores' },
      minRows: 1,
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: { en: 'Logo', pt: 'Logótipo' },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          label: { en: 'Sponsor Name', pt: 'Nome do Patrocinador' },
        },
        {
          name: 'url',
          type: 'text',
          label: { en: 'Website URL', pt: 'URL do Website' },
        },
      ],
    },
  ],
}
