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
        { value: 'genders', label: { en: 'Gender', pt: 'Gênero' } },
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
                width: '50%',
              },
              label: 'Value',
              required: true,
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
      name: 'relatesTo',
      type: 'select',
      options: userCollectionFieldsName,
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
      options: [
        { label: { en: 'Step 1 — Account', pt: 'Passo 1 — Conta' }, value: '1' },
        { label: { en: 'Step 2 — Personal', pt: 'Passo 2 — Pessoal' }, value: '2' },
        { label: { en: 'Step 3 — Documents', pt: 'Passo 3 — Documentos' }, value: '3' },
        { label: { en: 'Step 4 — Preferences', pt: 'Passo 4 — Preferências' }, value: '4' },
      ],
    },
  ],
}
