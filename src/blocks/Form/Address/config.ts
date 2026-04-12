import userCollectionFieldsName from '@/utilities/getUsersFields'
import { Block } from 'payload'

export const Address: Block = {
  slug: 'address',
  interfaceName: 'Address',
  fields: [
    {
      name: 'name',
      localized: true,
      type: 'text',
      required: true,
    },
    {
      name: 'label',
      localized: true,
      type: 'text',
      required: true,
    },
    {
      name: 'relatesTo',
      type: 'select',
      options: userCollectionFieldsName,
      admin: {
        condition: (data) => Boolean(data?.isRegistrationForm),
      },
    },
    {
      name: 'prefillFromUser',
      label: { en: 'Prefill from user', pt: 'Pré-preencher do utilizador' },
      type: 'select',
      options: userCollectionFieldsName,
      admin: {
        condition: (data) => !data?.isRegistrationForm,
        description: {
          en: 'When a user is logged in, prefill this field with the selected user property.',
          pt: 'Quando um utilizador está autenticado, pré-preenche este campo com a propriedade selecionada.',
        },
      },
    },
    {
      name: 'readOnly',
      label: { en: 'Read only', pt: 'Apenas leitura' },
      type: 'checkbox',
      defaultValue: false,
      admin: {
        condition: (data) => !data?.isRegistrationForm,
        description: {
          en: 'Prevents the user from editing this field. Prefilled values cannot be changed.',
          pt: 'Impede o utilizador de editar este campo. Os valores pré-preenchidos não podem ser alterados.',
        },
      },
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'streetLabel',
              localized: true,
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'streetSize',
              label: 'tamanho',
              type: 'select',
              defaultValue: 'full',
              admin: {
                width: '25%',
              },
              options: [
                { label: '100%', value: 'full' },
                { label: '50%', value: 'half' },
                { label: '1/3', value: 'one-third' },
              ],
            },
            {
              name: 'streetRequired',
              type: 'checkbox',
              admin: {
                style: {
                  justifyContent: 'end',
                },
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'numberLabel',
              localized: true,
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'numberSize',
              label: 'tamanho',
              type: 'select',
              defaultValue: 'full',
              admin: {
                width: '25%',
              },
              options: [
                { label: '100%', value: 'full' },
                { label: '50%', value: 'half' },
                { label: '1/3', value: 'one-third' },
              ],
            },
            {
              name: 'numberRequired',
              type: 'checkbox',
              admin: {
                style: {
                  justifyContent: 'end',
                },
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'stateLabel',
              localized: true,
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'stateSize',
              label: 'tamanho',
              type: 'select',
              defaultValue: 'full',
              admin: {
                width: '25%',
              },
              options: [
                { label: '100%', value: 'full' },
                { label: '50%', value: 'half' },
                { label: '1/3', value: 'one-third' },
              ],
            },
            {
              name: 'stateRequired',
              type: 'checkbox',
              admin: {
                style: {
                  justifyContent: 'end',
                },
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'zipcodeLabel',
              localized: true,
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'zipSize',
              label: 'tamanho',
              type: 'select',
              defaultValue: 'full',
              admin: {
                width: '25%',
              },
              options: [
                { label: '100%', value: 'full' },
                { label: '50%', value: 'half' },
                { label: '1/3', value: 'one-third' },
              ],
            },
            {
              name: 'zipRequired',
              type: 'checkbox',
              admin: {
                style: {
                  justifyContent: 'end',
                },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'wizardStep',
      label: { en: 'Wizard Step', pt: 'Passo do Formulário' },
      type: 'select',
      defaultValue: '2',
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
