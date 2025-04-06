import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

export const Carts: CollectionConfig = {
  slug: 'carts',
  labels: {
    plural: {
      en: 'Carts',
      pt: 'Carrinhos',
    },
    singular: {
      en: 'Cart',
      pt: 'Carrinho',
    },
  },
  access: {
    admin: isAdminOrEditor,
    create: authenticated,
    delete: isAdmin,
    read: authenticated, // Check this later, probably needs to change as can be accessed via Postman for example
    update: authenticated,
  },
  admin: {
    // hidden: true,
  },
  fields: [
    {
      name: 'items',
      label: {
        en: 'Items',
        pt: 'Itens',
      },
      type: 'array',
      fields: [
        {
          name: 'selectedTicket',
          label: {
            en: 'Tickets',
            pt: 'Bilhetes',
          },
          type: 'relationship',
          relationTo: 'tickets',
        },
        {
          name: 'selectedTshirtSize',
          label: {
            en: 'T-Shirt Size',
            pt: 'Tamanho T-Shirt',
          },
          type: 'text',
        },
      ],
    },
    {
      name: 'totalPrice',
      label: {
        en: 'Total Price',
        pt: 'Preço Total',
      },
      type: 'number',
      admin: {
        readOnly: true,
      },
      required: true,
    },
    {
      name: 'eventKey',
      label: {
        en: 'Event Key',
        pt: 'Chave do Evento',
      },
      type: 'text',
    },
    {
      name: 'hasTshirt',
      label: {
        en: 'Has T-Shirt?',
        pt: 'Tem T-Shirt?',
      },
      type: 'checkbox',
    },
    {
      name: 'user',
      label: {
        en: 'User',
        pt: 'Utilizador',
      },
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
  ],
}
