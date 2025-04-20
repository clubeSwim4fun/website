import type { Description, GlobalConfig } from 'payload'

import { revalidateConfigs } from './hooks/revalidateConfigs'
import { updateCollections } from './hooks/updateCollections'

export const GeneralConfigs: GlobalConfig = {
  slug: 'generalConfigs',
  label: {
    en: 'General Configs',
    pt: 'Configurações Gerais',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'clubName',
      label: {
        en: 'Club Name',
        pt: 'Nome do Clube',
      },
      admin: {
        description: {
          en: 'This name will be used across the website as Title prefix of all pages for better SEO',
          pt: 'Este nome será usado em todo o site como prefixo do Título de todas as páginas para melhor SEO',
        },
      },
      type: 'text',
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'userData',
          label: {
            en: 'User Data',
            pt: 'Dados de Utilizador',
          },
          fields: [
            {
              name: 'genders',
              label: {
                en: 'Genders',
                pt: 'Gêneros',
              },
              type: 'array',
              fields: [
                {
                  name: 'label',
                  localized: true,
                  type: 'text',
                  required: true,
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'collectionId',
                  type: 'text',
                  admin: {
                    hidden: true,
                  },
                },
              ],
            },
            {
              name: 'disabilities',
              label: {
                en: 'Disabilities list',
                pt: 'Lista de deficiências',
              },
              type: 'array',
              fields: [
                {
                  name: 'label',
                  localized: true,
                  type: 'text',
                  required: true,
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'collectionId',
                  type: 'text',
                  admin: {
                    hidden: true,
                  },
                },
              ],
            },
            {
              name: 'aboutClub',
              label: {
                en: 'About Club options',
                pt: 'Opções sobre o Clube',
              },
              type: 'array',
              fields: [
                {
                  name: 'label',
                  localized: true,
                  type: 'text',
                  required: true,
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'collectionId',
                  type: 'text',
                  admin: {
                    hidden: true,
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'settings',
          label: {
            en: 'Settings',
            pt: 'Configurações',
          },
          fields: [
            {
              name: 'login',
              type: 'group',
              fields: [
                {
                  name: 'registerUrl',
                  label: {
                    en: 'Register page',
                    pt: 'Página de registo',
                  },
                  type: 'relationship',
                  relationTo: 'pages',
                },
              ],
            },
            {
              name: 'fixedPages',
              label: {
                en: 'Fixed pages',
                pt: 'Páginas fixas',
              },
              type: 'group',
              fields: [
                {
                  name: 'cart',
                  label: {
                    en: 'Cart',
                    pt: 'Carrinho',
                  },
                  type: 'group',
                  fields: [
                    {
                      name: 'title',
                      label: {
                        en: 'Title',
                        pt: 'Título',
                      },
                      type: 'text',
                    },
                  ],
                },
                {
                  name: 'myProfile',
                  label: {
                    en: 'My Profile',
                    pt: 'Meu Perfil',
                  },
                  type: 'group',
                  fields: [
                    {
                      name: 'title',
                      label: {
                        en: 'Title',
                        pt: 'Título',
                      },
                      type: 'text',
                    },
                  ],
                },
                {
                  name: 'payment',
                  label: {
                    en: 'Payment',
                    pt: 'Pagamento',
                  },
                  type: 'group',
                  fields: [
                    {
                      name: 'title',
                      label: {
                        en: 'Title',
                        pt: 'Título',
                      },
                      type: 'text',
                    },
                  ],
                },
                {
                  name: 'blog',
                  label: {
                    en: 'Blog',
                    pt: 'Blog',
                  },
                  type: 'group',
                  fields: [
                    {
                      name: 'title',
                      label: {
                        en: 'Title',
                        pt: 'Título',
                      },
                      type: 'text',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [updateCollections],
    afterChange: [revalidateConfigs],
  },
}
