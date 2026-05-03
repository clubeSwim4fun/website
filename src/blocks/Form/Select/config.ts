import userCollectionFieldsName from '@/utilities/getUsersFields'
import { Block } from 'payload'

export const Select: Block = {
  slug: 'select',
  interfaceName: 'Select',
  fields: [
    {
      name: 'name',
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
      name: 'type',
      type: 'radio',
      defaultValue: 'default',
      options: [
        {
          label: {
            en: 'Default',
            pt: 'Padrão',
          },
          value: 'default',
        },
        {
          label: {
            en: 'Relates to Global Config',
            pt: 'Relacionado ao Configuração Global',
          },
          value: 'globalConfig',
        },
      ],
    },
    {
      name: 'globalConfigCollection',
      type: 'select',
      options: [
        { value: 'disabilities', label: { en: 'Disability', pt: 'Deficiência' } },
        { value: 'aboutClub', label: { en: 'Heard About Club', pt: 'Soube do Clube' } },
      ],
      admin: {
        condition: (_, siblingData) => siblingData.type === 'globalConfig',
      },
    },
    {
      name: 'defaultValue',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData.type === 'default',
      },
    },
    {
      name: 'options',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              admin: {
                width: '50%',
              },
              label: 'Label',
              localized: true,
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              admin: {
                width: '25%',
              },
              label: 'Value',
              required: true,
            },
            {
              name: 'price',
              type: 'number',
              label: { en: 'Price (€)', pt: 'Preço (€)' },
              admin: {
                width: '25%',
                description: {
                  en: 'Stripe amount for this option (used when "payment selector" is enabled).',
                  pt: 'Valor Stripe para esta opção (usado quando "seletor de pagamento" está ativo).',
                },
              },
            },
          ],
        },
      ],
      label: 'Select Attribute Options',
      labels: {
        plural: 'Options',
        singular: 'Option',
      },
      admin: {
        condition: (_, siblingData) => siblingData.type === 'default',
      },
    },
    {
      name: 'required',
      type: 'checkbox',
    },
    {
      name: 'isPaymentSelector',
      label: {
        en: 'Use as payment amount selector',
        pt: 'Usar como seletor de valor de pagamento',
      },
      type: 'checkbox',
      defaultValue: false,
      admin: {
        condition: (_, siblingData) => siblingData.type === 'default',
        description: {
          en: "When enabled, the selected option's value (numeric) is used as the Stripe payment amount and its label as the description.",
          pt: 'Quando ativado, o valor numérico da opção selecionada é usado como valor de pagamento Stripe e o rótulo como descrição.',
        },
      },
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
      name: 'size',
      label: 'tamanho',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: '100%', value: 'full' },
        { label: '50%', value: 'half' },
        { label: '1/3', value: 'one-third' },
      ],
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
