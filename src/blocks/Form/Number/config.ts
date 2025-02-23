import userCollectionFieldsName from '@/utilities/getUsersFields'
import { Block } from 'payload'

export const Number: Block = {
  slug: 'number',
  interfaceName: 'Number',
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
      type: 'number',
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
