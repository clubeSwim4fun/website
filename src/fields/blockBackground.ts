import type { Field } from 'payload'

export const blockBackgroundField: Field = {
  name: 'blockBackground',
  label: {
    en: 'Background',
    pt: 'Fundo',
  },
  type: 'select',
  defaultValue: 'transparent',
  options: [
    {
      label: { en: 'Transparent', pt: 'Transparente' },
      value: 'transparent',
    },
    {
      label: { en: 'Light Gray', pt: 'Cinza Claro' },
      value: 'fill',
    },
  ],
}
