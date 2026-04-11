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
    // ── Row 1: Contact + Social Media ──────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'contact',
          type: 'group',
          label: {
            en: 'Contact',
            pt: 'Contacto',
          },
          admin: {
            width: '50%',
          },
          fields: [
            {
              name: 'label',
              localized: true,
              type: 'text',
              label: {
                en: 'Section title',
                pt: 'Título da secção',
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
                    en: 'Email label',
                    pt: 'Rótulo do email',
                  },
                  admin: { width: '50%' },
                },
                {
                  name: 'email',
                  type: 'email',
                  label: {
                    en: 'Email',
                    pt: 'Email',
                  },
                  admin: { width: '50%' },
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
                    en: 'Phone label',
                    pt: 'Rótulo do telefone',
                  },
                  admin: { width: '50%' },
                },
                {
                  name: 'phone',
                  type: 'text',
                  label: {
                    en: 'Phone',
                    pt: 'Telefone',
                  },
                  admin: { width: '50%' },
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
                    en: 'WhatsApp label',
                    pt: 'Rótulo do WhatsApp',
                  },
                  admin: { width: '50%' },
                },
                {
                  name: 'whatsapp',
                  type: 'text',
                  label: {
                    en: 'WhatsApp',
                    pt: 'WhatsApp',
                  },
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          name: 'socialMedia',
          type: 'group',
          label: {
            en: 'Social Media',
            pt: 'Redes Sociais',
          },
          admin: {
            width: '50%',
          },
          fields: [
            {
              name: 'label',
              localized: true,
              type: 'text',
              label: {
                en: 'Section title',
                pt: 'Título da secção',
              },
              required: true,
            },
            {
              name: 'instagram',
              type: 'text',
              label: { en: 'Instagram URL', pt: 'URL do Instagram' },
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
              label: { en: 'X (Twitter) URL', pt: 'URL do X (Twitter)' },
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
              label: { en: 'Facebook URL', pt: 'URL do Facebook' },
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
              label: { en: 'YouTube URL', pt: 'URL do YouTube' },
              admin: {
                description: {
                  en: 'Full YouTube channel URL',
                  pt: 'URL completo do canal do YouTube',
                },
              },
            },
          ],
        },
      ],
    },

    // ── Row 2: Copyright (full width) ──────────────────────────────
    {
      name: 'company',
      type: 'group',
      label: {
        en: 'General',
        pt: 'Geral',
      },
      fields: [
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
              en: 'e.g. © 2026 Clube Swim4fun. All rights reserved.',
              pt: 'ex: © 2026 Clube Swim4fun. Todos os direitos reservados.',
            },
          },
        },
      ],
    },

    // ── Row 3: Nav column 1 + Nav column 2 ────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'navCol1',
          type: 'group',
          label: {
            en: 'Navigation — Column 1',
            pt: 'Navegação — Coluna 1',
          },
          admin: {
            width: '50%',
          },
          fields: [
            {
              name: 'label',
              localized: true,
              type: 'text',
              label: {
                en: 'Column title',
                pt: 'Título da coluna',
              },
              required: true,
            },
            {
              name: 'navItems',
              label: {
                en: 'Links',
                pt: 'Links',
              },
              type: 'array',
              fields: [
                link({
                  appearances: false,
                }),
              ],
              maxRows: 8,
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: '@/Footer/RowLabel#RowLabel',
                },
              },
            },
          ],
        },
        {
          name: 'navCol2',
          type: 'group',
          label: {
            en: 'Navigation — Column 2',
            pt: 'Navegação — Coluna 2',
          },
          admin: {
            width: '50%',
          },
          fields: [
            {
              name: 'label',
              localized: true,
              type: 'text',
              label: {
                en: 'Column title',
                pt: 'Título da coluna',
              },
            },
            {
              name: 'navItems',
              label: {
                en: 'Links',
                pt: 'Links',
              },
              type: 'array',
              fields: [
                link({
                  appearances: false,
                }),
              ],
              maxRows: 8,
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
