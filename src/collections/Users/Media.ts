import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import path from 'path'
import { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const UserMedia: CollectionConfig = {
  slug: 'user-media',
  labels: {
    plural: {
      en: 'User Medias',
      pt: 'Mídias do Utilizador',
    },
    singular: {
      en: 'User Media',
      pt: 'Mídia do Utilizador',
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
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
    ],
  },
}
