import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'

export const PostComments: CollectionConfig = {
  slug: 'post-comments',
  labels: {
    plural: { en: 'Post Comments', pt: 'Comentários de Publicações' },
    singular: { en: 'Post Comment', pt: 'Comentário de Publicação' },
  },
  access: {
    create: authenticated,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
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
      admin: { readOnly: true },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
  ],
  timestamps: true,
}
