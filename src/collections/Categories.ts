import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    plural: {
      en: 'Categories',
      pt: 'Categorias',
    },
    singular: {
      en: 'Category',
      pt: 'Categoria',
    },
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: {
        en: 'title',
        pt: 'título',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'color',
      label: {
        en: 'Event color',
        pt: 'Cor do evento',
      },
      type: 'select',
      options: [
        {
          label: 'Verde',
          value: '#B2E0B2',
        },
        {
          label: 'Azul',
          value: '#AEC6E4',
        },
        {
          label: 'Vermelho',
          value: '#FFD1DC',
        },
      ],
      defaultValue: '#AEC6E4',
    },
    ...slugField(),
  ],
}
