import type { Block, Field } from 'payload'
import { richTextWithColor } from '@/fields/richTextWithColor'
import { ctaLinkFields } from '@/fields/ctaLink'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'
import { blockBackgroundField } from '@/fields/blockBackground'
import { ICON_OPTIONS } from '@/fields/iconOptions'

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
    type: 'row',
    fields: [
      {
        name: 'subTitle',
        type: 'text',
        localized: true,
        label: { en: 'Sub-title / section label', pt: 'Sub-título / rótulo de secção' },
        admin: {
          condition: (_, s) => !s?.useMedia,
          width: '50%',
          description: {
            en: 'Small label shown above the title with a decorative line (e.g. "Associação")',
            pt: 'Rótulo pequeno acima do título com linha decorativa (ex: "Associação")',
          },
        },
      },
      {
        name: 'verticalAlign',
        type: 'select',
        defaultValue: 'center',
        label: { en: 'Vertical alignment', pt: 'Alinhamento vertical' },
        admin: {
          condition: (_, s) => !s?.useMedia,
          width: '50%',
        },
        options: [
          { label: { en: 'Top', pt: 'Topo' }, value: 'top' },
          { label: { en: 'Center (default)', pt: 'Centro (padrão)' }, value: 'center' },
          { label: { en: 'Bottom', pt: 'Fundo' }, value: 'bottom' },
        ],
      },
    ],
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
    type: 'row',
    fields: [
      {
        name: 'perksStyle',
        type: 'select',
        defaultValue: 'icons',
        label: { en: 'List style', pt: 'Estilo da lista' },
        admin: {
          condition: (_, s) => !s?.useMedia,
          width: '50%',
        },
        options: [
          { label: { en: 'Icons (default)', pt: 'Ícones (padrão)' }, value: 'icons' },
          { label: { en: 'Cards', pt: 'Cartões' }, value: 'cards' },
          { label: { en: 'Bars', pt: 'Barras' }, value: 'bars' },
        ],
      },
      {
        name: 'cardsPerRow',
        type: 'select',
        defaultValue: '2',
        label: { en: 'Cards per row', pt: 'Cartões por linha' },
        admin: {
          condition: (_, s) => !s?.useMedia && s?.perksStyle === 'cards',
          width: '50%',
        },
        options: [
          { label: { en: '2 (default)', pt: '2 (padrão)' }, value: '2' },
          { label: { en: '1 (full width)', pt: '1 (largura total)' }, value: '1' },
        ],
      },
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
            options: ICON_OPTIONS.filter((o) => (o as any).value !== 'none'),
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
              { label: { en: 'Green', pt: 'Verde' }, value: 'green' },
              { label: { en: 'Yellow / Amber', pt: 'Amarelo / Âmbar' }, value: 'amber' },
              { label: { en: 'Red / Coral', pt: 'Vermelho / Coral' }, value: 'coral' },
            ],
          },
          {
            name: 'cardIcon',
            type: 'select',
            label: { en: 'Icon', pt: 'Ícone' },
            admin: { width: '25%' },
            options: ICON_OPTIONS,
          },
          {
            name: 'title',
            type: 'text',
            localized: true,
            required: true,
            label: { en: 'Title', pt: 'Título' },
            admin: { width: '25%' },
          },
          {
            name: 'text',
            type: 'text',
            localized: true,
            label: { en: 'Description', pt: 'Descrição' },
            admin: { width: '25%' },
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
