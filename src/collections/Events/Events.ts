import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { slugField } from '@/fields/slug'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import COUNTRY_LIST from '@/utilities/countryList'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    plural: {
      en: 'Events',
      pt: 'Eventos',
    },
    singular: {
      en: 'Event',
      pt: 'Evento',
    },
  },
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: {
        en: 'Event title',
        pt: 'Título do Evento',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: {
        en: 'Description',
        pt: 'Descrição',
      },
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
    },
    {
      name: 'start',
      label: {
        en: 'Start date',
        pt: 'Data de inicio',
      },
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      required: true,
    },
    {
      name: 'end',
      label: {
        en: 'End date',
        pt: 'Data de término',
      },
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      required: true,
    },
    {
      name: 'distance',
      admin: {
        position: 'sidebar',
      },
      label: {
        en: 'Distance',
        pt: 'Distância',
      },
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'category',
      label: {
        en: 'Category',
        pt: 'Categoria',
      },
      admin: {
        position: 'sidebar',
      },
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'address',
      label: {
        en: 'Address',
        pt: 'Morada',
      },
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'street',
              label: {
                en: 'street',
                pt: 'Rua',
              },
              type: 'text',
              admin: {
                width: '45%',
              },
            },
            {
              name: 'number',
              label: {
                en: 'Number',
                pt: 'Nº Porta',
              },
              type: 'text',
              admin: {
                width: '15%',
              },
            },
            {
              name: 'state',
              label: {
                en: 'State',
                pt: 'Concelho',
              },
              type: 'text',
              admin: {
                width: '20%',
              },
            },
            {
              name: 'zipcode',
              label: {
                en: 'Zipcode',
                pt: 'Código Postal',
              },
              type: 'text',
              admin: {
                width: '20%',
              },
            },
            {
              name: 'country',
              label: {
                en: 'Country',
                pt: 'País',
              },
              type: 'select',
              options: COUNTRY_LIST.map((c) => c.name),
            },
          ],
        },
      ],
    },
    {
      name: 'tickets',
      label: {
        en: 'Tickets',
        pt: 'Bilhetes',
      },
      type: 'group',
      fields: [
        {
          name: 'ticket',
          label: {
            en: 'Ticket',
            pt: 'Bilhete',
          },
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  label: {
                    en: 'Name',
                    pt: 'Nome',
                  },
                  type: 'text',
                  admin: {
                    width: '50%',
                  },
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
                    width: '50%',
                  },
                },
              ],
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
            },
          ],
        },
      ],
    },
    ...slugField(),
  ],
}
