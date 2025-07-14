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
    defaultColumns: ['user', 'type', 'amount', 'startDate', 'endDate', 'paymentStatus'],
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
    {
      name: 'sibsTransactionId',
      type: 'text',
      required: true,
    },
    {
      name: 'paymentStatus',
      type: 'select',
      options: [
        {
          label: {
            en: 'Pending',
            pt: 'Pendente',
          },
          value: 'pending',
        },
        { label: { en: 'Paid', pt: 'Pago' }, value: 'paid' },
        { label: { en: 'Failed', pt: 'Falhou' }, value: 'failed' },
      ],
      defaultValue: 'pending',
    },
  ],
}
