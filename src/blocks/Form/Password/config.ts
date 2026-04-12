import type { Block } from 'payload'

export const Password: Block = {
  slug: 'password',
  interfaceName: 'Password',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            width: '50%',
          },
          required: true,
        },
        {
          name: 'label',
          localized: true,
          type: 'text',
          admin: {
            width: '50%',
          },
          required: true,
        },
      ],
    },
    {
      name: 'hasConfirmPassword',
      type: 'checkbox',
      admin: {
        width: '30%',
      },
    },
    {
      name: 'confirmLabel',
      localized: true,
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData.hasConfirmPassword,
      },
    },
    {
      name: 'errorPassword',
      localized: true,
      label: 'Mensagem de erro de validação',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData.hasConfirmPassword,
      },
    },
    {
      name: 'wizardStep',
      label: { en: 'Wizard Step', pt: 'Passo do Formulário' },
      type: 'select',
      defaultValue: '1',
      admin: {
        condition: (data) => Boolean(data?.isRegistrationForm),
      },
      options: [
        { label: { en: 'Step 1 — Account', pt: 'Passo 1 — Conta' }, value: '1' },
        { label: { en: 'Step 2 — Personal', pt: 'Passo 2 — Pessoal' }, value: '2' },
        { label: { en: 'Step 3 — Documents', pt: 'Passo 3 — Documentos' }, value: '3' },
        { label: { en: 'Step 4 — Preferences', pt: 'Passo 4 — Preferências' }, value: '4' },
      ],
    },
  ],
}
