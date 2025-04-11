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
