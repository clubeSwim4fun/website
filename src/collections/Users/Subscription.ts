import { CollectionConfig } from 'payload'

export const Subscription: CollectionConfig = {
  slug: 'subscription',
  labels: {
    plural: {
      en: 'User-Subscriptions',
      pt: 'User-Subscrições',
    },
    singular: {
      en: 'User-Subscription',
      pt: 'User-Subscrição',
    },
  },
  admin: {
    defaultColumns: ['user', 'type', 'amount', 'startDate', 'endDate'],
    // hidden: true,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'type',
      type: 'select',
      options: ['memberFee', 'pool'],
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
    },
  ],
}
