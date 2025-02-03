import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import COUNTRY_LIST from '@/utilities/countryList'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

import { User } from '@/payload-types'
import { anyone } from '@/access/anyone'

export const Users: CollectionConfig = {
  slug: 'users',
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
          label: 'Nome',
          type: 'text',
          required: true,
          admin: {
            width: '30%',
          },
        },
        {
          name: 'surname',
          label: 'Apelido',
          type: 'text',
          required: true,
          admin: {
            width: '30%',
          },
        },
        {
          name: 'nationality',
          label: 'Nacionalidade',
          type: 'select',
          required: true,
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
          label: 'Telemóvel',
          type: 'text',
          required: true,
          admin: {
            width: '30%',
          },
        },
        {
          name: 'identity',
          label: 'Documento Identificação',
          type: 'text',
          required: true,
          admin: {
            width: '30%',
          },
        },
        {
          name: 'identityFile',
          label: 'Fotocópia do Documento Identificação',
          type: 'upload',
          required: true,
          relationTo: 'media',
          admin: {
            width: '40%',
          },
        },
      ],
    },
    {
      name: 'profilePicutre',
      label: 'Foto do Perfil',
      type: 'upload',
      required: true,
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'role',
      label: 'Perfil',
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
      required: true,
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'gender',
      label: 'Genero',
      required: true,
      type: 'radio',
      options: ['masculino', 'feminino'],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'groups',
      label: 'Grupos',
      required: true,
      type: 'relationship',
      relationTo: ['groups', 'group-categories'],
      hasMany: true,
      filterOptions: ({ siblingData, relationTo }) => {
        const parentGroup = siblingData as User

        if (relationTo === 'group-categories') {
          return {
            parent: { in: parentGroup?.groups.map((g) => g.value) },
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
      label: 'Data de nascimento',
      required: true,
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'disability',
      label: 'Categoria Deficiência',
      required: true,
      type: 'select',
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
      label: 'Quer ser Federado?',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'heardAboutClub',
      label: 'Ficou a saber do clube através:',
      type: 'select',
      options: ['Internet', 'Amigos', 'Escola Swim4Fun', 'Outros'],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'Address',
      label: 'Morada',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'street',
              label: 'Rua',
              required: true,
              type: 'text',
              admin: {
                width: '45%',
              },
            },
            {
              name: 'number',
              label: 'Nº Porta',
              required: true,
              type: 'text',
              admin: {
                width: '15%',
              },
            },
            {
              name: 'state',
              label: 'Localidade',
              required: true,
              type: 'text',
              admin: {
                width: '20%',
              },
            },
            {
              name: 'zipcode',
              label: 'Código Postal',
              required: true,
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
