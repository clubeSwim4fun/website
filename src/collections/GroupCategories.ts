import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

export const GroupCategories: CollectionConfig = {
  slug: 'group-categories',
  labels: {
    singular: {
      en: 'Subgroup',
      pt: 'Sub-grupo',
    },
    plural: {
      en: 'Subgroups',
      pt: 'Sub-grupos',
    },
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrEditor,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent'],
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
    ...slugField(),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'groups',
      label: {
        en: 'Parent group:',
        pt: 'Pertence ao grupo:',
      },
    },
  ],
}
