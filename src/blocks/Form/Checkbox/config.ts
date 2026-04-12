import userCollectionFieldsName from '@/utilities/getUsersFields'
import { Block } from 'payload'

export const Checkbox: Block = {
  slug: 'checkbox',
  interfaceName: 'Checkbox',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'label',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'defaultValue',
      type: 'checkbox',
    },
    {
      name: 'required',
      type: 'checkbox',
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
