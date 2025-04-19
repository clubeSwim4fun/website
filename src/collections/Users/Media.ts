import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { CollectionConfig } from 'payload'
import updateImageName from './hooks/updateImageName'

export const UserMedia: CollectionConfig = {
  slug: 'user-media',
  labels: {
    plural: {
      en: 'User-Medias',
      pt: 'Utilizador-Mídias',
    },
    singular: {
      en: 'User-Media',
      pt: 'Utilizador-Mídia',
    },
  },
  access: {
    admin: isAdminOrEditor,
    create: anyone,
    delete: isAdmin,
    read: anyone, // Check this later, probably needs to change as can be accessed via Postman for example
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
  ],
  upload: {
    focalPoint: true,
    imageSizes: [
      {
        name: 'square',
        width: 500,
        height: 500,
      },
    ],
  },
  hooks: {
    beforeChange: [updateImageName],
  },
}
