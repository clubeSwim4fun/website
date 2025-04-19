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
    defaultColumns: ['label', 'value'],
    useAsTitle: 'label',
    hidden: true,
  },
  fields: [
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
