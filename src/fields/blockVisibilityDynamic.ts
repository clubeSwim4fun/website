import type { Field } from 'payload'

/**
 * Dynamic block visibility field that supports:
 * - Multi-selection of visibility options
 * - Dynamic groups and group-categories from the database
 * - Flexible visibility rules
 */
export const blockVisibilityDynamicField: Field = {
  name: 'blockVisibility',
  label: {
    en: 'Visibility',
    pt: 'Visibilidade',
  },
  type: 'group',
  fields: [
    {
      name: 'visibilityType',
      label: {
        en: 'Visibility Type',
        pt: 'Tipo de Visibilidade',
      },
      type: 'select',
      defaultValue: 'everyone',
      options: [
        {
          label: {
            en: 'Everyone',
            pt: 'Todos',
          },
          value: 'everyone',
        },
        {
          label: {
            en: 'Logged In Users Only',
            pt: 'Apenas Utilizadores Autenticados',
          },
          value: 'loggedIn',
        },
        {
          label: {
            en: 'Not Logged In',
            pt: 'Não Autenticados',
          },
          value: 'notLoggedIn',
        },
        {
          label: {
            en: 'Active Members Only',
            pt: 'Apenas Membros Ativos',
          },
          value: 'active',
        },
        {
          label: {
            en: 'Admins Only',
            pt: 'Apenas Administradores',
          },
          value: 'admin',
        },
        {
          label: {
            en: 'Specific Groups/Subgroups',
            pt: 'Grupos/Sub-grupos Específicos',
          },
          value: 'specificGroups',
        },
      ],
      admin: {
        description: {
          en: 'Choose who can see this block',
          pt: 'Escolha quem pode ver este bloco',
        },
      },
    },
    {
      name: 'allowedGroups',
      label: {
        en: 'Allowed Groups & Subgroups',
        pt: 'Grupos e Sub-grupos Permitidos',
      },
      type: 'relationship',
      relationTo: ['groups', 'group-categories'],
      hasMany: true,
      admin: {
        condition: (_, { visibilityType }) => visibilityType === 'specificGroups',
        description: {
          en: 'Select which groups and/or subgroups can see this block',
          pt: 'Selecione quais grupos e/ou sub-grupos podem ver este bloco',
        },
      },
    },
  ],
}
