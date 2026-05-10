import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  labels: {
    singular: { en: 'Sponsor', pt: 'Patrocinador' },
    plural: { en: 'Sponsors', pt: 'Patrocinadores' },
  },
  access: {
    create: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'name',
    group: {
      pt: 'Configurações Gerais',
      en: 'General Configs',
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: { en: 'Sponsor Name', pt: 'Nome do Patrocinador' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: { en: 'Logo', pt: 'Logótipo' },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: { en: 'Website URL', pt: 'URL do Website' },
    },
  ],
}
