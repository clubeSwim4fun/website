import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import COUNTRY_LIST from '@/utilities/countryList'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

import { User } from '@/payload-types'
import { anyone } from '@/access/anyone'
import autoIncrement from './hooks/autoIncrement'
import saveFederationHistory from './hooks/federationHistory'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    plural: {
      en: 'Users',
      pt: 'Utilizadores',
    },
    singular: {
      en: 'User',
      pt: 'Utilizador',
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
    defaultColumns: ['name', 'status', 'email', 'role', 'groups', 'createdAt', 'updatedAt'],
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
      name: 'associateId',
      label: {
        en: 'Associate ID',
        pt: 'Sócio ID',
      },
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'federationId',
      label: {
        en: 'Federation ID',
        pt: 'ID da Federação',
      },
      type: 'number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'profilePicture',
      label: {
        en: 'Profile picture',
        pt: 'Foto do Perfil',
      },
      type: 'upload',
      relationTo: 'user-media',
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
      type: 'relationship',
      relationTo: 'gender',
      hasMany: false,
      admin: {
        position: 'sidebar',
        allowCreate: false,
        allowEdit: false,
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
      filterOptions: async ({ siblingData, relationTo }) => {
        const parentGroup = siblingData as User

        if (relationTo === 'group-categories') {
          if (parentGroup && parentGroup.groups && parentGroup.groups.length > 0) {
            return {
              parent: { in: parentGroup?.groups?.map((g) => g.value) },
            }
          }
          return false
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
      type: 'relationship',
      relationTo: 'disability',
      hasMany: true,
      admin: {
        position: 'sidebar',
        allowCreate: false,
        allowEdit: false,
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
        en: 'Heard about the Club through:',
        pt: 'Ficou a saber do clube através:',
      },
      type: 'relationship',
      relationTo: 'aboutClub',
      admin: {
        position: 'sidebar',
        allowCreate: false,
        allowEdit: false,
      },
    },
    {
      name: 'status',
      label: {
        en: 'Account status',
        pt: 'Estado da conta',
      },
      type: 'select',
      defaultValue: 'pendingPayment',
      options: [
        {
          label: {
            en: 'Active',
            pt: 'Ativo',
          },
          value: 'active',
        },
        {
          label: {
            en: 'Pending payment',
            pt: 'Pagamento pendente',
          },
          value: 'pendingPayment',
        },
        {
          label: {
            en: 'Expired',
            pt: 'Expirado',
          },
          value: 'expired',
        },
      ],
      admin: {
        position: 'sidebar',
        // readOnly: true,
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
  hooks: {
    beforeChange: [autoIncrement, saveFederationHistory],
  },
  timestamps: true,
}
