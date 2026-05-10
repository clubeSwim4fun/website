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
    {
      name: 'hasSubscription',
      label: {
        en: 'Has Subscription?',
        pt: 'Tem Assinatura?',
      },
      type: 'checkbox',
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
          en: 'If checked, the ID assigned to users for this group is permanent (stored on the user record). If unchecked, the ID is seasonal and stored in Temporary Group IDs.',
          pt: 'Se marcado, o ID atribuído aos utilizadores para este grupo é permanente (guardado no registo do utilizador). Se não marcado, o ID é sazonal e guardado em IDs Temporários de Grupo.',
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
    {
      type: 'row',
      admin: {
        condition: (_, sibling) => sibling.hasSubscription,
      },
      fields: [
        {
          name: 'subscriptionPrice',
          label: {
            en: 'Subscription Price',
            pt: 'Preço da Assinatura',
          },
          type: 'number',
          required: true,
          min: 0,
          admin: {
            width: '25%',
          },
        },
        {
          name: 'subscriptionPeriod',
          label: {
            en: 'Subscription Period',
            pt: 'Período da Assinatura',
          },
          type: 'select',
          options: [
            {
              label: {
                en: 'Monthly',
                pt: 'Mensal',
              },
              value: 'monthly',
            },
            {
              label: {
                en: 'Yearly',
                pt: 'Anual',
              },
              value: 'yearly',
            },
          ],
          required: true,
          defaultValue: 'yearly',
          admin: {
            width: '25%',
          },
        },
        {
          name: 'subscriptionForm',
          label: {
            en: 'Subscription Form',
            pt: 'Formulário de Assinatura',
          },
          type: 'relationship',
          relationTo: 'forms',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    ...slugField(),
  ],
}
