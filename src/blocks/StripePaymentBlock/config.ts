import type { Block } from 'payload'

export const StripePaymentBlock: Block = {
  slug: 'stripePaymentBlock',
  interfaceName: 'StripePaymentBlock',
  labels: {
    singular: { en: 'Stripe Payment', pt: 'Pagamento Stripe' },
    plural: { en: 'Stripe Payments', pt: 'Pagamentos Stripe' },
  },
  fields: [
    {
      name: 'amount',
      type: 'number',
      required: true,
      label: { en: 'Amount (€)', pt: 'Valor (€)' },
      admin: {
        description: {
          en: 'Payment amount in EUR (e.g. 30 = €30.00)',
          pt: 'Valor do pagamento em EUR (ex: 30 = €30,00)',
        },
      },
    },
    {
      name: 'description',
      type: 'text',
      localized: true,
      label: { en: 'Payment description', pt: 'Descrição do pagamento' },
    },
    {
      name: 'metadata',
      type: 'array',
      label: { en: 'Stripe metadata', pt: 'Metadados Stripe' },
      admin: {
        description: {
          en: 'Key/value pairs sent to Stripe as PaymentIntent metadata (e.g. type, recordId).',
          pt: 'Pares chave/valor enviados ao Stripe como metadados do PaymentIntent.',
        },
        initCollapsed: true,
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
    // ── Invoice line items ─────────────────────────────────────────
    {
      name: 'assignToGroup',
      type: 'relationship',
      relationTo: ['groups', 'group-categories'] as const,
      label: {
        en: 'Assign user to group/subgroup on payment',
        pt: 'Atribuir utilizador a grupo/subgrupo após pagamento',
      },
      admin: {
        description: {
          en: 'When payment is confirmed, the user will be added to this group or subgroup.',
          pt: 'Quando o pagamento for confirmado, o utilizador será adicionado a este grupo ou subgrupo.',
        },
      },
    },
    // ── Invoice line items ─────────────────────────────────────────
    {
      name: 'invoiceLineItems',
      type: 'array',
      label: { en: 'Invoice line items', pt: 'Linhas da fatura' },
      admin: {
        initCollapsed: true,
        description: {
          en: 'Line items sent to InvoiceXpress. Leave empty to skip invoice creation.',
          pt: 'Linhas enviadas ao InvoiceXpress. Deixe vazio para não gerar fatura.',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              localized: true,
              required: true,
              label: { en: 'Name', pt: 'Nome' },
              admin: { width: '50%' },
            },
            {
              name: 'description',
              type: 'text',
              localized: true,
              label: { en: 'Description', pt: 'Descrição' },
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'unitPrice',
              type: 'number',
              required: true,
              label: { en: 'Unit price (€)', pt: 'Preço unitário (€)' },
              admin: { width: '50%' },
            },
            {
              name: 'quantity',
              type: 'number',
              required: true,
              defaultValue: 1,
              label: { en: 'Quantity', pt: 'Quantidade' },
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
  ],
}
