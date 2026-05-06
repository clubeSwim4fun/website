import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'
import { v4 as uuidv4 } from 'uuid'

export const MONTH_OPTIONS = [
  { value: 'january', label: { en: 'January', pt: 'Janeiro' }, index: 1 },
  { value: 'february', label: { en: 'February', pt: 'Fevereiro' }, index: 2 },
  { value: 'march', label: { en: 'March', pt: 'Março' }, index: 3 },
  { value: 'april', label: { en: 'April', pt: 'Abril' }, index: 4 },
  { value: 'may', label: { en: 'May', pt: 'Maio' }, index: 5 },
  { value: 'june', label: { en: 'June', pt: 'Junho' }, index: 6 },
  { value: 'july', label: { en: 'July', pt: 'Julho' }, index: 7 },
  { value: 'august', label: { en: 'August', pt: 'Agosto' }, index: 8 },
  { value: 'september', label: { en: 'September', pt: 'Setembro' }, index: 9 },
  { value: 'october', label: { en: 'October', pt: 'Outubro' }, index: 10 },
  { value: 'november', label: { en: 'November', pt: 'Novembro' }, index: 11 },
  { value: 'december', label: { en: 'December', pt: 'Dezembro' }, index: 12 },
] as const

export type MonthValue = (typeof MONTH_OPTIONS)[number]['value']

/** Returns the 1-based month index (1–12) for a given month value */
export function getMonthIndex(month: string): number {
  return MONTH_OPTIONS.find((m) => m.value === month)?.index ?? 1
}

/** Returns the localized month label */
export function getMonthLabel(month: string, locale: 'en' | 'pt' = 'pt'): string {
  const opt = MONTH_OPTIONS.find((m) => m.value === month)
  return opt ? opt.label[locale] : month
}

export const PoolCycles: CollectionConfig = {
  slug: 'pool-cycles',
  labels: {
    plural: { en: 'Pool Cycles', pt: 'Ciclos de Piscina' },
    singular: { en: 'Pool Cycle', pt: 'Ciclo de Piscina' },
  },
  admin: {
    useAsTitle: 'name',
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (data?.month && data?.year) {
          const locale = (req?.locale as 'en' | 'pt') ?? 'pt'
          data.name = `${getMonthLabel(data.month, locale)} ${data.year}`
        }
        return data
      },
    ],
  },
  access: {
    create: isAdmin,
    read: authenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: { hidden: true, readOnly: true },
    },
    {
      type: 'row',
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
          admin: { width: '50%' },
        },
        {
          name: 'openDate',
          label: { en: 'Auto-Open Date', pt: 'Data de Abertura Automática' },
          type: 'date',
          required: false,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy HH:mm' },
            description: {
              en: 'If set, the cycle will automatically open on this date and close the previous one.',
              pt: 'Se definida, o ciclo abrirá automaticamente nesta data e fechará o anterior.',
            },
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'month',
          label: { en: 'Month', pt: 'Mês' },
          type: 'select',
          required: true,
          options: MONTH_OPTIONS.map(({ value, label }) => ({ value, label })),
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
                  name: 'dateTime',
                  label: { en: 'Day & Time', pt: 'Dia e Hora' },
                  type: 'date',
                  required: true,
                  admin: {
                    width: '33%',
                    date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy HH:mm' },
                  },
                },
                {
                  name: 'duration',
                  label: { en: 'Duration (min)', pt: 'Duração (min)' },
                  type: 'number',
                  required: true,
                  min: 1,
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
