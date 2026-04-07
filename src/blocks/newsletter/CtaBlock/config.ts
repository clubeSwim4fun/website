import type { Block } from 'payload'

export const NewsletterCtaBlock: Block = {
  slug: 'newsletterCta',
  interfaceName: 'NewsletterCtaBlock',
  labels: {
    singular: { en: 'Call to Action', pt: 'Chamada à Ação' },
    plural: { en: 'Calls to Action', pt: 'Chamadas à Ação' },
  },
  fields: [
    {
      name: 'title',
      label: { en: 'Title', pt: 'Título' },
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'text',
      label: { en: 'Text', pt: 'Texto' },
      type: 'textarea',
      localized: true,
    },
    {
      name: 'buttonLabel',
      label: { en: 'Button label', pt: 'Texto do botão' },
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'buttonUrl',
      label: { en: 'Button URL', pt: 'URL do botão' },
      type: 'text',
      required: true,
    },
    {
      name: 'buttonColor',
      label: { en: 'Button color', pt: 'Cor do botão' },
      type: 'select',
      defaultValue: 'blue',
      options: [
        { label: { en: 'Blue', pt: 'Azul' }, value: 'blue' },
        { label: { en: 'Green', pt: 'Verde' }, value: 'green' },
        { label: { en: 'Red', pt: 'Vermelho' }, value: 'red' },
      ],
    },
  ],
}
