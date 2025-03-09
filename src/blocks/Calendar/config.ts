import type { Block } from 'payload'

export const CalendarBlock: Block = {
  slug: 'calendarBlock',
  interfaceName: 'Calendar',
  fields: [
    {
      name: 'defaultView',
      type: 'select',
      options: [
        {
          label: 'dia',
          value: 'day',
        },
        {
          label: 'Semana',
          value: 'week',
        },
        {
          label: 'Mês',
          value: 'month',
        },
      ],
    },
  ],
}
