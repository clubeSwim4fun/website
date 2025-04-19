import { CollectionConfig } from 'payload'

export const FederationHistory: CollectionConfig = {
  slug: 'federationHistory',
  labels: {
    plural: {
      en: 'User-Federation History',
      pt: 'Utilizador-Histórico Federação',
    },
    singular: {
      en: 'User-Federation History',
      pt: 'Utilizador-Histórico Federação',
    },
  },
  admin: {
    defaultColumns: ['user', 'federationId', 'season'],
    useAsTitle: 'federationId',
  },
  fields: [
    {
      name: 'user',
      label: {
        en: 'User',
        pt: 'Utilizador',
      },
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'federationId',
      label: {
        en: 'Federation ID',
        pt: 'ID da Federação',
      },
      type: 'number',
    },
    {
      name: 'season',
      label: {
        en: 'Season',
        pt: 'Temporada',
      },
      type: 'text',
    },
  ],
}
