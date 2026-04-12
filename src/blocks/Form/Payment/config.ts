import { Block } from 'payload'

export const Payment: Block = {
  slug: 'stripePayment',
  interfaceName: 'StripePaymentField',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      defaultValue: 'payment',
      admin: {
        description: {
          en: 'Internal field name (must be unique within the form).',
          pt: 'Nome interno do campo (deve ser único no formulário).',
        },
      },
    },
    {
      name: 'label',
      type: 'text',
      localized: true,
      label: { en: 'Section label', pt: 'Título da secção' },
    },
    {
      name: 'amount',
      type: 'number',
      label: { en: 'Amount (EUR)', pt: 'Valor (EUR)' },
      required: true,
      min: 0.5,
      admin: {
        description: {
          en: 'Fixed payment amount in EUR.',
          pt: 'Valor fixo do pagamento em EUR.',
        },
      },
    },
    {
      name: 'description',
      type: 'text',
      localized: true,
      label: { en: 'Payment description', pt: 'Descrição do pagamento' },
      admin: {
        description: {
          en: 'Shown on the Stripe payment form and receipt.',
          pt: 'Mostrado no formulário de pagamento Stripe e no recibo.',
        },
      },
    },
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
  ],
}
