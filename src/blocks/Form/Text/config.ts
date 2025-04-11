import userCollectionFieldsName from '@/utilities/getUsersFields'
import { Block } from 'payload'

export const Text: Block = {
  slug: 'text',
  interfaceName: 'Text',
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
      name: 'defaultValue',
      type: 'text',
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
  ],
}
