import type { Field } from 'payload'

export const blockVisibilityField: Field = {
  name: 'blockVisibility',
  label: {
    en: 'Visibility',
    pt: 'Visibilidade',
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
        en: 'Socio Group Members',
        pt: 'Membros do Grupo Sócio',
      },
      value: 'socio',
    },
    {
      label: {
        en: 'Federado Users',
        pt: 'Utilizadores Federados',
      },
      value: 'federado',
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
  ],
  admin: {
    description: {
      en: 'Choose who can see this block',
      pt: 'Escolha quem pode ver este bloco',
    },
  },
}
