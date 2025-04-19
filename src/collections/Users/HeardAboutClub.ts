import { CollectionConfig } from 'payload'

export const AboutClub: CollectionConfig = {
  slug: 'aboutClub',
  labels: {
    plural: {
      en: 'About Club',
      pt: 'Sobre o Clube',
    },
    singular: {
      en: 'About Club',
      pt: 'Sobre o Clube',
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
