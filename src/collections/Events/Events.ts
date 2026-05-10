import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { slugField } from '@/fields/slug'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import COUNTRY_LIST from '@/utilities/countryList'
import { defaultLexical } from '@/fields/defaultLexical'

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
    group: {
      pt: 'Gestão de Eventos',
      en: 'Events control',
    },
  },
  fields: [
    {
      name: 'title',
      localized: true,
      label: {
        en: 'Event title',
        pt: 'Título do Evento',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      localized: true,
      label: {
        en: 'Description',
        pt: 'Descrição',
      },
      type: 'richText',
      required: true,
      editor: defaultLexical,
    },
    {
      name: 'start',
      label: {
        en: 'Start date',
        pt: 'Data de início',
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
      name: 'timeToBeConfirmed',
      label: {
        en: 'Time to be confirmed?',
        pt: 'Horário a confirmar?',
      },
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'distances',
      type: 'array',
      fields: [
        {
          name: 'distance',
          admin: {
            position: 'sidebar',
          },
          label: {
            en: 'Distance (in meters)',
            pt: 'Distância (em metros)',
          },
          type: 'number',
          required: true,
          min: 0,
        },
      ],
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
      name: 'hasTshirt',
      label: {
        en: 'Has T-shirt?',
        pt: 'Tem T-shirt?',
      },
      admin: {
        position: 'sidebar',
      },
      type: 'checkbox',
    },
    {
      name: 'tshirtSizes',
      label: {
        en: 'Sizes available',
        pt: 'Tamanhos disponíveis',
      },
      admin: {
        position: 'sidebar',
      },
      type: 'select',
      hasMany: true,
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    },
    {
      name: 'isRiver',
      label: {
        en: 'Is river?',
        pt: 'É em Rio?',
      },
      admin: {
        position: 'sidebar',
      },
      type: 'checkbox',
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
              localized: true,
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
              localized: true,
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
      name: 'image',
      label: {
        en: 'Event Image',
        pt: 'Imagem do Evento',
      },
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'externalRegistrationUrl',
      label: {
        en: 'External Registration URL',
        pt: 'URL de Inscrição Externa',
      },
      type: 'text',
      admin: {
        position: 'sidebar',
        description: {
          en: 'If set, shows an "Inscrições" button linking to this URL instead of the internal cart.',
          pt: 'Se preenchido, mostra um botão "Inscrições" com link para este URL em vez do carrinho interno.',
        },
      },
    },
    {
      name: 'promoCode',
      label: {
        en: 'Promo Code',
        pt: 'Código Promocional',
      },
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'memberDiscount',
      label: {
        en: 'Member Discount (%)',
        pt: 'Desconto para Sócios (%)',
      },
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'distanceCategories',
      label: {
        en: 'Distance Categories',
        pt: 'Categorias de Distância',
      },
      type: 'array',
      fields: [
        {
          name: 'name',
          localized: true,
          label: { en: 'Category Name', pt: 'Nome da Categoria' },
          type: 'text',
          required: true,
        },
        {
          name: 'totalDistance',
          label: { en: 'Total Distance (m)', pt: 'Distância Total (m)' },
          type: 'number',
          min: 0,
        },
        {
          name: 'swimDistance',
          label: { en: 'Swim Distance (m)', pt: 'Distância de Natação (m)' },
          type: 'number',
          min: 0,
        },
        {
          name: 'runDistance',
          label: { en: 'Run Distance (m)', pt: 'Distância de Corrida (m)' },
          type: 'number',
          min: 0,
        },
        {
          name: 'transitions',
          label: { en: 'Transitions (swim/run)', pt: 'Transições (nado/corrida)' },
          type: 'text',
        },
        {
          name: 'longestSwim',
          label: { en: 'Longest Swim (m)', pt: 'Nado mais longo (m)' },
          type: 'number',
          min: 0,
        },
        {
          name: 'longestRun',
          label: { en: 'Longest Run (m)', pt: 'Corrida mais longa (m)' },
          type: 'number',
          min: 0,
        },
        {
          name: 'elevationGain',
          label: { en: 'Elevation Gain (D+)', pt: 'Ganho de Elevação (D+)' },
          type: 'number',
          min: 0,
        },
        {
          name: 'timeLimit',
          localized: true,
          label: { en: 'Time Limit', pt: 'Tempo Limite' },
          type: 'text',
        },
        {
          name: 'regulationUrl',
          label: { en: 'Regulation URL', pt: 'URL do Regulamento' },
          type: 'text',
        },
        {
          name: 'registrationUrl',
          label: { en: 'Registration URL', pt: 'URL de Inscrição' },
          type: 'text',
        },
      ],
    },
    {
      name: 'tickets',
      label: {
        en: 'Tickets',
        pt: 'Bilhetes',
      },
      type: 'relationship',
      relationTo: 'tickets',
      hasMany: true,
      admin: {
        condition: (data, siblingData) => {
          return !!siblingData.createdAt
        },
      },
      filterOptions: ({ id }) => {
        return {
          eventFor: {
            in: [id],
          },
        }
      },
    },
    ...slugField(),
  ],
}
