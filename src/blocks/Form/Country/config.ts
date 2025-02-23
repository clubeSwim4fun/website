import userCollectionFieldsName from '@/utilities/getUsersFields'
import { Block } from 'payload'

export const Country: Block = {
  slug: 'country',
  interfaceName: 'Country',
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
