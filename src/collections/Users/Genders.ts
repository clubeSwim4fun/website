import { CollectionConfig } from 'payload'

export const Gender: CollectionConfig = {
  slug: 'gender',
  labels: {
    plural: {
      en: 'Genders',
      pt: 'Gêneros',
    },
    singular: {
      en: 'Gender',
      pt: 'Gênero',
    },
  },
  admin: {
    defaultColumns: ['title', 'value'],
    useAsTitle: 'title',
    hidden: true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Keep non-localized title in sync with value for admin display
        if (!data.title) {
          data.title = data.value || data.label || ''
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'label',
      localized: true,
      type: 'text',
      required: true,
    },
    {
      name: 'value',
      type: 'text',
      required: true,
    },
    {
      name: 'hiddenId',
      type: 'text',
      unique: true,
      admin: {
        hidden: true,
      },
    },
  ],
}
