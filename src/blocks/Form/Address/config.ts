import userCollectionFieldsName from '@/utilities/getUsersFields'
import { Block } from 'payload'

export const Address: Block = {
  slug: 'address',
  interfaceName: 'Address',
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
      name: 'relatesTo',
      type: 'select',
      options: userCollectionFieldsName,
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'street',
              type: 'text',
              required: false,
              defaultValue: 'street',
            },
            {
              name: 'streetLabel',
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'streetRequired',
              type: 'checkbox',
              admin: {
                style: {
                  justifyContent: 'end',
                },
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'numberLabel',
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'numberRequired',
              type: 'checkbox',
              admin: {
                style: {
                  justifyContent: 'end',
                },
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'stateLabel',
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'stateRequired',
              type: 'checkbox',
              admin: {
                style: {
                  justifyContent: 'end',
                },
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'zipcodeLabel',
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'zipRequired',
              type: 'checkbox',
              admin: {
                style: {
                  justifyContent: 'end',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
