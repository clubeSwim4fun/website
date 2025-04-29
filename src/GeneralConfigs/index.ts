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
                      localized: true,
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
                      localized: true,
                      label: {
                        en: 'Title',
                        pt: 'Título',
                      },
                      type: 'text',
                    },
                    {
                      name: 'useBadges',
                      localized: true,
                      label: {
                        en: 'Show Badges',
                        pt: 'Mostrar Distintivos',
                      },
                      type: 'checkbox',
                    },
                    {
                      name: 'avatar',
                      label: {
                        en: 'Default user Image',
                        pt: 'Imagem padrão do utilizador',
                      },
                      type: 'upload',
                      relationTo: 'media',
                    },
                  ],
                },
                {
                  name: 'subscription',
                  label: {
                    en: 'Subscription page',
                    pt: 'Página pagamento do utilizador',
                  },
                  type: 'group',
                  fields: [
                    {
                      name: 'title',
                      localized: true,
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
                      localized: true,
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
                      localized: true,
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
        {
          name: 'associationFees',
          label: {
            en: 'Association Fees',
            pt: 'Taxas de Associados',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'registrationFee',
                  type: 'number',
                  min: 0,
                  label: {
                    en: 'Jewel',
                    pt: 'Jóia',
                  },
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'monthlyFee',
                  type: 'number',
                  required: true,
                  min: 0,
                  label: {
                    en: 'Monthly Fee',
                    pt: 'Mensalidade',
                  },
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'limitDate',
                  required: true,
                  type: 'number',
                  min: 1,
                  max: 31,
                  label: {
                    en: 'Subscription Limit Date',
                    pt: 'Data limit de inscrição',
                  },
                  admin: {
                    width: '50%',
                    description: {
                      en: 'This will be the max date that a user can pay the current month, if he/she is registering after this date, the payment will be calculated for the following month',
                      pt: 'Esta será a data máxima que um utilizador pode pagar o mês atual, se ele/ela se inscrever após esta data, o pagamento será calculado para o mês seguinte',
                    },
                  },
                },
                {
                  name: 'periodicity',
                  label: {
                    en: 'Periodicity',
                    pt: 'Periodicidade',
                  },
                  required: true,
                  type: 'select',
                  options: [
                    {
                      label: {
                        en: 'Monthly',
                        pt: 'Mensal',
                      },
                      value: '1',
                    },
                    {
                      label: {
                        en: 'Quarterly',
                        pt: 'Trimestral',
                      },
                      value: '3',
                    },
                    {
                      label: {
                        en: 'Yearly',
                        pt: 'Anual',
                      },
                      value: '12',
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
