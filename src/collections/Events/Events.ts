import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { slugField } from '@/fields/slug'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: 'Título do Evento',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'text',
      required: true,
    },
    {
      name: 'start',
      label: 'Data de inicio',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      required: true,
    },
    {
      name: 'end',
      label: 'Data de término',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      required: true,
    },
    {
      name: 'backgroundColor',
      label: 'Cor do evento',
      type: 'select',
      options: [
        {
          label: 'Verde',
          value: '#B2E0B2', // TODO change to club colors
        },
        {
          label: 'Azul',
          value: '#AEC6E4', // TODO change to club colors
        },
        {
          label: 'Vermelho',
          value: '#FFD1DC', // TODO change to club colors
        },
      ],
      defaultValue: '#AEC6E4',
    },
    ...slugField(),
  ],
}
