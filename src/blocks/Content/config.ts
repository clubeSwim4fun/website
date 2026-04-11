import type { Block, Field } from 'payload'
import { richTextWithColor } from '@/fields/richTextWithColor'
import { ctaLinkFields } from '@/fields/ctaLink'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'
import { blockBackgroundField } from '@/fields/blockBackground'

const columnFields: Field[] = [
  // ── Optional media ──────────────────────────────────────────────
  {
    name: 'useMedia',
    type: 'checkbox',
    defaultValue: false,
    label: { en: 'Use image instead of text', pt: 'Usar imagem em vez de texto' },
  },
  {
    name: 'media',
    type: 'upload',
    relationTo: 'media',
    label: { en: 'Image', pt: 'Imagem' },
    admin: {
      condition: (_, s) => Boolean(s?.useMedia),
    },
  },
  {
    name: 'mediaBadge',
    type: 'text',
    localized: true,
    label: { en: 'Image badge text', pt: 'Texto do badge da imagem' },
    admin: {
      condition: (_, s) => Boolean(s?.useMedia),
      description: {
        en: 'Optional green pill shown over the image. Leave empty to hide.',
        pt: 'Etiqueta verde opcional sobre a imagem. Deixe vazio para ocultar.',
      },
    },
  },

  // ── Text content (shown when useMedia is false) ─────────────────
  {
    name: 'subTitle',
    type: 'text',
    localized: true,
    label: { en: 'Sub-title / section label', pt: 'Sub-título / rótulo de secção' },
    admin: {
      condition: (_, s) => !s?.useMedia,
      description: {
        en: 'Small label shown above the title with a decorative line (e.g. "Associação")',
        pt: 'Rótulo pequeno acima do título com linha decorativa (ex: "Associação")',
      },
    },
  },
  {
    name: 'richText',
    type: 'richText',
    localized: true,
    editor: richTextWithColor,
    label: { en: 'Title & description', pt: 'Título e descrição' },
    admin: {
      condition: (_, s) => !s?.useMedia,
      description: {
        en: 'Use Heading 2 for the title. Coloured text (Brand Blue / Deep Blue) is supported.',
        pt: 'Use Título 2 para o título. Texto colorido (Azul Marca / Azul Profundo) é suportado.',
      },
    },
  },

  // ── Perks / feature list ────────────────────────────────────────
  {
    name: 'perksStyle',
    type: 'select',
    defaultValue: 'icons',
    label: { en: 'List style', pt: 'Estilo da lista' },
    admin: {
      condition: (_, s) => !s?.useMedia,
    },
    options: [
      { label: { en: 'Icons (default)', pt: 'Ícones (padrão)' }, value: 'icons' },
      { label: { en: 'Cards', pt: 'Cartões' }, value: 'cards' },
      { label: { en: 'Bars', pt: 'Barras' }, value: 'bars' },
    ],
  },
  // Icons variant
  {
    name: 'perks',
    type: 'array',
    label: { en: 'Feature list', pt: 'Lista de funcionalidades' },
    maxRows: 6,
    admin: {
      condition: (_, s) => !s?.useMedia && s?.perksStyle !== 'cards' && s?.perksStyle !== 'bars',
      initCollapsed: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'icon',
            type: 'select',
            label: { en: 'Icon', pt: 'Ícone' },
            admin: { width: '25%' },
            options: [
              { label: { en: 'People / Users', pt: 'Pessoas / Utilizadores' }, value: 'users' },
              { label: { en: 'Clock / Time', pt: 'Relógio / Tempo' }, value: 'clock' },
              { label: { en: 'Cloud / Upload', pt: 'Nuvem / Upload' }, value: 'cloud' },
              { label: { en: 'Star', pt: 'Estrela' }, value: 'star' },
              { label: { en: 'Flag / Check', pt: 'Bandeira / Check' }, value: 'flag' },
              { label: { en: 'Calendar', pt: 'Calendário' }, value: 'calendar' },
              { label: { en: 'Arrow', pt: 'Seta' }, value: 'arrow' },
              { label: { en: 'Heart', pt: 'Coração' }, value: 'heart' },
              { label: { en: 'Trophy', pt: 'Troféu' }, value: 'trophy' },
              { label: { en: 'Map Pin', pt: 'Localização' }, value: 'mapPin' },
            ],
          },
          {
            name: 'title',
            type: 'text',
            localized: true,
            required: true,
            label: { en: 'Title', pt: 'Título' },
            admin: { width: '37%' },
          },
          {
            name: 'text',
            type: 'text',
            localized: true,
            label: { en: 'Description', pt: 'Descrição' },
            admin: { width: '37%' },
          },
        ],
      },
    ],
  },
  // Cards variant
  {
    name: 'perkCards',
    type: 'array',
    label: { en: 'Cards list', pt: 'Lista de cartões' },
    maxRows: 6,
    admin: {
      condition: (_, s) => !s?.useMedia && s?.perksStyle === 'cards',
      initCollapsed: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'cardColor',
            type: 'select',
            defaultValue: 'blue',
            label: { en: 'Accent colour', pt: 'Cor de destaque' },
            admin: { width: '25%' },
            options: [
              { label: { en: 'Blue', pt: 'Azul' }, value: 'blue' },
              { label: { en: 'Yellow / Amber', pt: 'Amarelo / Âmbar' }, value: 'amber' },
              { label: { en: 'Red / Coral', pt: 'Vermelho / Coral' }, value: 'coral' },
            ],
          },
          {
            name: 'title',
            type: 'text',
            localized: true,
            required: true,
            label: { en: 'Title', pt: 'Título' },
            admin: { width: '37%' },
          },
          {
            name: 'text',
            type: 'text',
            localized: true,
            label: { en: 'Description', pt: 'Descrição' },
            admin: { width: '37%' },
          },
        ],
      },
    ],
  },

  // Bars variant
  {
    name: 'perkBars',
    type: 'array',
    label: { en: 'Bars list', pt: 'Lista de barras' },
    maxRows: 8,
    admin: {
      condition: (_, s) => !s?.useMedia && s?.perksStyle === 'bars',
      initCollapsed: true,
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
            admin: { width: '75%' },
          },
          {
            name: 'highlighted',
            type: 'checkbox',
            defaultValue: false,
            label: { en: 'Highlighted', pt: 'Destacado' },
            admin: { width: '25%', style: { alignSelf: 'flex-end' } },
          },
        ],
      },
    ],
  },

  // ── CTAs ────────────────────────────────────────────────────────
  {
    name: 'links',
    type: 'array',
    label: { en: 'Buttons', pt: 'Botões' },
    maxRows: 2,
    admin: {
      condition: (_, s) => !s?.useMedia,
      initCollapsed: true,
    },
    fields: ctaLinkFields,
  },
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    blockVisibilityDynamicField,
    blockBackgroundField,
    {
      name: 'columns',
      type: 'array',
      maxRows: 2,
      label: { en: 'Columns (max 2)', pt: 'Colunas (máx 2)' },
      admin: { initCollapsed: true },
      fields: columnFields,
    },
  ],
}
