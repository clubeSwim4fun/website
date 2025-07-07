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
    {
      name: 'hasSubscription',
      label: {
        en: 'Has Subscription?',
        pt: 'Tem Assinatura?',
      },
      type: 'checkbox',
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
