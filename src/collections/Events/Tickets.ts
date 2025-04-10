import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  labels: {
    plural: {
      en: 'Tickets',
      pt: 'Bilhetes',
    },
    singular: {
      en: 'Ticket',
      pt: 'Bilhete',
    },
  },
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
  },
  admin: {
    hidden: false,
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          localized: true,
          label: {
            en: 'Name',
            pt: 'Nome',
          },
          type: 'text',
          admin: {
            width: '20%',
          },
          required: true,
        },
        {
          name: 'price',
          label: {
            en: 'price',
            pt: 'Preço',
          },
          type: 'number',
          min: 0,
          admin: {
            width: '20%',
          },
          required: true,
        },
        {
          name: 'distance',
          label: {
            en: 'Distance (In meters)',
            pt: 'Distância (em metros)',
          },
          type: 'number',
          min: 0,
          max: 33000,
          admin: {
            width: '20%',
          },
          required: true,
        },
        {
          name: 'start',
          label: {
            en: 'Purchase start date',
            pt: 'Data de início de compra',
          },
          type: 'date',
          admin: {
            width: '20%',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
          required: true,
        },
        {
          name: 'end',
          label: {
            en: 'Purchase end date',
            pt: 'Data de término de compra',
          },
          type: 'date',
          admin: {
            width: '20%',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'eventFor',
          type: 'relationship',
          relationTo: 'events',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'canBePurchasedBy',
          label: {
            en: 'Can be purchased:',
            pt: 'Pode ser comprado por:',
          },
          type: 'relationship',
          relationTo: 'group-categories',
          hasMany: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
  ],
}
