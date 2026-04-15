/**
 * Shared CTA link field — used in Hero and Content blocks.
 * Appearance options: 'primary' (white bg), 'primaryDark' (deep-blue bg), 'secondary' (outline).
 */
import type { Field } from 'payload'

const linkVisibilityField: Field = {
  name: 'linkVisibility',
  label: { en: 'Visibility', pt: 'Visibilidade' },
  type: 'group',
  admin: { hideGutter: true },
  fields: [
    {
      name: 'visibilityType',
      label: { en: 'Visibility Type', pt: 'Tipo de Visibilidade' },
      type: 'select',
      defaultValue: 'everyone',
      options: [
        { label: { en: 'Everyone', pt: 'Todos' }, value: 'everyone' },
        {
          label: { en: 'Logged In Users Only', pt: 'Apenas Utilizadores Autenticados' },
          value: 'loggedIn',
        },
        { label: { en: 'Not Logged In', pt: 'Não Autenticados' }, value: 'notLoggedIn' },
        { label: { en: 'Active Members Only', pt: 'Apenas Membros Ativos' }, value: 'active' },
        { label: { en: 'Admins Only', pt: 'Apenas Administradores' }, value: 'admin' },
        {
          label: { en: 'Specific Groups/Subgroups', pt: 'Grupos/Sub-grupos Específicos' },
          value: 'specificGroups',
        },
      ],
      admin: {
        description: {
          en: 'Choose who can see this button',
          pt: 'Escolha quem pode ver este botão',
        },
      },
    },
    {
      name: 'allowedGroups',
      label: { en: 'Allowed Groups & Subgroups', pt: 'Grupos e Sub-grupos Permitidos' },
      type: 'relationship',
      relationTo: ['groups', 'group-categories'],
      hasMany: true,
      admin: {
        condition: (_, { visibilityType }) => visibilityType === 'specificGroups',
        description: {
          en: 'Select which groups and/or subgroups can see this button',
          pt: 'Selecione quais grupos e/ou sub-grupos podem ver este botão',
        },
      },
    },
  ],
}

export const ctaLinkFields: Field[] = [
  linkVisibilityField,
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
