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
      type: 'text',
      required: true,
    },
    {
      name: 'defaultValue',
      type: 'text',
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
