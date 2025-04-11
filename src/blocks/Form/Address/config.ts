import userCollectionFieldsName from '@/utilities/getUsersFields'
import { Block } from 'payload'

export const Address: Block = {
  slug: 'address',
  interfaceName: 'Address',
  fields: [
    {
      name: 'name',
      localized: true,
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
              name: 'streetLabel',
              localized: true,
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'streetSize',
              label: 'tamanho',
              type: 'select',
              defaultValue: 'full',
              admin: {
                width: '25%',
              },
              options: [
                { label: '100%', value: 'full' },
                { label: '50%', value: 'half' },
                { label: '1/3', value: 'one-third' },
              ],
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
              localized: true,
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'numberSize',
              label: 'tamanho',
              type: 'select',
              defaultValue: 'full',
              admin: {
                width: '25%',
              },
              options: [
                { label: '100%', value: 'full' },
                { label: '50%', value: 'half' },
                { label: '1/3', value: 'one-third' },
              ],
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
              localized: true,
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'stateSize',
              label: 'tamanho',
              type: 'select',
              defaultValue: 'full',
              admin: {
                width: '25%',
              },
              options: [
                { label: '100%', value: 'full' },
                { label: '50%', value: 'half' },
                { label: '1/3', value: 'one-third' },
              ],
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
              localized: true,
              type: 'text',
              required: false,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'zipSize',
              label: 'tamanho',
              type: 'select',
              defaultValue: 'full',
              admin: {
                width: '25%',
              },
              options: [
                { label: '100%', value: 'full' },
                { label: '50%', value: 'half' },
                { label: '1/3', value: 'one-third' },
              ],
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
