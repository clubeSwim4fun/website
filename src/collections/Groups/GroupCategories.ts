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
    group: {
      pt: 'Configurações Gerais',
      en: 'General Configs',
    },
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
      name: 'badge',
      label: {
        en: 'Badge',
        pt: 'Distintivo',
      },
      type: 'upload',
      relationTo: 'media',
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
    {
      name: 'isPermanentId',
      label: {
        en: 'Has Permanent ID?',
        pt: 'Tem ID Permanente?',
      },
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: {
          en: 'If checked, the ID assigned to users for this subgroup is permanent (stored on the user record). If unchecked, the ID is seasonal and stored in Temporary Group IDs.',
          pt: 'Se marcado, o ID atribuído aos utilizadores para este sub-grupo é permanente (guardado no registo do utilizador). Se não marcado, o ID é sazonal e guardado em IDs Temporários de Grupo.',
        },
      },
    },
    {
      name: 'userField',
      label: {
        en: 'User Field (for permanent ID)',
        pt: 'Campo do Utilizador (para ID permanente)',
      },
      type: 'select',
      options: [
        {
          label: { en: 'Federation ID (federationId)', pt: 'ID da Federação (federationId)' },
          value: 'federationId',
        },
        {
          label: { en: 'Associate ID (associateId)', pt: 'ID de Sócio (associateId)' },
          value: 'associateId',
        },
      ],
      admin: {
        condition: (_, sibling) => sibling.isPermanentId,
        description: {
          en: 'The field on the User record where this permanent ID will be stored.',
          pt: 'O campo no registo do Utilizador onde este ID permanente será guardado.',
        },
      },
    },
  ],
}
