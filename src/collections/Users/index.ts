import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import COUNTRY_LIST from '@/utilities/countryList'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

import { User } from '@/payload-types'
import { anyone } from '@/access/anyone'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    plural: {
      en: 'Users',
      pt: 'Utilizadores',
    },
    singular: {
      en: 'User',
      pt: 'Utilizadores',
    },
  },
  access: {
    admin: isAdminOrEditor,
    create: anyone,
    delete: isAdmin,
    read: authenticated, // Check this later, probably needs to change as can be accessed via Postman for example
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role', 'groups', 'createdAt', 'updatedAt'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: {
            en: 'Name',
            pt: 'Nome',
          },
          type: 'text',
          required: true,
          admin: {
            width: '30%',
          },
        },
        {
          name: 'surname',
          label: {
            en: 'Surname',
            pt: 'Apelido',
          },
          type: 'text',
          required: true,
          admin: {
            width: '30%',
          },
        },
        {
          name: 'nationality',
          label: {
            en: 'Nationality',
            pt: 'Nacionalidade',
          },
          type: 'select',
          options: COUNTRY_LIST.map((c) => c.name),
          admin: {
            width: '40%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          label: {
            en: 'Phone',
            pt: 'Telemóvel',
          },
          type: 'text',
          admin: {
            width: '30%',
          },
        },
        {
          name: 'identity',
          label: {
            en: 'identity card number',
            pt: 'Nº Documento Identificação',
          },
          type: 'text',
          admin: {
            width: '30%',
          },
        },
        {
          name: 'identityFile',
          label: {
            en: 'Identity card copy',
            pt: 'Fotocópia do Documento Identificação',
          },
          type: 'upload',
          relationTo: 'user-media',
          admin: {
            width: '40%',
          },
        },
      ],
    },
    {
      name: 'profilePicture',
      label: {
        en: 'Profile picture',
        pt: 'Foto do Perfil',
      },
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'role',
      label: {
        en: 'Role',
        pt: 'Perfil',
      },
      type: 'select',
      defaultValue: 'default',
      saveToJWT: true,
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Padrão',
          value: 'default',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'nif',
      label: 'NIF',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'gender',
      label: {
        en: 'Gender',
        pt: 'Genero',
      },
      type: 'radio',
      options: ['masculino', 'feminino'],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'groups',
      label: {
        en: 'Groups',
        pt: 'Grupos',
      },
      type: 'relationship',
      relationTo: ['groups', 'group-categories'],
      hasMany: true,
      filterOptions: ({ siblingData, relationTo }) => {
        const parentGroup = siblingData as User

        if (relationTo === 'group-categories') {
          return {
            parent: { in: parentGroup?.groups?.map((g) => g.value) },
          }
        }
        return true
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'birthDate',
      label: {
        en: 'Birth date',
        pt: 'Data de nascimento',
      },
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'disability',
      label: {
        en: 'Disabilities',
        pt: 'Categorias de Deficiência',
      },
      type: 'select',
      hasMany: true,
      defaultValue: 'Nenhuma',
      options: [
        'Nenhuma',
        'Auditiva',
        'Intelectual',
        'Motora',
        'Paralisia Cerebral',
        'Visual',
        'Transplantado',
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'wantsToBeFederado',
      label: {
        en: 'Wants to be Federated?',
        pt: 'Quer ser Federado?',
      },
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'heardAboutClub',
      label: {
        en: 'Header about the Club by:',
        pt: 'Ficou a saber do clube através:',
      },
      type: 'select',
      options: ['Internet', 'Amigos', 'Escola Swim4Fun', 'Outros'],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'Address',
      label: {
        en: 'Address',
        pt: 'Morada',
      },
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'street',
              label: {
                en: 'street',
                pt: 'Rua',
              },
              type: 'text',
              admin: {
                width: '45%',
              },
            },
            {
              name: 'number',
              label: {
                en: 'Number',
                pt: 'Nº Porta',
              },
              type: 'text',
              admin: {
                width: '15%',
              },
            },
            {
              name: 'state',
              label: {
                en: 'State',
                pt: 'Concelho',
              },
              type: 'text',
              admin: {
                width: '20%',
              },
            },
            {
              name: 'zipcode',
              label: {
                en: 'Zipcode',
                pt: 'Código Postal',
              },
              type: 'text',
              admin: {
                width: '20%',
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
