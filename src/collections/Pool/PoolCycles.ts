import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'

export const PoolCycles: CollectionConfig = {
  slug: 'pool-cycles',
  labels: {
    plural: {
      en: 'Pool Cycles',
      pt: 'Ciclos de Piscina',
    },
    singular: {
      en: 'Pool Cycle',
      pt: 'Ciclo de Piscina',
    },
  },
  access: {
    create: isAdmin,
    read: authenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'status',
      label: {
        en: 'Status',
        pt: 'Estado',
      },
      type: 'select',
      options: [
        { label: { en: 'Open', pt: 'Aberto' }, value: 'open' },
        { label: { en: 'Closed', pt: 'Fechado' }, value: 'closed' },
      ],
      defaultValue: 'closed',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'month',
          label: {
            en: 'Month',
            pt: 'Mês',
          },
          type: 'number',
          required: true,
          min: 1,
          max: 12,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'year',
          label: {
            en: 'Year',
            pt: 'Ano',
          },
          type: 'number',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'maxAthletes',
          label: {
            en: 'Max Athletes',
            pt: 'Máximo de Atletas',
          },
          type: 'number',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'waitlistLimit',
          label: {
            en: 'Waitlist Limit',
            pt: 'Limite da Lista de Espera',
          },
          type: 'number',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'price',
      label: {
        en: 'Price (EUR)',
        pt: 'Preço (EUR)',
      },
      type: 'number',
      required: true,
    },
    {
      name: 'availableSlots',
      label: {
        en: 'Available Slots',
        pt: 'Horários Disponíveis',
      },
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'day',
              label: {
                en: 'Day',
                pt: 'Dia',
              },
              type: 'text',
              required: true,
              admin: {
                width: '33%',
              },
            },
            {
              name: 'time',
              label: {
                en: 'Time',
                pt: 'Hora',
              },
              type: 'text',
              required: true,
              admin: {
                width: '33%',
              },
            },
            {
              name: 'maxAttendance',
              label: {
                en: 'Max Attendance',
                pt: 'Máximo de Participantes',
              },
              type: 'number',
              required: true,
              min: 1,
              admin: {
                width: '33%',
                description: {
                  en: 'Maximum number of athletes allowed in this slot',
                  pt: 'Número máximo de atletas permitidos neste horário',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
