import type { CollectionConfig } from 'payload'

import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { isAdminEditorOrPublished } from '@/access/isAdminEditorOrPublished'
import { CalendarBlock } from '@/blocks/Calendar/config'
import { defaultLexical } from '@/fields/defaultLexical'
import { link } from '@/fields/link'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: {
    plural: {
      en: 'Pages',
      pt: 'Páginas',
    },
    singular: {
      en: 'Page',
      pt: 'Página',
    },
  },
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: isAdminEditorOrPublished,
    update: isAdminOrEditor,
  },

  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, locale }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'pages',
          locale: locale.code,
        })

        return `${process.env.NEXT_PUBLIC_SERVER_URL}${path}`
      },
    },
    preview: (data, { locale }) => {
      const path = generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'pages',
        locale: locale,
      })

      return `${process.env.NEXT_PUBLIC_SERVER_URL}${path}`
    },
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: {
        en: 'title',
        pt: 'título',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock, CalendarBlock],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: {
            en: 'Content',
            pt: 'Conteúdo',
          },
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
        {
          name: 'visibility',
          label: {
            en: 'Page visibility',
            pt: 'Visibilidade da página',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'visibleFor',
                  label: {
                    en: 'Visible For:',
                    pt: 'Visível Para:',
                  },
                  type: 'relationship',
                  relationTo: ['groups', 'group-categories'],
                  hasMany: true,
                  admin: {
                    width: '25%',
                  },
                },
                {
                  name: 'errorMessage',
                  label: {
                    en: 'Error message',
                    pt: 'Mensagem de erro',
                  },
                  type: 'richText',
                  editor: defaultLexical,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'enableLink',
                  label: {
                    en: 'Enable Link?',
                    pt: 'Habilitar Link?',
                  },
                  type: 'checkbox',
                },
                link({
                  overrides: {
                    admin: {
                      condition: (_, { enableLink }) => Boolean(enableLink),
                    },
                  },
                }),
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'parentPage',
      label: {
        en: 'Parent Page',
        pt: 'Página Superior',
      },
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      label: {
        en: 'published At:',
        pt: 'publicado em:',
      },
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
