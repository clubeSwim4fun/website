import type { CollectionConfig, Payload, PayloadComponent } from 'payload'

import { authenticated } from '../../access/authenticated'
import COUNTRY_LIST from '@/utilities/countryList'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

import { User } from '@/payload-types'
import { anyone } from '@/access/anyone'
import autoIncrement from './hooks/autoIncrement'
import saveFederationHistory from './hooks/federationHistory'
import { sendEmail } from '@/helpers/emailHelper'
import React from 'react'
import { render } from '@react-email/components'
import { UserRegistration } from '@/email/userRegistration'
import { getTranslations } from 'next-intl/server'

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
    components: {
      beforeListTable: ['src/components/admin/AnnualReset/ResetButton'],
    },
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
          hasMany: true,
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
        pt: 'Género',
      },
      type: 'select',
      options: [
        { label: { en: 'Male', pt: 'Masculino' }, value: 'male' },
        { label: { en: 'Female', pt: 'Feminino' }, value: 'female' },
        { label: { en: 'Other', pt: 'Outro' }, value: 'other' },
        { label: { en: 'Prefer not to say', pt: 'Prefiro não dizer' }, value: 'not_specified' },
      ],
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
      name: 'emailNotificationsEnabled',
      label: {
        en: 'Email notifications',
        pt: 'Notificações por email',
      },
      type: 'checkbox',
      defaultValue: false,
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
      name: 'emergencyContact',
      label: {
        en: 'Emergency Contact Name',
        pt: 'Contato de Emergência',
      },
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'emergencyPhone',
      label: {
        en: 'Emergency Phone',
        pt: 'Telefone de Emergência',
      },
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'wantsInvoiceWithNif',
      label: {
        en: 'Wants invoice with NIF?',
        pt: 'Fatura com Contribuinte?',
      },
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sportInsurance',
      label: {
        en: 'Sport Insurance',
        pt: 'Seguro Desportivo',
      },
      type: 'select',
      options: [
        { label: { en: 'None', pt: 'Nenhuma' }, value: 'none' },
        {
          label: { en: 'FPN (Swimming Federation)', pt: 'FPN (Federação Portuguesa de Natação)' },
          value: 'fpn',
        },
        {
          label: { en: 'FPT (Triathlon Federation)', pt: 'FPT (Federação Portuguesa de Triatlo)' },
          value: 'fpt',
        },
      ],
      defaultValue: 'none',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tshirtSize',
      label: {
        en: 'T-shirt size',
        pt: 'Tamanho de T-shirt',
      },
      type: 'select',
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
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
      name: 'mustResetPassword',
      label: {
        en: 'Must reset password on next login',
        pt: 'Deve redefinir a senha no próximo login',
      },
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      label: {
        en: 'Account status',
        pt: 'Estado da conta',
      },
      type: 'select',
      defaultValue: 'pendingAnalysis',
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
            en: 'Pending analysis',
            pt: 'Análise pendente',
          },
          value: 'pendingAnalysis',
        },
        {
          label: {
            en: 'Pending user update',
            pt: 'Pendente com utilizador',
          },
          value: 'pendingUpdate',
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
      name: 'validated',
      type: 'ui',
      label: {
        en: 'Validate User',
        pt: 'Valide Utilizador',
      },
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => {
          return siblingData.status === 'pendingAnalysis'
        },
        components: {
          Field: 'src/components/admin/ValidateUser/ValidationControls',
        },
      },
    },
    {
      name: 'fieldsToUpdate',
      type: 'select',
      options: [
        {
          value: 'nationality',
          label: {
            en: 'Nationality',
            pt: 'Nacionalidade',
          },
        },
        {
          value: 'phoneNumber',
          label: {
            en: 'Phone',
            pt: 'Telemóvel',
          },
        },
        {
          value: 'identityCardNumber',
          label: {
            en: 'identity card number',
            pt: 'Nº Documento Identificação',
          },
        },
        {
          value: 'identityCardFile',
          label: {
            en: 'Identity card copy',
            pt: 'Fotocópia do Documento Identificação',
          },
        },
        {
          value: 'profilePicture',
          label: {
            en: 'Profile picture',
            pt: 'Foto do Perfil',
          },
        },
        {
          value: 'nif',
          label: {
            en: 'NIF',
            pt: 'NIF',
          },
        },
        {
          value: 'disability',
          label: {
            en: 'Disabilities',
            pt: 'Categorias de Deficiência',
          },
        },
        {
          value: 'phoneNumber',
          label: {
            en: 'Phone number',
            pt: 'Número de telefone',
          },
        },
        {
          value: 'gender',
          label: {
            en: 'Gender',
            pt: 'Genero',
          },
        },
        {
          value: 'address',
          label: {
            en: 'Address',
            pt: 'Morada',
          },
        },
        {
          value: 'emergencyContact',
          label: {
            en: 'Emergency Contact',
            pt: 'Contato de Emergência',
          },
        },
        {
          value: 'emergencyPhone',
          label: {
            en: 'Emergency Phone',
            pt: 'Telefone de Emergência',
          },
        },
        {
          value: 'tshirtSize',
          label: {
            en: 'T-shirt size',
            pt: 'Tamanho de T-shirt',
          },
        },
      ],
      hasMany: true,
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => {
          return siblingData.status === 'pendingAnalysis'
        },
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
    beforeChange: [
      autoIncrement,
      saveFederationHistory,
      ({ data }) => {
        // Normalize legacy ObjectId-based gender values to new select strings
        if (data.gender && typeof data.gender === 'object') {
          const GENDER_OBJECT_ID_MAP: Record<string, string> = {
            '69e3bca4afec338d8efe7aa1': 'male',
            '69e3bca4afec338d8efe7aa2': 'female',
          }
          let hex: string | undefined
          if (Buffer.isBuffer(data.gender)) {
            hex = data.gender.toString('hex')
          } else if (data.gender.buffer) {
            hex = Buffer.from(data.gender.buffer).toString('hex')
          } else if (typeof data.gender.toHexString === 'function') {
            hex = data.gender.toHexString()
          }
          if (hex) data.gender = GENDER_OBJECT_ID_MAP[hex] ?? 'not_specified'
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation }) => {
        const t = await getTranslations({ locale: 'pt', namespace: 'Email' })

        if (operation === 'update' && doc.status !== previousDoc?.status) {
          if (doc.status === 'pendingUpdate' || doc.status === 'pendingPayment') {
            // Send email to user to update their information
            const emailHtml = await render(React.createElement(UserRegistration, { user: doc }))

            await sendEmail({
              emailHtml,
              subject: t(
                `${doc.status === 'pendingUpdate' ? 'FixRegistration' : 'RegistrationPayment'}.subject`,
              ),
              to: doc.email,
            })
          }
        }
      },
    ],
  },
  timestamps: true,
}
