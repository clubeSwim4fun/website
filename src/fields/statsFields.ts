import type { ArrayField } from 'payload'

/**
 * Shared stats array field used across hero and block configs.
 * Each stat supports manual (free-text value) or automatic (live user count for a group).
 */
export const statsFields = (overrides: Partial<ArrayField> = {}): ArrayField => ({
  name: 'stats',
  type: 'array',
  label: { en: 'Stats', pt: 'Estatísticas' },
  fields: [
    {
      name: 'statsMode',
      type: 'radio',
      label: { en: 'Value source', pt: 'Fonte do valor' },
      defaultValue: 'manual',
      options: [
        { label: { en: 'Manual', pt: 'Manual' }, value: 'manual' },
        {
          label: { en: 'Automatic (group count)', pt: 'Automático (contagem de grupo)' },
          value: 'automatic',
        },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'value',
          type: 'text',
          label: { en: 'Value', pt: 'Valor' },
          admin: {
            width: '30%',
            condition: (_, sibling) => sibling?.statsMode !== 'automatic',
          },
        },
        {
          name: 'group',
          type: 'relationship',
          relationTo: 'groups',
          label: { en: 'Group', pt: 'Grupo' },
          admin: {
            width: '30%',
            condition: (_, sibling) => sibling?.statsMode === 'automatic',
          },
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
          label: { en: 'Label', pt: 'Rótulo' },
          admin: { width: '70%' },
        },
      ],
    },
  ],
  ...overrides,
})
