import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { sendNewsletter, previewNewsletter } from '@/actions/newsletter'

export const Newsletters: CollectionConfig = {
  slug: 'newsletters',
  labels: {
    plural: { en: 'Newsletters', pt: 'Newsletters' },
    singular: { en: 'Newsletter', pt: 'Newsletter' },
  },
  access: {
    create: isAdmin,
    read: isAdminOrEditor,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    livePreview: {
      url: () => `${process.env.NEXT_PUBLIC_SERVER_URL}/newsletter-preview`,
    },
  },
  fields: [
    {
      name: 'sendAction',
      type: 'ui',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.status !== 'sent',
        components: {
          Field: 'src/components/admin/Newsletter/SendButton',
        },
      },
    },
    {
      name: 'subject',
      label: { en: 'Subject', pt: 'Assunto' },
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      label: { en: 'Content', pt: 'Conteúdo' },
      type: 'richText',
      editor: lexicalEditor({}),
    },
    {
      name: 'status',
      label: { en: 'Status', pt: 'Estado' },
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: { en: 'Draft', pt: 'Rascunho' }, value: 'draft' },
        { label: { en: 'Scheduled', pt: 'Agendada' }, value: 'scheduled' },
        { label: { en: 'Sent', pt: 'Enviada' }, value: 'sent' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'scheduledAt',
      label: { en: 'Schedule send', pt: 'Agendar envio' },
      type: 'date',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.status !== 'sent',
        date: { pickerAppearance: 'dayAndTime' },
        description: {
          en: 'Leave empty to send immediately.',
          pt: 'Deixe vazio para enviar imediatamente.',
        },
      },
    },
    {
      name: 'sentAt',
      label: { en: 'Sent at', pt: 'Enviada em' },
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'recipientCount',
      label: { en: 'Recipient count', pt: 'Nº de destinatários' },
      type: 'number',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'recipientFilter',
      label: { en: 'Recipient filter', pt: 'Filtro de destinatários' },
      type: 'group',
      fields: [
        {
          name: 'userIds',
          label: { en: 'Specific users', pt: 'Utilizadores específicos' },
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
        },
        {
          name: 'statuses',
          label: { en: 'Account statuses', pt: 'Estados de conta' },
          type: 'select',
          hasMany: true,
          options: [
            { label: { en: 'Pending analysis', pt: 'Análise pendente' }, value: 'pendingAnalysis' },
            {
              label: { en: 'Pending update', pt: 'Pendente com utilizador' },
              value: 'pendingUpdate',
            },
            { label: { en: 'Pending payment', pt: 'Pagamento pendente' }, value: 'pendingPayment' },
            { label: { en: 'Active', pt: 'Ativo' }, value: 'active' },
            { label: { en: 'Expired', pt: 'Expirado' }, value: 'expired' },
          ],
        },
        {
          name: 'roles',
          label: { en: 'Roles', pt: 'Perfis' },
          type: 'select',
          hasMany: true,
          options: [
            { label: { en: 'Admin', pt: 'Admin' }, value: 'admin' },
            { label: { en: 'Editor', pt: 'Editor' }, value: 'editor' },
            { label: { en: 'Default', pt: 'Padrão' }, value: 'default' },
          ],
        },
        {
          name: 'groups',
          label: { en: 'Groups / categories', pt: 'Grupos / categorias' },
          type: 'relationship',
          relationTo: ['groups', 'group-categories'],
          hasMany: true,
        },
      ],
    },
    {
      name: 'recipients',
      label: { en: 'Recipients', pt: 'Destinatários' },
      type: 'array',
      admin: { readOnly: true },
      fields: [
        {
          name: 'user',
          label: { en: 'User', pt: 'Utilizador' },
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'email',
          label: { en: 'Email', pt: 'Email' },
          type: 'text',
        },
        {
          name: 'deliveredAt',
          label: { en: 'Delivered at', pt: 'Entregue em' },
          type: 'date',
        },
      ],
    },
  ],
  endpoints: [
    {
      path: '/render-preview',
      method: 'post',
      handler: async (req) => {
        try {
          const body = (await req.json?.()) ?? {}
          const { subject, content } = body as { subject?: string; content?: unknown }

          const { convertLexicalToHTMLAsync, defaultHTMLConvertersAsync } = await import(
            '@payloadcms/richtext-lexical/html-async'
          )
          const { render } = await import('@react-email/components')
          const React = await import('react')
          const { NewsletterEmail } = await import('@/email/newsletter')

          const contentHtml = content
            ? await convertLexicalToHTMLAsync({
                converters: { ...defaultHTMLConvertersAsync, unknown: async () => '' },
                data: content as Parameters<typeof convertLexicalToHTMLAsync>[0]['data'],
              })
            : ''

          const html = await render(
            React.default.createElement(NewsletterEmail, {
              subject: subject ?? '',
              contentHtml,
            }),
          )

          return Response.json({ html })
        } catch (err) {
          return Response.json({ error: String(err) }, { status: 500 })
        }
      },
    },
    {
      path: '/:id/send',
      method: 'post',
      handler: async (req) => {
        const id = req.routeParams?.id as string
        const result = await sendNewsletter(id)
        if (!result.success) {
          const status = result.message === 'Unauthorized' ? 401 : 400
          return Response.json(result, { status })
        }
        return Response.json(result)
      },
    },
    {
      path: '/:id/preview',
      method: 'get',
      handler: async (req) => {
        const id = req.routeParams?.id as string
        const result = await previewNewsletter(id)
        if ('success' in result && !result.success) {
          const status = result.message === 'Unauthorized' ? 401 : 400
          return Response.json(result, { status })
        }
        return Response.json(result)
      },
    },
  ],
  timestamps: true,
}
