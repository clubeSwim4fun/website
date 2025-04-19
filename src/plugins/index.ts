import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Field, Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { Password } from '@/blocks/Form/Password/config'
import { Phone } from '@/blocks/Form/Phone/config'
import { Media } from '@/blocks/Form/Media/config'
import { Text } from '@/blocks/Form/Text/config'
import { Checkbox } from '@/blocks/Form/Checkbox/config'
import { Country } from '@/blocks/Form/Country/config'
import { Number } from '@/blocks/Form/Number/config'
import { Gender } from '@/blocks/Form/Gender/config'
import { Select } from '@/blocks/Form/Select/config'
import { Address } from '@/blocks/Form/Address/config'
import { DatePicker } from '@/blocks/Form/Date/config'
import { Email } from '@/blocks/Form/Email/config'
import { defaultLexical } from '@/fields/defaultLexical'
import { Disability } from '@/blocks/Form/Disability/config'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      labels: {
        plural: {
          en: 'Redirects',
          pt: 'Redirecionamentos',
        },
        singular: {
          en: 'Redirect',
          pt: 'Redirecionamento',
        },
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      password: Password,
      phone: Phone,
      media: Media,
      text: Text,
      checkbox: Checkbox,
      country: Country,
      number: Number,
      select: Select,
      address: Address,
      date: DatePicker,
      email: Email,
      state: false,
      gender: Gender,
      disability: Disability,
    },
    formOverrides: {
      labels: {
        plural: {
          en: 'Forms',
          pt: 'Formulários',
        },
        singular: {
          en: 'Form',
          pt: 'Formulários',
        },
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field: Field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: defaultLexical,
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      labels: {
        plural: {
          en: 'Form submissions',
          pt: 'Formulários enviados',
        },
        singular: {
          en: 'Form submission',
          pt: 'Formulário enviado',
        },
      },
      fields: ({ defaultFields }) => {
        // Removes the submissionData as I want to override
        const customFields = [...defaultFields.filter((field) => field.type !== 'array')] as Field[]

        return [
          ...customFields,
          {
            name: 'submissionData',
            type: 'array',
            admin: {
              readOnly: true,
            },
            fields: [
              {
                name: 'field',
                type: 'text',
                required: true,
              },
              {
                name: 'isArray',
                type: 'checkbox',
                admin: {
                  hidden: true,
                },
              },
              {
                name: 'value',
                type: 'text',
                required: false,
              },
            ],
          },
        ]
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      labels: {
        plural: {
          en: 'Search Results',
          pt: 'Resultado de pesquisas',
        },
        singular: {
          en: 'Search Result',
          pt: 'Resultado de pesquisa',
        },
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  payloadCloudPlugin(),
]
