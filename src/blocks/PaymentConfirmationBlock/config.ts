import type { Block } from 'payload'
import { defaultLexical } from '@/fields/defaultLexical'
import { ctaLinkFields } from '@/fields/ctaLink'

export const PaymentConfirmationBlock: Block = {
  slug: 'paymentConfirmationBlock',
  interfaceName: 'PaymentConfirmationBlock',
  labels: {
    singular: { en: 'Payment Confirmation', pt: 'Confirmação de Pagamento' },
    plural: { en: 'Payment Confirmations', pt: 'Confirmações de Pagamento' },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      label: { en: 'Title', pt: 'Título' },
      defaultValue: 'Inscrição Submetida!',
    },
    {
      name: 'message',
      type: 'richText',
      localized: true,
      editor: defaultLexical,
      label: { en: 'Message', pt: 'Mensagem' },
    },
    {
      name: 'links',
      type: 'array',
      label: { en: 'Action links', pt: 'Links de ação' },
      fields: ctaLinkFields,
      admin: { initCollapsed: true },
    },
  ],
}
