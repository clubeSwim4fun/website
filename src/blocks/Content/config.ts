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
    name: 'perks',
    type: 'array',
    label: { en: 'Feature list', pt: 'Lista de funcionalidades' },
    maxRows: 6,
    admin: {
      condition: (_, s) => !s?.useMedia,
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
            admin: { width: '33%' },
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
            admin: { width: '33%' },
          },
          {
            name: 'text',
            type: 'text',
            localized: true,
            label: { en: 'Description', pt: 'Descrição' },
            admin: { width: '33%' },
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
