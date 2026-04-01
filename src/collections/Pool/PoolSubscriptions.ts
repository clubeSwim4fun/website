import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const PoolSubscriptions: CollectionConfig = {
  slug: 'pool-subscriptions',
  labels: {
    plural: {
      en: 'Pool Subscriptions',
      pt: 'Subscrições de Piscina',
    },
    singular: {
      en: 'Pool Subscription',
      pt: 'Subscrição de Piscina',
    },
  },
  access: {
    create: authenticated,
    read: isAdminOrSelf,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'athlete',
      label: {
        en: 'Athlete',
        pt: 'Atleta',
      },
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'cycle',
      label: {
        en: 'Pool Cycle',
        pt: 'Ciclo de Piscina',
      },
      type: 'relationship',
      relationTo: 'pool-cycles',
      required: true,
    },
    {
      name: 'status',
      label: {
        en: 'Status',
        pt: 'Estado',
      },
      type: 'select',
      options: [
        { label: { en: 'Active', pt: 'Ativo' }, value: 'active' },
        { label: { en: 'Waitlisted', pt: 'Em Lista de Espera' }, value: 'waitlisted' },
        { label: { en: 'Cancelled', pt: 'Cancelado' }, value: 'cancelled' },
      ],
      required: true,
    },
    {
      name: 'waitlistPosition',
      label: {
        en: 'Waitlist Position',
        pt: 'Posição na Lista de Espera',
      },
      type: 'number',
      required: false,
    },
    {
      name: 'paymentStatus',
      label: {
        en: 'Payment Status',
        pt: 'Estado do Pagamento',
      },
      type: 'select',
      options: [
        { label: { en: 'Paid', pt: 'Pago' }, value: 'paid' },
        { label: { en: 'Pending', pt: 'Pendente' }, value: 'pending' },
        { label: { en: 'Failed', pt: 'Falhado' }, value: 'failed' },
      ],
      required: true,
    },
    {
      name: 'stripePaymentIntentId',
      label: {
        en: 'Stripe Payment Intent ID',
        pt: 'ID do Pagamento Stripe',
      },
      type: 'text',
      required: false,
    },
  ],
}
