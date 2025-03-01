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
