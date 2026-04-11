/**
 * Shared CTA link field — used in Hero and Content blocks.
 * Appearance options: 'primary' (white bg), 'primaryDark' (deep-blue bg), 'secondary' (outline).
 */
import type { Field } from 'payload'

export const ctaLinkFields: Field[] = [
  {
    name: 'link',
    type: 'group',
    admin: { hideGutter: true },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'radio',
            defaultValue: 'custom',
            admin: { layout: 'horizontal', width: '50%' },
            options: [
              { label: 'Internal link', value: 'reference' },
              { label: 'Custom URL', value: 'custom' },
            ],
          },
          {
            name: 'newTab',
            type: 'checkbox',
            label: 'Open in new tab',
            admin: { width: '50%', style: { alignSelf: 'flex-end' } },
          },
        ],
      },
      {
        name: 'reference',
        type: 'relationship',
        relationTo: ['pages', 'posts'],
        required: true,
        admin: { condition: (_, s) => s?.type === 'reference' },
        label: { en: 'Page', pt: 'Página' },
      },
      {
        name: 'url',
        type: 'text',
        required: true,
        admin: { condition: (_, s) => s?.type === 'custom' },
        label: { en: 'Custom URL', pt: 'URL personalizada' },
      },
      {
        type: 'row',
        fields: [
          {
            name: 'label',
            type: 'text',
            localized: true,
            required: true,
            label: { en: 'Label', pt: 'Rótulo' },
            admin: { width: '50%' },
          },
          {
            name: 'appearance',
            type: 'select',
            defaultValue: 'primary',
            label: { en: 'Style', pt: 'Estilo' },
            admin: { width: '50%' },
            options: [
              {
                label: { en: 'Primary (white fill)', pt: 'Primário (fundo branco)' },
                value: 'primary',
              },
              {
                label: {
                  en: 'Primary Dark (deep blue fill)',
                  pt: 'Primário Escuro (azul profundo)',
                },
                value: 'primaryDark',
              },
              {
                label: { en: 'Secondary (outline)', pt: 'Secundário (contorno)' },
                value: 'secondary',
              },
            ],
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'icon',
            type: 'select',
            label: { en: 'Icon', pt: 'Ícone' },
            admin: { width: '50%' },
            options: [
              { label: { en: 'None', pt: 'Nenhum' }, value: 'none' },
              { label: { en: 'Arrow →', pt: 'Seta →' }, value: 'arrow' },
              { label: { en: 'Calendar', pt: 'Calendário' }, value: 'calendar' },
              { label: { en: 'Flag / Check', pt: 'Bandeira / Check' }, value: 'flag' },
              { label: { en: 'User', pt: 'Utilizador' }, value: 'user' },
              { label: { en: 'Star', pt: 'Estrela' }, value: 'star' },
            ],
          },
          {
            name: 'iconRight',
            type: 'checkbox',
            defaultValue: false,
            label: { en: 'Icon on the right', pt: 'Ícone à direita' },
            admin: { width: '50%', style: { alignSelf: 'flex-end' } },
          },
        ],
      },
    ],
  },
]
