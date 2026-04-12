import type { Block } from 'payload'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'
import { blockBackgroundField } from '@/fields/blockBackground'
import { link } from '@/fields/link'

export const SponsorsBlock: Block = {
  slug: 'sponsorsBlock',
  interfaceName: 'SponsorsBlock',
  labels: {
    singular: { en: 'Sponsors', pt: 'Patrocinadores' },
    plural: { en: 'Sponsors Blocks', pt: 'Blocos de Patrocinadores' },
  },
  fields: [
    blockVisibilityDynamicField,
    blockBackgroundField,
    link({
      appearances: false,
      overrides: {
        name: 'ctaLink',
        required: false,
        label: { en: 'Become a Sponsor CTA', pt: 'CTA Tornar-se Patrocinador' },
        admin: {
          hideGutter: true,
          description: {
            en: 'Link for the "Become a sponsor" button below the marquee.',
            pt: 'Link para o botão "Tornar-se patrocinador" abaixo do marquee.',
          },
        },
      },
    }),
  ],
}
