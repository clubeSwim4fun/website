import userCollectionFieldsName from '@/utilities/getUsersFields'
import { Block } from 'payload'

export const DatePicker: Block = {
  slug: 'datePicker',
  interfaceName: 'DateField',
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
      name: 'placeholder',
      type: 'text',
      required: true,
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
