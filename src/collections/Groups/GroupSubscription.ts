import { CollectionConfig } from 'payload'

export const GroupSubscription: CollectionConfig = {
  slug: 'group-subscription',
  labels: {
    singular: {
      en: 'Group Subscription Request',
      pt: 'Pedido de Assinatura de Grupo',
    },
    plural: {
      en: 'Group Subscription Requests',
      pt: 'Pedidos de Assinatura de Grupo',
    },
  },
  admin: {
    defaultColumns: ['group', 'user', 'status', 'createdAt'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'group',
          type: 'relationship',
          relationTo: 'groups',
          label: {
            en: 'Group',
            pt: 'Grupo',
          },
          required: true,
          admin: {
            readOnly: true,
            allowEdit: false,
          },
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          label: {
            en: 'User',
            pt: 'Utilizador',
          },
          required: true,
          admin: {
            readOnly: true,
            allowEdit: false,
          },
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: { en: 'Pending', pt: 'Pendente' }, value: 'pending' },
            { label: { en: 'Approved', pt: 'Aprovado' }, value: 'approved' },
            { label: { en: 'Rejected', pt: 'Rejeitado' }, value: 'rejected' },
          ],
          defaultValue: 'pending',
          label: {
            en: 'Status',
            pt: 'Status',
          },
        },
        {
          name: 'transactionId',
          type: 'text',
          label: {
            en: 'SIBS - Transaction ID',
            pt: 'SIBS - ID da Transação',
          },
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      type: 'array',
      name: 'submissionData',
      label: {
        en: 'Submission Data',
        pt: 'Dados da Submissão',
      },
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'field',
          type: 'text',
          label: {
            en: 'Field Name',
            pt: 'Nome do Campo',
          },
        },
        {
          name: 'value',
          type: 'text',
          label: {
            en: 'Field Value',
            pt: 'Valor do Campo',
          },
        },
      ],
    },
  ],
}
