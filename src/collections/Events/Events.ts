import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { slugField } from '@/fields/slug'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    plural: {
      en: 'Events',
      pt: 'Eventos',
    },
    singular: {
      en: 'Event',
      pt: 'Evento',
    },
  },
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
      label: {
        en: 'Event title',
        pt: 'Título do Evento',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: {
        en: 'Description',
        pt: 'Descrição',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'start',
      label: {
        en: 'Start date',
        pt: 'Data de inicio',
      },
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
      label: {
        en: 'End date',
        pt: 'Data de término',
      },
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
      label: {
        en: 'Event color',
        pt: 'Cor do evento',
      },
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
