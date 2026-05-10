import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { authenticated } from '@/access/authenticated'

export const TemporaryGroupId: CollectionConfig = {
  slug: 'temporary-group-ids',
  labels: {
    singular: { en: 'Temporary Group ID', pt: 'ID Temporário de Grupo' },
    plural: { en: 'Temporary Group IDs', pt: 'IDs Temporários de Grupo' },
  },
  access: {
    create: isAdmin,
    read: authenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'number',
    defaultColumns: ['user', 'group', 'season', 'number', 'createdAt'],
    hidden: true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          label: { en: 'User', pt: 'Utilizador' },
          admin: { width: '33%' },
        },
        {
          name: 'group',
          type: 'relationship',
          relationTo: ['groups', 'group-categories'] as const,
          required: true,
          label: { en: 'Group', pt: 'Grupo' },
          admin: { width: '33%' },
        },
        {
          name: 'season',
          type: 'text',
          required: true,
          label: { en: 'Season', pt: 'Temporada' },
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'number',
      type: 'text',
      required: true,
      label: { en: 'ID Number', pt: 'Número de ID' },
    },
  ],
  timestamps: true,
}
