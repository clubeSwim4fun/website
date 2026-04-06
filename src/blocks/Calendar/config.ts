import type { Block } from 'payload'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'

export const CalendarBlock: Block = {
  slug: 'calendarBlock',
  interfaceName: 'Calendar',
  fields: [
    blockVisibilityDynamicField,
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
        {
          label: 'Lista',
          value: 'listMonth',
        },
      ],
    },
  ],
}
