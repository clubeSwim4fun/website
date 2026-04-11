import type { Field } from 'payload'
import { richTextWithColor } from '@/fields/richTextWithColor'
import { ctaLinkFields } from '@/fields/ctaLink'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  label: false,
  fields: [
    // ── Layout variant ──────────────────────────────────────────────
    {
      name: 'type',
      type: 'select',
      label: {
        en: 'Layout',
        pt: 'Layout',
      },
      defaultValue: 'imageLeft',
      required: true,
      options: [
        { label: { en: 'Image on Left', pt: 'Imagem à Esquerda' }, value: 'imageLeft' },
        { label: { en: 'Image on Right', pt: 'Imagem à Direita' }, value: 'imageRight' },
        { label: { en: 'No Image (Centered)', pt: 'Sem Imagem (Centrado)' }, value: 'noImage' },
      ],
    },

    // ── Badge ───────────────────────────────────────────────────────
    {
      name: 'badge',
      type: 'text',
      localized: true,
      label: {
        en: 'Badge text',
        pt: 'Texto do badge',
      },
      admin: {
        description: {
          en: 'Small pill shown above the title (e.g. "Clube de Natação")',
          pt: 'Pequena etiqueta acima do título (ex: "Clube de Natação")',
        },
      },
    },

    // ── Rich text (title + description) ────────────────────────────
    {
      name: 'richText',
      type: 'richText',
      editor: richTextWithColor,
      label: {
        en: 'Content (title & description)',
        pt: 'Conteúdo (título e descrição)',
      },
      admin: {
        description: {
          en: 'Use Heading 1 for the title. Text coloured blue in the editor will render as the brand light-blue accent.',
          pt: 'Use Título 1 para o título. Texto colorido de azul no editor será renderizado como azul claro da marca.',
        },
      },
    },

    // ── CTAs ────────────────────────────────────────────────────────
    {
      name: 'links',
      type: 'array',
      label: { en: 'Call-to-action buttons', pt: 'Botões de ação' },
      maxRows: 3,
      admin: { initCollapsed: true },
      fields: ctaLinkFields,
    },

    // ── Stats ───────────────────────────────────────────────────────
    {
      name: 'stats',
      type: 'array',
      label: {
        en: 'Stats',
        pt: 'Estatísticas',
      },
      maxRows: 4,
      admin: {
        initCollapsed: true,
        description: {
          en: 'Up to 4 stats shown below the CTAs (e.g. "6 / Sessões/semana")',
          pt: 'Até 4 estatísticas abaixo dos botões (ex: "6 / Sessões/semana")',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              label: { en: 'Value', pt: 'Valor' },
              admin: { width: '50%' },
            },
            {
              name: 'label',
              type: 'text',
              localized: true,
              required: true,
              label: { en: 'Label', pt: 'Rótulo' },
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },

    // ── Media ───────────────────────────────────────────────────────
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Image', pt: 'Imagem' },
      admin: {
        condition: (_, { type } = {}) => type === 'imageLeft' || type === 'imageRight',
        description: {
          en: 'Required for Image Left / Image Right layouts.',
          pt: 'Obrigatório para os layouts Imagem à Esquerda / Imagem à Direita.',
        },
      },
    },
  ],
}
