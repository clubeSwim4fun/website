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
          value: 'timeGridDay',
        },
        {
          label: 'Semana',
          value: 'timeGridWeek',
        },
        {
          label: 'Mês',
          value: 'dayGridMonth',
        },
      ],
    },
  ],
}
