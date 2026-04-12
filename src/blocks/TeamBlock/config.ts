import type { Block } from 'payload'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'
import { blockBackgroundField } from '@/fields/blockBackground'
import { richTextWithColor } from '@/fields/richTextWithColor'

export const TeamBlock: Block = {
  slug: 'teamBlock',
  interfaceName: 'TeamBlock',
  labels: {
    singular: { en: 'Team / Board', pt: 'Equipa / Corpos Sociais' },
    plural: { en: 'Team Blocks', pt: 'Blocos de Equipa' },
  },
  fields: [
    blockVisibilityDynamicField,
    blockBackgroundField,
    {
      name: 'subtitle',
      type: 'text',
      localized: true,
      label: { en: 'Section label (above title)', pt: 'Rótulo de secção (acima do título)' },
      admin: {
        description: {
          en: 'Small label with decorative line, e.g. "Quem somos"',
          pt: 'Rótulo pequeno com linha decorativa, ex: "Quem somos"',
        },
      },
    },
    {
      name: 'richText',
      type: 'richText',
      localized: true,
      editor: richTextWithColor,
      label: { en: 'Title & intro text', pt: 'Título e texto introdutório' },
    },
    {
      name: 'sections',
      type: 'array',
      label: { en: 'Sections', pt: 'Secções' },
      minRows: 1,
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
          label: { en: 'Section title', pt: 'Título da secção' },
        },
        {
          name: 'members',
          type: 'array',
          label: { en: 'Members', pt: 'Membros' },
          minRows: 1,
          fields: [
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: { en: 'Photo', pt: 'Foto' },
            },
            {
              name: 'badge',
              type: 'text',
              localized: true,
              label: { en: 'Badge (e.g. role)', pt: 'Badge (ex: cargo)' },
              admin: {
                description: {
                  en: 'Leave empty to hide the badge',
                  pt: 'Deixe vazio para ocultar o badge',
                },
              },
            },
            {
              name: 'name',
              type: 'text',
              required: true,
              label: { en: 'Name', pt: 'Nome' },
            },
            {
              name: 'richText',
              type: 'richText',
              localized: true,
              editor: richTextWithColor,
              label: { en: 'Extended bio (rich text)', pt: 'Bio alargada (rich text)' },
            },
            {
              name: 'socialLinks',
              type: 'array',
              label: { en: 'Social media links', pt: 'Redes sociais' },
              maxRows: 6,
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  label: { en: 'Platform', pt: 'Plataforma' },
                  options: [
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'Twitter / X', value: 'twitter' },
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'Website', value: 'website' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: 'URL',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
