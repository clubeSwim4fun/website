import type { Block } from 'payload'
import { ICON_OPTIONS } from '@/fields/iconOptions'
import { richTextWithColor } from '@/fields/richTextWithColor'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'

export const CardBlock: Block = {
  slug: 'cardBlock',
  interfaceName: 'CardBlock',
  labels: {
    singular: { en: 'Card', pt: 'Cartão' },
    plural: { en: 'Cards', pt: 'Cartões' },
  },
  fields: [
    blockVisibilityDynamicField,

    // ── Header fields ──────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'cardColor',
          type: 'select',
          label: { en: 'Card Color', pt: 'Cor do Cartão' },
          defaultValue: 'blue',
          required: true,
          options: [
            { label: { en: 'Blue', pt: 'Azul' }, value: 'blue' },
            { label: { en: 'Green', pt: 'Verde' }, value: 'green' },
            { label: { en: 'Amber', pt: 'Âmbar' }, value: 'amber' },
            { label: { en: 'Coral', pt: 'Coral' }, value: 'coral' },
            { label: { en: 'Teal', pt: 'Verde-azulado' }, value: 'teal' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'icon',
          type: 'select',
          label: { en: 'Icon', pt: 'Ícone' },
          defaultValue: 'none',
          options: ICON_OPTIONS,
          admin: { width: '33%' },
        },
        {
          name: 'variant',
          type: 'select',
          label: { en: 'Variant', pt: 'Variante' },
          defaultValue: 'text',
          required: true,
          options: [
            { label: { en: 'Text (Rich Text)', pt: 'Texto (Rich Text)' }, value: 'text' },
            { label: { en: 'Stats', pt: 'Estatísticas' }, value: 'stats' },
            { label: { en: 'List', pt: 'Lista' }, value: 'list' },
            { label: { en: 'Image', pt: 'Imagem' }, value: 'image' },
            { label: { en: 'Form', pt: 'Formulário' }, value: 'form' },
            { label: { en: 'Payment', pt: 'Pagamento' }, value: 'payment' },
          ],
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      label: { en: 'Title', pt: 'Título' },
    },

    // ── Variant: text ──────────────────────────────────────────────
    {
      name: 'richText',
      type: 'richText',
      localized: true,
      editor: richTextWithColor,
      label: { en: 'Content', pt: 'Conteúdo' },
      admin: {
        condition: (_, s) => s?.variant === 'text',
      },
    },

    // ── Variant: stats ─────────────────────────────────────────────
    {
      name: 'stats',
      type: 'array',
      label: { en: 'Statistics', pt: 'Estatísticas' },
      minRows: 1,
      fields: [
        {
          name: 'number',
          type: 'text',
          localized: true,
          required: true,
          label: { en: 'Number / Value', pt: 'Número / Valor' },
        },
        {
          name: 'description',
          type: 'text',
          localized: true,
          required: true,
          label: { en: 'Description', pt: 'Descrição' },
        },
      ],
      admin: {
        condition: (_, s) => s?.variant === 'stats',
        description: {
          en: 'Stats are displayed 2 per row.',
          pt: 'As estatísticas são exibidas 2 por linha.',
        },
      },
    },

    // ── Variant: list ──────────────────────────────────────────────
    {
      name: 'listItems',
      type: 'array',
      label: { en: 'List Items', pt: 'Itens da Lista' },
      minRows: 1,
      fields: [
        {
          name: 'text',
          type: 'richText',
          localized: true,
          editor: richTextWithColor,
          required: true,
          label: { en: 'Text', pt: 'Texto' },
        },
      ],
      admin: {
        condition: (_, s) => s?.variant === 'list',
      },
    },

    // ── Variant: image ─────────────────────────────────────────────
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Image', pt: 'Imagem' },
      admin: {
        condition: (_, s) => s?.variant === 'image',
      },
    },

    // ── Variant: form ──────────────────────────────────────────────
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      label: { en: 'Form', pt: 'Formulário' },
      admin: {
        condition: (_, s) => s?.variant === 'form',
        description: {
          en: "The submit button is hidden — payment is handled by the form's payment field.",
          pt: 'O botão de submissão está oculto — o pagamento é tratado pelo campo de pagamento do formulário.',
        },
      },
    },

    // ── Variant: payment ───────────────────────────────────────────
    {
      type: 'row',
      admin: { condition: (_, s) => s?.variant === 'payment' },
      fields: [
        {
          name: 'paymentAmount',
          type: 'number',
          label: { en: 'Amount (€)', pt: 'Valor (€)' },
          min: 0.5,
          admin: {
            width: '50%',
            description: {
              en: 'Payment amount in EUR.',
              pt: 'Valor do pagamento em EUR.',
            },
          },
        },
        {
          name: 'paymentAssignToGroup',
          type: 'relationship',
          relationTo: ['groups', 'group-categories'] as const,
          label: {
            en: 'Assign user to group/subgroup on payment',
            pt: 'Atribuir utilizador a grupo/subgrupo após pagamento',
          },
          admin: {
            width: '50%',
            description: {
              en: 'User is added to this group when payment is confirmed.',
              pt: 'Utilizador é adicionado a este grupo quando o pagamento é confirmado.',
            },
          },
        },
      ],
    },
    {
      name: 'paymentDescription',
      type: 'text',
      localized: true,
      label: { en: 'Payment description', pt: 'Descrição do pagamento' },
      admin: {
        condition: (_, s) => s?.variant === 'payment',
      },
    },
    {
      name: 'paymentMetadata',
      type: 'array',
      label: { en: 'Stripe metadata', pt: 'Metadados Stripe' },
      admin: {
        condition: (_, s) => s?.variant === 'payment',
        initCollapsed: true,
        description: {
          en: 'Key/value pairs sent to Stripe as PaymentIntent metadata.',
          pt: 'Pares chave/valor enviados ao Stripe como metadados do PaymentIntent.',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'key',
              type: 'text',
              required: true,
              label: { en: 'Key', pt: 'Chave' },
              admin: { width: '50%' },
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              label: { en: 'Value', pt: 'Valor' },
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'paymentHideButton',
      type: 'checkbox',
      label: { en: 'Hide pay button', pt: 'Ocultar botão de pagamento' },
      defaultValue: false,
      admin: {
        condition: (_, s) => s?.variant === 'payment',
        description: {
          en: 'When checked, the pay button is not rendered (useful when an external trigger submits the payment).',
          pt: 'Quando marcado, o botão de pagamento não é exibido.',
        },
      },
    },
    {
      name: 'paymentSuccessMessage',
      type: 'richText',
      localized: true,
      label: { en: 'Success message', pt: 'Mensagem de sucesso' },
      admin: {
        condition: (_, s) => s?.variant === 'payment',
        description: {
          en: 'Shown after successful payment.',
          pt: 'Mostrado após pagamento bem-sucedido.',
        },
      },
    },

    // ── Downloads (all variants) ───────────────────────────────────
    {
      name: 'downloads',
      type: 'array',
      label: { en: 'Downloadable Files', pt: 'Ficheiros para Download' },
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: { en: 'File', pt: 'Ficheiro' },
        },
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
          en: 'Optional files shown as download buttons at the bottom of the card.',
          pt: 'Ficheiros opcionais mostrados como botões de download no fundo do cartão.',
        },
      },
    },
  ],
}
