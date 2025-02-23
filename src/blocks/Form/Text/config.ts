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
  ],
}
