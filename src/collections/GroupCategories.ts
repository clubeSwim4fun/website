import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

export const GroupCategories: CollectionConfig = {
  slug: 'group-categories',
  labels: {
    singular: 'Sub-grupo',
    plural: 'Sub-grupos',
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
      label: 'Nome',
      type: 'text',
      required: true,
    },
    ...slugField(),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'groups',
      label: 'Pertence à:',
    },
  ],
}
