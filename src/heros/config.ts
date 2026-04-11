import type { Field } from 'payload'
import { heroLexical } from '@/fields/heroLexical'

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
      editor: heroLexical,
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
      label: {
        en: 'Call-to-action buttons',
        pt: 'Botões de ação',
      },
      maxRows: 3,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'link',
          type: 'group',
          admin: { hideGutter: true },
          fields: [
            // Link destination
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'radio',
                  defaultValue: 'custom',
                  admin: { layout: 'horizontal', width: '50%' },
                  options: [
                    { label: 'Internal link', value: 'reference' },
                    { label: 'Custom URL', value: 'custom' },
                  ],
                },
                {
                  name: 'newTab',
                  type: 'checkbox',
                  label: 'Open in new tab',
                  admin: { width: '50%', style: { alignSelf: 'flex-end' } },
                },
              ],
            },
            {
              name: 'reference',
              type: 'relationship',
              relationTo: ['pages', 'posts'],
              required: true,
              admin: {
                condition: (_, s) => s?.type === 'reference',
              },
              label: { en: 'Page', pt: 'Página' },
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: {
                condition: (_, s) => s?.type === 'custom',
              },
              label: { en: 'Custom URL', pt: 'URL personalizada' },
            },
            // Label + appearance
            {
              type: 'row',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  localized: true,
                  required: true,
                  label: { en: 'Label', pt: 'Rótulo' },
                  admin: { width: '50%' },
                },
                {
                  name: 'appearance',
                  type: 'select',
                  defaultValue: 'primary',
                  label: { en: 'Style', pt: 'Estilo' },
                  admin: { width: '50%' },
                  options: [
                    {
                      label: { en: 'Primary (white fill)', pt: 'Primário (fundo branco)' },
                      value: 'primary',
                    },
                    {
                      label: { en: 'Secondary (outline)', pt: 'Secundário (contorno)' },
                      value: 'secondary',
                    },
                  ],
                },
              ],
            },
            // Icon
            {
              type: 'row',
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  label: { en: 'Icon', pt: 'Ícone' },
                  admin: { width: '50%' },
                  options: [
                    { label: { en: 'None', pt: 'Nenhum' }, value: 'none' },
                    { label: { en: 'Arrow →', pt: 'Seta →' }, value: 'arrow' },
                    { label: { en: 'Calendar', pt: 'Calendário' }, value: 'calendar' },
                    { label: { en: 'Flag / Check', pt: 'Bandeira / Check' }, value: 'flag' },
                    { label: { en: 'User', pt: 'Utilizador' }, value: 'user' },
                    { label: { en: 'Star', pt: 'Estrela' }, value: 'star' },
                  ],
                },
                {
                  name: 'iconRight',
                  type: 'checkbox',
                  defaultValue: false,
                  label: { en: 'Icon on the right', pt: 'Ícone à direita' },
                  admin: { width: '50%', style: { alignSelf: 'flex-end' } },
                },
              ],
            },
          ],
        },
      ],
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
