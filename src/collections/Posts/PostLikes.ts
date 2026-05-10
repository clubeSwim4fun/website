import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'

export const PostLikes: CollectionConfig = {
  slug: 'post-likes',
  labels: {
    plural: { en: 'Post Likes', pt: 'Gostos de Publicações' },
    singular: { en: 'Post Like', pt: 'Gosto de Publicação' },
  },
  access: {
    create: authenticated,
    read: () => true,
    update: isAdmin,
    delete: authenticated,
  },
  admin: {
    hidden: true,
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
  ],
  timestamps: true,
}
