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
    ...slugField(),
  ],
}
