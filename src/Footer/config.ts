import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: {
    en: 'Footer',
    pt: 'Rodapé',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'contact',
          type: 'group',
          admin: {
            width: '33%',
          },
          fields: [
            {
              name: 'label',
              localized: true,
              type: 'text',
              label: {
                en: 'Label',
                pt: 'Rótulo',
              },
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'emailLabel',
                  type: 'text',
                  localized: true,
                  label: {
                    en: 'Email Label',
                    pt: 'Rótulo do Email',
                  },
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'email',
                  type: 'email',
                  admin: {
                    width: '50%',
                  },
                  label: {
                    en: 'Email',
                    pt: 'Email',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'phoneLabel',
                  localized: true,
                  type: 'text',
                  label: {
                    en: 'Phone Label',
                    pt: 'Rótulo do Telefone',
                  },
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'phone',
                  type: 'text',
                  label: {
                    en: 'Phone',
                    pt: 'Telefone',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'whatsappLabel',
                  localized: true,
                  type: 'text',
                  label: {
                    en: 'WhatsApp Label',
                    pt: 'Rótulo do WhatsApp',
                  },
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'whatsapp',
                  type: 'text',
                  label: {
                    en: 'WhatsApp',
                    pt: 'WhatsApp',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'socialMedia',
          type: 'group',
          admin: {
            width: '33%',
          },
          fields: [
            {
              name: 'label',
              localized: true,
              type: 'text',
              label: {
                en: 'Label',
                pt: 'Rótulo',
              },
              required: true,
            },
            {
              name: 'instagram',
              type: 'text',
              label: {
                en: 'Instagram URL',
                pt: 'URL do Instagram',
              },
              admin: {
                description: {
                  en: 'Full Instagram profile URL',
                  pt: 'URL completo do perfil do Instagram',
                },
              },
            },
            {
              name: 'x',
              type: 'text',
              label: {
                en: 'X (Twitter) URL',
                pt: 'URL do X (Twitter)',
              },
              admin: {
                description: {
                  en: 'Full X (Twitter) profile URL',
                  pt: 'URL completo do perfil do X (Twitter)',
                },
              },
            },
            {
              name: 'facebook',
              type: 'text',
              label: {
                en: 'Facebook URL',
                pt: 'URL do Facebook',
              },
              admin: {
                description: {
                  en: 'Full Facebook page URL',
                  pt: 'URL completo da página do Facebook',
                },
              },
            },
            {
              name: 'youtube',
              type: 'text',
              label: {
                en: 'YouTube URL',
                pt: 'URL do YouTube',
              },
              admin: {
                description: {
                  en: 'Full YouTube channel URL',
                  pt: 'URL completo do canal do YouTube',
                },
              },
            },
          ],
        },
        {
          name: 'company',
          type: 'group',
          admin: {
            width: '33%',
          },
          fields: [
            {
              name: 'label',
              localized: true,
              type: 'text',
              label: {
                en: 'Label',
                pt: 'Rótulo',
              },
              required: true,
            },
            {
              name: 'copyright',
              localized: true,
              type: 'text',
              label: {
                en: 'Copyright text',
                pt: 'Texto de copyright',
              },
              admin: {
                description: {
                  en: 'e.g. Copyright © 2026 Clube Swim4fun',
                  pt: 'ex: Copyright © 2026 Clube Swim4fun',
                },
              },
            },
            {
              name: 'navItems',
              label: {
                en: 'Navigation items',
                pt: 'Items da navegação',
              },
              type: 'array',
              fields: [
                link({
                  appearances: false,
                }),
              ],
              maxRows: 6,
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: '@/Footer/RowLabel#RowLabel',
                },
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
