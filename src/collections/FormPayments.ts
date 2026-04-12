import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

export const FormPayments: CollectionConfig = {
  slug: 'form-payments',
  labels: {
    singular: { en: 'Form Payment', pt: 'Pagamento de Formulário' },
    plural: { en: 'Form Payments', pt: 'Pagamentos de Formulário' },
  },
  access: {
    create: authenticated,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  admin: {
    defaultColumns: ['form', 'user', 'paymentStatus', 'amount', 'createdAt'],
    useAsTitle: 'id',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'form',
          type: 'relationship',
          relationTo: 'forms',
          required: true,
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'paymentStatus',
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: { en: 'Pending', pt: 'Pendente' }, value: 'pending' },
            { label: { en: 'Paid', pt: 'Pago' }, value: 'paid' },
            { label: { en: 'Failed', pt: 'Falhado' }, value: 'failed' },
          ],
          admin: { width: '33%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'amount',
          type: 'number',
          label: { en: 'Amount (EUR)', pt: 'Valor (EUR)' },
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'stripePaymentIntentId',
          type: 'text',
          label: { en: 'Stripe Payment Intent ID', pt: 'ID do Pagamento Stripe' },
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'assignToGroup',
          type: 'relationship',
          relationTo: ['groups', 'group-categories'],
          label: { en: 'Assigned Group/Subgroup', pt: 'Grupo/Subgrupo Atribuído' },
          admin: { readOnly: true, width: '33%' },
        },
      ],
    },
    {
      name: 'submissionData',
      type: 'array',
      label: { en: 'Submission Data', pt: 'Dados da Submissão' },
      admin: { readOnly: true },
      fields: [
        { name: 'field', type: 'text' },
        { name: 'value', type: 'text' },
      ],
    },
  ],
  timestamps: true,
}
