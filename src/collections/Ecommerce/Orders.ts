import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    plural: {
      en: 'Purchase orders',
      pt: 'Pedidos de compras',
    },
    singular: {
      en: 'Purchase order',
      pt: 'Pedido de compra',
    },
  },
  access: {
    admin: isAdminOrEditor,
    create: authenticated,
    delete: isAdmin,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'user',
      label: {
        en: 'User',
        pt: 'Utilizador',
      },
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        allowEdit: false,
      },
    },
    {
      name: 'events',
      label: {
        en: 'Events',
        pt: 'Eventos',
      },
      type: 'array',
      fields: [
        {
          name: 'event',
          label: {
            en: 'Event',
            pt: 'Evento',
          },
          type: 'relationship',
          relationTo: 'events',
          admin: {
            readOnly: true,
            width: '50%',
          },
        },
        {
          name: 'tickets',
          label: {
            en: 'Tickets',
            pt: 'Bilhetes',
          },
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'ticket',
                  label: {
                    en: 'Ticket',
                    pt: 'Bilhete',
                  },
                  type: 'relationship',
                  relationTo: 'tickets',
                  required: true,
                  hasMany: false,
                  admin: {
                    readOnly: true,
                    width: '25%',
                  },
                },
                {
                  name: 'tshirtSize',
                  label: {
                    en: 'T-Shirt Size',
                    pt: 'Tamanho T-Shirt',
                  },
                  type: 'text',
                  admin: {
                    readOnly: true,
                    width: '25%',
                    condition: (_, siblingData) => {
                      return !!siblingData?.tshirtSize
                    },
                  },
                },
                {
                  name: 'ticketPurchased',
                  label: {
                    en: 'Ticket purchased?',
                    pt: 'Bilhete comprado?',
                  },
                  type: 'checkbox',
                  admin: {
                    width: '25%',
                    readOnly: false,
                    condition: (data) => data?.paymentStatus === 'paid',
                  },
                },
                {
                  name: 'eventPurchaseId',
                  label: {
                    en: 'Event purchase ID (Dorsal)',
                    pt: 'ID de compra do evento (Dorsal)',
                  },
                  type: 'text',
                  admin: {
                    readOnly: false,
                    width: '25%',
                    condition: (data, siblingData) =>
                      data?.paymentStatus === 'paid' && siblingData?.ticketPurchased,
                  },
                },
              ],
            },
          ],
          admin: {
            readOnly: true,
            width: '50%',
          },
        },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'total',
      label: {
        en: 'Total',
        pt: 'Total',
      },
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'cartId',
      label: { en: 'Cart ID', pt: 'ID do Carrinho' },
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'stripePaymentIntentId',
      label: {
        en: 'Stripe Payment Intent ID',
        pt: 'ID do Pagamento Stripe',
      },
      type: 'text',
      // admin: { readOnly: true },
    },
    {
      name: 'paymentStatus',
      label: { en: 'Payment Status', pt: 'Estado do Pagamento' },
      type: 'select',
      options: [
        { label: { en: 'Pending', pt: 'Pendente' }, value: 'pending' },
        { label: { en: 'Paid', pt: 'Pago' }, value: 'paid' },
        { label: { en: 'Failed', pt: 'Falhou' }, value: 'failed' },
      ],
      defaultValue: 'pending',
      admin: { readOnly: true },
    },
  ],
}
