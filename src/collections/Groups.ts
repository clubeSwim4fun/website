import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

export const Groups: CollectionConfig = {
  slug: 'groups',
  labels: {
    singular: {
      en: 'Group',
      pt: 'Grupo',
    },
    plural: {
      en: 'Groups',
      pt: 'Grupos',
    },
  },
  access: {
    admin: isAdmin,
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrEditor,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'createdAt'],
  },
  fields: [
    {
      name: 'title',
      localized: true,
      label: {
        en: 'Title',
        pt: 'Título',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'badge',
      label: {
        en: 'Badge',
        pt: 'Distintivo',
      },
      type: 'upload',
      relationTo: 'media',
    },
    ...slugField(),
  ],
}
