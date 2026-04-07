import type { Block } from 'payload'

export const NewsletterPostsBlock: Block = {
  slug: 'newsletterPosts',
  interfaceName: 'NewsletterPostsBlock',
  labels: {
    singular: { en: 'Posts', pt: 'Publicações' },
    plural: { en: 'Posts', pt: 'Publicações' },
  },
  fields: [
    {
      name: 'title',
      label: { en: 'Section title', pt: 'Título da secção' },
      type: 'text',
      localized: true,
    },
    {
      name: 'populateBy',
      label: { en: 'Populate by', pt: 'Preencher por' },
      type: 'select',
      defaultValue: 'selection',
      options: [
        { label: { en: 'Manual selection', pt: 'Seleção manual' }, value: 'selection' },
        {
          label: { en: 'Latest from category', pt: 'Mais recentes por categoria' },
          value: 'category',
        },
      ],
    },
    {
      name: 'selectedPosts',
      label: { en: 'Posts', pt: 'Publicações' },
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        condition: (_, s) => s.populateBy === 'selection',
      },
    },
    {
      name: 'category',
      label: { en: 'Category', pt: 'Categoria' },
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        condition: (_, s) => s.populateBy === 'category',
      },
    },
    {
      name: 'limit',
      label: { en: 'Limit', pt: 'Limite' },
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 10,
      admin: {
        condition: (_, s) => s.populateBy === 'category',
        step: 1,
      },
    },
    {
      name: 'showImage',
      label: { en: 'Show hero image', pt: 'Mostrar imagem principal' },
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
