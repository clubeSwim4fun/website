import type { Block } from 'payload'
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'
import { blockBackgroundField } from '@/fields/blockBackground'

export const CalendarBlock: Block = {
  slug: 'calendarBlock',
  interfaceName: 'Calendar',
  fields: [
    blockVisibilityDynamicField,
    blockBackgroundField,
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
