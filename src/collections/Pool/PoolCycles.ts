import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'
import { v4 as uuidv4 } from 'uuid'

export const PoolCycles: CollectionConfig = {
  slug: 'pool-cycles',
  labels: {
    plural: { en: 'Pool Cycles', pt: 'Ciclos de Piscina' },
    singular: { en: 'Pool Cycle', pt: 'Ciclo de Piscina' },
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
      label: { en: 'Status', pt: 'Estado' },
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
          label: { en: 'Month', pt: 'Mês' },
          type: 'number',
          required: true,
          min: 1,
          max: 12,
          admin: { width: '50%' },
        },
        {
          name: 'year',
          label: { en: 'Year', pt: 'Ano' },
          type: 'number',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'maxAthletes',
          label: { en: 'Max Athletes', pt: 'Máximo de Atletas' },
          type: 'number',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'waitlistLimit',
          label: { en: 'Waitlist Limit', pt: 'Limite da Lista de Espera' },
          type: 'number',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'price',
      label: { en: 'Price (EUR)', pt: 'Preço (EUR)' },
      type: 'number',
      required: true,
    },
    {
      name: 'weeks',
      label: { en: 'Weekly Schedules', pt: 'Horários Semanais' },
      type: 'array',
      required: false,
      admin: {
        description: {
          en: 'Define slots per week. Each week has a date range and its own training slots.',
          pt: 'Defina horários por semana. Cada semana tem um intervalo de datas e os seus próprios horários.',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'startDate',
              label: { en: 'Week Start (Monday)', pt: 'Início da Semana (Segunda)' },
              type: 'date',
              required: true,
              admin: {
                width: '33%',
                date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
              },
            },
            {
              name: 'endDate',
              label: { en: 'Week End (Sunday)', pt: 'Fim da Semana (Domingo)' },
              type: 'date',
              required: true,
              admin: {
                width: '33%',
                date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
              },
            },
            {
              name: 'nextWeekOpenDate',
              label: { en: 'Next Week Opens At', pt: 'Próxima Semana Abre Em' },
              type: 'date',
              required: false,
              admin: {
                width: '33%',
                date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy HH:mm' },
                description: {
                  en: 'When users can start selecting slots for the following week',
                  pt: 'Quando os utilizadores podem começar a selecionar horários para a semana seguinte',
                },
              },
            },
          ],
        },
        {
          name: 'slots',
          label: { en: 'Training Slots', pt: 'Horários de Treino' },
          type: 'array',
          required: true,
          minRows: 1,
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'slotId',
                  type: 'text',
                  defaultValue: () => uuidv4(),
                  admin: { readOnly: true, hidden: true },
                },
                {
                  name: 'day',
                  label: { en: 'Day', pt: 'Dia' },
                  type: 'text',
                  required: true,
                  admin: { width: '33%' },
                },
                {
                  name: 'time',
                  label: { en: 'Time', pt: 'Hora' },
                  type: 'text',
                  required: true,
                  admin: { width: '33%' },
                },
                {
                  name: 'maxAttendance',
                  label: { en: 'Max Attendance', pt: 'Máximo de Participantes' },
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
    },
    // Legacy fields — kept hidden so existing documents don't break
    {
      name: 'availableSlots',
      type: 'array',
      required: false,
      admin: { hidden: true },
      fields: [
        { name: 'slotId', type: 'text' },
        { name: 'day', type: 'text' },
        { name: 'time', type: 'text' },
        { name: 'maxAttendance', type: 'number' },
      ],
    },
    {
      name: 'slotCounts',
      type: 'array',
      required: false,
      admin: { hidden: true },
      fields: [{ name: 'count', type: 'number', defaultValue: 0 }],
    },
  ],
}
