import type { Block } from 'payload'
import { defaultLexical } from '@/fields/defaultLexical'
import { ctaLinkFields } from '@/fields/ctaLink'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { FormBlock } from '@/blocks/Form/config'
import { CalendarBlock } from '@/blocks/Calendar/config'
import { SponsorsBlock } from '@/blocks/SponsorsBlock/config'
import { TeamBlock } from '@/blocks/TeamBlock/config'
import { Banner } from '@/blocks/Banner/config'
import { StripePaymentBlock } from '@/blocks/StripePaymentBlock/config'
import { PaymentConfirmationBlock } from '@/blocks/PaymentConfirmationBlock/config'
import { CardBlock } from '@/blocks/CardBlock/config'

export const SectionWithAside: Block = {
  slug: 'sectionWithAside',
  interfaceName: 'SectionWithAsideBlock',
  labels: {
    singular: { en: 'Section with Aside', pt: 'Secção com Lateral' },
    plural: { en: 'Sections with Aside', pt: 'Secções com Lateral' },
  },
  fields: [
    blockVisibilityDynamicField,

    // ── 1. Navigation section ──────────────────────────────────────
    {
      name: 'navigation',
      type: 'group',
      label: { en: 'Navigation', pt: 'Navegação' },
      fields: [
        {
          name: 'steps',
          type: 'array',
          label: { en: 'Steps', pt: 'Passos' },
          minRows: 1,
          maxRows: 6,
          fields: [
            {
              name: 'label',
              type: 'text',
              localized: true,
              required: true,
              label: { en: 'Label', pt: 'Rótulo' },
            },
          ],
          admin: {
            description: {
              en: 'Step labels shown in the navigation bar (e.g. "Information", "Registration", "Confirmation")',
              pt: 'Rótulos dos passos na barra de navegação (ex: "Informação", "Inscrição", "Confirmação")',
            },
          },
        },
      ],
    },

    // ── 2. Main section ────────────────────────────────────────────
    {
      name: 'mainContent',
      type: 'array',
      label: { en: 'Main Content', pt: 'Conteúdo Principal' },
      admin: {
        initCollapsed: true,
        description: {
          en: 'Each row is linked to a navigation step and holds one or more blocks.',
          pt: 'Cada linha está ligada a um passo de navegação e contém um ou mais blocos.',
        },
      },
      fields: [
        {
          name: 'step',
          type: 'number',
          required: true,
          min: 1,
          label: { en: 'Navigation Step', pt: 'Passo de Navegação' },
          admin: {
            components: {
              Field: '@/blocks/SectionWithAside/StepSelectField#StepSelectField',
            },
            description: {
              en: 'Which step this content belongs to.',
              pt: 'A qual passo este conteúdo pertence.',
            },
          },
        },
        {
          name: 'blocks',
          type: 'blocks',
          label: { en: 'Blocks', pt: 'Blocos' },
          blocks: [
            CallToAction,
            Content,
            MediaBlock,
            Archive,
            FormBlock,
            CalendarBlock,
            SponsorsBlock,
            TeamBlock,
            Banner,
            StripePaymentBlock,
            PaymentConfirmationBlock,
            CardBlock,
          ],
          admin: {
            initCollapsed: true,
          },
        },
      ],
    },

    // ── 3. Aside section ───────────────────────────────────────────
    {
      name: 'aside',
      type: 'group',
      label: { en: 'Aside / Sidebar', pt: 'Lateral / Barra Lateral' },
      fields: [
        // Price calculation card
        {
          name: 'showPriceCard',
          type: 'checkbox',
          defaultValue: false,
          label: { en: 'Show price calculation card', pt: 'Mostrar cartão de preço' },
        },
        {
          name: 'priceLabel',
          type: 'text',
          localized: true,
          label: {
            en: 'Price label (e.g. "Registration")',
            pt: 'Rótulo do preço (ex: "Inscrição")',
          },
          admin: {
            condition: (_, s) => Boolean(s?.showPriceCard),
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'priceAmount',
              type: 'number',
              label: { en: 'Price (€)', pt: 'Preço (€)' },
              admin: {
                condition: (_, s) => Boolean(s?.showPriceCard),
                width: '50%',
                description: {
                  en: 'Numeric value in EUR (e.g. 30)',
                  pt: 'Valor numérico em EUR (ex: 30)',
                },
              },
            },
            {
              name: 'priceSubtitle',
              type: 'text',
              localized: true,
              label: {
                en: 'Price subtitle (e.g. "one-time fee")',
                pt: 'Subtítulo do preço (ex: "jóia única")',
              },
              admin: {
                condition: (_, s) => Boolean(s?.showPriceCard),
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'priceAmount2',
              type: 'number',
              label: { en: 'Second price (€)', pt: 'Segundo preço (€)' },
              admin: {
                condition: (_, s) => Boolean(s?.showPriceCard),
                width: '50%',
                description: {
                  en: 'Optional second price value (e.g. monthly fee)',
                  pt: 'Segundo valor opcional (ex: quota mensal)',
                },
              },
            },
            {
              name: 'priceSubtitle2',
              type: 'text',
              localized: true,
              label: {
                en: 'Second price subtitle (e.g. "per month")',
                pt: 'Subtítulo do segundo preço (ex: "por mês")',
              },
              admin: {
                condition: (_, s) => Boolean(s?.showPriceCard),
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'pricePeriod',
          type: 'text',
          localized: true,
          label: {
            en: 'Period label (e.g. "single payment · 2026 season")',
            pt: 'Rótulo do período',
          },
          admin: {
            condition: (_, s) => Boolean(s?.showPriceCard),
          },
        },
        // Summary list items
        {
          name: 'summaryItems',
          type: 'array',
          label: { en: 'Summary List Items', pt: 'Itens da Lista de Resumo' },
          fields: [
            {
              name: 'text',
              type: 'text',
              localized: true,
              required: true,
              label: { en: 'Item text', pt: 'Texto do item' },
            },
          ],
          admin: {
            description: {
              en: 'Checklist items shown below the price (e.g. "Access to 15 national races")',
              pt: 'Itens da lista mostrados abaixo do preço (ex: "Acesso a 15 provas nacionais")',
            },
          },
        },
        // Card blocks
        {
          name: 'cards',
          type: 'blocks',
          label: { en: 'Card Blocks', pt: 'Blocos de Cartão' },
          blocks: [CardBlock],
          admin: {
            initCollapsed: true,
            description: {
              en: 'Card blocks shown in the sidebar after summary items.',
              pt: 'Blocos de cartão mostrados na barra lateral após os itens de resumo.',
            },
          },
        },
        // Rich text
        {
          name: 'richText',
          type: 'richText',
          localized: true,
          editor: defaultLexical,
          label: { en: 'Additional content', pt: 'Conteúdo adicional' },
        },
        // CTA buttons
        {
          name: 'links',
          type: 'array',
          label: { en: 'Button Links', pt: 'Botões / Links' },
          fields: ctaLinkFields,
          admin: {
            initCollapsed: true,
            description: {
              en: 'Action buttons shown at the bottom of the sidebar.',
              pt: 'Botões de ação mostrados no fundo da barra lateral.',
            },
          },
        },
        // Next step button
        {
          name: 'nextStepLabel',
          type: 'text',
          localized: true,
          label: { en: 'Next step button label', pt: 'Rótulo do botão próximo passo' },
          admin: {
            description: {
              en: 'Text shown on the "next step" button. Hidden on the last step.',
              pt: 'Texto do botão de avançar para o próximo passo. Oculto no último passo.',
            },
          },
        },
      ],
    },
  ],
}
