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
      localized: true,
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
        { label: { en: 'Blue (SwimRun)', pt: 'Azul (SwimRun)' }, value: 'mid' },
        { label: { en: 'Green (Pool)', pt: 'Verde (Piscina)' }, value: 'green-dark' },
        { label: { en: 'Amber (Open Water)', pt: 'Âmbar (Águas Abertas)' }, value: 'amber' },
        { label: { en: 'Coral (CNAA)', pt: 'Coral (CNAA)' }, value: 'coral' },
        { label: { en: 'Purple (Special)', pt: 'Roxo (Especial)' }, value: 'purple' },
        { label: { en: 'Deep Blue', pt: 'Azul Escuro' }, value: 'deep' },
        { label: { en: 'Light Blue', pt: 'Azul Claro' }, value: 'light' },
      ],
      defaultValue: 'mid',
    },
    ...slugField(),
  ],
}
