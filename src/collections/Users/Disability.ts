import { CollectionConfig } from 'payload'

export const Disability: CollectionConfig = {
  slug: 'disability',
  labels: {
    plural: {
      en: 'Disabilities',
      pt: 'Deficiências',
    },
    singular: {
      en: 'Disability',
      pt: 'Deficiência',
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
