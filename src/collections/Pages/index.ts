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
import { SponsorsBlock } from '@/blocks/SponsorsBlock/config'
import { TeamBlock } from '@/blocks/TeamBlock/config'
import { SectionWithAside } from '@/blocks/SectionWithAside/config'
import { CardBlock } from '@/blocks/CardBlock/config'
import { BenefitsBlock } from '@/blocks/BenefitsBlock/config'
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
    group: {
      pt: 'Conteúdo',
      en: 'Content',
    },
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
              blocks: [
                CallToAction,
                Content,
                SectionWithAside,
                MediaBlock,
                Archive,
                FormBlock,
                CalendarBlock,
                SponsorsBlock,
                TeamBlock,
                CardBlock,
                BenefitsBlock,
              ],
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
            // ── Visible For group ──────────────────────────────────────────
            {
              name: 'visibleForConfig',
              label: {
                en: 'Visible For',
                pt: 'Visível Para',
              },
              type: 'group',
              admin: {
                description: {
                  en: 'Restrict this page to specific groups. Users not in these groups will see the error screen below.',
                  pt: 'Restringe esta página a grupos específicos. Utilizadores fora destes grupos verão o ecrã de erro abaixo.',
                },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'groups',
                      label: {
                        en: 'Groups:',
                        pt: 'Grupos:',
                      },
                      type: 'relationship',
                      relationTo: ['groups', 'group-categories'],
                      hasMany: true,
                      admin: {
                        width: '33%',
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
                        width: '67%',
                        description: {
                          en: 'Shown when user does not have access.',
                          pt: 'Mostrado quando o utilizador não tem acesso.',
                        },
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'links',
                      label: {
                        en: 'Buttons',
                        pt: 'Botões',
                      },
                      type: 'array',
                      admin: {
                        width: '75%',
                      },
                      fields: [
                        link({
                          overrides: { admin: { hideGutter: true } },
                        }),
                      ],
                    },
                    {
                      name: 'backgroundColor',
                      label: {
                        en: 'Background Color',
                        pt: 'Cor de Fundo',
                      },
                      type: 'select',
                      defaultValue: 'green',
                      admin: {
                        width: '25%',
                      },
                      options: [
                        { label: { en: 'Green (default)', pt: 'Verde (padrão)' }, value: 'green' },
                        { label: { en: 'Blue', pt: 'Azul' }, value: 'blue' },
                        { label: { en: 'Dark', pt: 'Escuro' }, value: 'dark' },
                        { label: { en: 'Light', pt: 'Claro' }, value: 'light' },
                        { label: { en: 'Red', pt: 'Vermelho' }, value: 'red' },
                      ],
                    },
                  ],
                },
              ],
            },
            // ── Hidden For group ───────────────────────────────────────────
            {
              name: 'hiddenForConfig',
              label: {
                en: 'Hidden For',
                pt: 'Oculto Para',
              },
              type: 'group',
              admin: {
                description: {
                  en: 'Hide this page from specific groups (e.g. users already in a group). They will see the error screen below instead.',
                  pt: 'Oculta esta página de grupos específicos (ex: utilizadores já num grupo). Verão o ecrã de erro abaixo.',
                },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'groups',
                      label: {
                        en: 'Groups:',
                        pt: 'Grupos:',
                      },
                      type: 'relationship',
                      relationTo: ['groups', 'group-categories'],
                      hasMany: true,
                      admin: {
                        width: '33%',
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
                        width: '67%',
                        description: {
                          en: 'Shown when user is blocked via Hidden For.',
                          pt: 'Mostrado quando o utilizador é bloqueado via Oculto Para.',
                        },
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'links',
                      label: {
                        en: 'Buttons',
                        pt: 'Botões',
                      },
                      type: 'array',
                      admin: {
                        width: '75%',
                      },
                      fields: [
                        link({
                          overrides: { admin: { hideGutter: true } },
                        }),
                      ],
                    },
                    {
                      name: 'backgroundColor',
                      label: {
                        en: 'Background Color',
                        pt: 'Cor de Fundo',
                      },
                      type: 'select',
                      defaultValue: 'green',
                      admin: {
                        width: '25%',
                      },
                      options: [
                        { label: { en: 'Green (default)', pt: 'Verde (padrão)' }, value: 'green' },
                        { label: { en: 'Blue', pt: 'Azul' }, value: 'blue' },
                        { label: { en: 'Dark', pt: 'Escuro' }, value: 'dark' },
                        { label: { en: 'Light', pt: 'Claro' }, value: 'light' },
                        { label: { en: 'Red', pt: 'Vermelho' }, value: 'red' },
                      ],
                    },
                  ],
                },
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
