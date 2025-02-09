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
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData.hasConfirmPassword,
      },
    },
    {
      name: 'errorPassword',
      label: 'Mensagem de erro de validação',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData.hasConfirmPassword,
      },
    },
  ],
}
