import type { Field } from 'payload'
import { richTextWithColor } from '@/fields/richTextWithColor'
import { ctaLinkFields } from '@/fields/ctaLink'
import { statsFields } from '@/fields/statsFields'

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
        { label: { en: 'None (hidden)', pt: 'Nenhum (oculto)' }, value: 'none' },
        { label: { en: 'Image on Left', pt: 'Imagem à Esquerda' }, value: 'imageLeft' },
        { label: { en: 'Image on Right', pt: 'Imagem à Direita' }, value: 'imageRight' },
        { label: { en: 'No Image (Centered)', pt: 'Sem Imagem (Centrado)' }, value: 'noImage' },
        {
          label: { en: 'Compact with Side Block', pt: 'Compacto com Bloco Lateral' },
          value: 'compact',
        },
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
        condition: (_, { type } = {}) => type !== 'none',
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
        condition: (_, { type } = {}) => type !== 'none',
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
      admin: { initCollapsed: true, condition: (_, { type } = {}) => type !== 'none' },
      fields: ctaLinkFields,
    },

    // ── Stats ───────────────────────────────────────────────────────
    statsFields({
      maxRows: 4,
      admin: {
        initCollapsed: true,
        condition: (_, { type } = {}) => type !== 'none',
        description: {
          en: 'Up to 4 stats shown below the CTAs (e.g. "6 / Sessões/semana")',
          pt: 'Até 4 estatísticas abaixo dos botões (ex: "6 / Sessões/semana")',
        },
      },
    }),

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

    // ── Floating image ──────────────────────────────────────────────
    {
      name: 'floatingImage',
      type: 'checkbox',
      label: { en: 'Floating image', pt: 'Imagem flutuante' },
      defaultValue: false,
      admin: {
        condition: (_, { type } = {}) => type === 'imageLeft' || type === 'imageRight',
        description: {
          en: 'Image sits at the bottom of the hero, cropped at the top with rounded top corners — no effect on mobile.',
          pt: 'A imagem fica na base do hero, cortada no topo com cantos superiores arredondados — sem efeito no mobile.',
        },
      },
    },

    // ── Compact Hero: Bottom Badges ─────────────────────────────────
    {
      name: 'bottomBadges',
      type: 'array',
      label: { en: 'Bottom Badges', pt: 'Badges Inferiores' },
      maxRows: 6,
      admin: {
        initCollapsed: true,
        condition: (_, { type } = {}) => type === 'compact',
        description: {
          en: 'Badges displayed at the bottom of the compact hero',
          pt: 'Badges exibidos na parte inferior do hero compacto',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'text',
              type: 'text',
              localized: true,
              required: true,
              label: { en: 'Text', pt: 'Texto' },
              admin: { width: '60%' },
            },
            {
              name: 'icon',
              type: 'select',
              label: { en: 'Icon', pt: 'Ícone' },
              admin: { width: '40%' },
              options: [
                { label: { en: 'Trophy', pt: 'Troféu' }, value: 'trophy' },
                { label: { en: 'Location', pt: 'Localização' }, value: 'location' },
                { label: { en: 'Euro', pt: 'Euro' }, value: 'euro' },
                { label: { en: 'Calendar', pt: 'Calendário' }, value: 'calendar' },
                { label: { en: 'Users', pt: 'Utilizadores' }, value: 'users' },
                { label: { en: 'Star', pt: 'Estrela' }, value: 'star' },
                { label: { en: 'Check', pt: 'Verificar' }, value: 'check' },
                { label: { en: 'Clock', pt: 'Relógio' }, value: 'clock' },
                { label: { en: 'Heart', pt: 'Coração' }, value: 'heart' },
                { label: { en: 'Shield', pt: 'Escudo' }, value: 'shield' },
                { label: { en: 'Waves', pt: 'Ondas' }, value: 'waves' },
                { label: { en: 'Swimming', pt: 'Natação' }, value: 'swimming' },
              ],
            },
          ],
        },
      ],
    },

    // ── Compact Hero: Side Block ────────────────────────────────────
    {
      name: 'sideBlock',
      type: 'group',
      label: { en: 'Side Block', pt: 'Bloco Lateral' },
      admin: {
        condition: (_, { type } = {}) => type === 'compact',
        description: {
          en: 'Content block displayed on the right side of the compact hero',
          pt: 'Bloco de conteúdo exibido no lado direito do hero compacto',
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: { en: 'Title', pt: 'Título' },
        },
        {
          name: 'price',
          type: 'text',
          label: { en: 'Price', pt: 'Preço' },
          admin: {
            description: {
              en: 'Main price display (e.g., "€15")',
              pt: 'Exibição do preço principal (ex: "€15")',
            },
          },
        },
        {
          name: 'priceLabel',
          type: 'text',
          localized: true,
          label: { en: 'Price Label', pt: 'Rótulo do Preço' },
          admin: {
            description: {
              en: 'Label below the price (e.g., "Joia de admissão")',
              pt: 'Rótulo abaixo do preço (ex: "Joia de admissão")',
            },
          },
        },
        {
          name: 'secondaryPrice',
          type: 'text',
          label: { en: 'Secondary Price', pt: 'Preço Secundário' },
          admin: {
            description: {
              en: 'Secondary price display (e.g., "€3/mês")',
              pt: 'Exibição do preço secundário (ex: "€3/mês")',
            },
          },
        },
        {
          name: 'secondaryPriceLabel',
          type: 'text',
          localized: true,
          label: { en: 'Secondary Price Label', pt: 'Rótulo do Preço Secundário' },
          admin: {
            description: {
              en: 'Label for secondary price (e.g., "quota mensal")',
              pt: 'Rótulo para o preço secundário (ex: "quota mensal")',
            },
          },
        },
      ],
    },
  ],
}
