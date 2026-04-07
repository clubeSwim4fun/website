'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { resolveRecipients } from '@/helpers/newsletterHelper'
import { sendEmail } from '@/helpers/emailHelper'
import { render } from '@react-email/components'
import React from 'react'

type SendResult = { success: boolean; message: string }
type PreviewResult = { html: string; estimatedCount: number } | { success: false; message: string }

async function convertContentToHtml(
  content: unknown,
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<string> {
  const { convertLexicalToHTMLAsync, defaultHTMLConvertersAsync } = await import(
    '@payloadcms/richtext-lexical/html-async'
  )
  const { ctaBlockToHtml, postsBlockToHtml, layoutBlockToHtml } = await import(
    '@/blocks/newsletter/htmlConverters'
  )

  return convertLexicalToHTMLAsync({
    converters: {
      ...defaultHTMLConvertersAsync,
      blocks: {
        newsletterCta: async ({ node }) => ctaBlockToHtml(node.fields as Record<string, unknown>),
        newsletterPosts: async ({ node }) =>
          postsBlockToHtml(node.fields as Record<string, unknown>, payload),
        newsletterLayout: async ({ node }) =>
          layoutBlockToHtml(node.fields as Record<string, unknown>, payload),
      },
    },
    data: content as Parameters<typeof convertLexicalToHTMLAsync>[0]['data'],
  })
}

export async function sendNewsletter(newsletterId: string): Promise<SendResult> {
  const { user } = await getMeUser()
  if (!user || user.role !== 'admin') {
    return { success: false, message: 'Unauthorized' }
  }

  const payload = await getPayload({ config })

  const newsletter = await payload.findByID({
    collection: 'newsletters',
    id: newsletterId,
  })

  if (!newsletter) {
    return { success: false, message: 'Newsletter not found' }
  }

  if (newsletter.status === 'sent') {
    return { success: false, message: 'Newsletter already sent' }
  }
  if (!newsletter.subject || newsletter.subject.trim() === '') {
    return { success: false, message: 'Subject is required' }
  }

  // If scheduledAt is in the future, mark as scheduled and return
  const scheduledAt = (newsletter as unknown as { scheduledAt?: string }).scheduledAt
  if (scheduledAt && new Date(scheduledAt) > new Date()) {
    await payload.update({
      collection: 'newsletters',
      id: newsletterId,
      data: { status: 'scheduled' },
    })
    return { success: true, message: 'Newsletter scheduled' }
  }

  const filter = newsletter.recipientFilter ?? {}
  const recipients = await resolveRecipients(
    filter as Parameters<typeof resolveRecipients>[0],
    payload,
  )

  if (recipients.length === 0) {
    return { success: false, message: 'No eligible recipients' }
  }

  let contentHtml: string
  try {
    contentHtml = await convertContentToHtml(newsletter.content, payload)
  } catch (err) {
    payload.logger.error(`[sendNewsletter] Content conversion failed: ${JSON.stringify(err)}`)
    return { success: false, message: 'Failed to convert content to HTML' }
  }

  const { NewsletterEmail } = await import('@/email/newsletter')
  const subject = newsletter.subject

  const recipientRecords: { user: string; email: string; deliveredAt: string }[] = []

  for (const recipient of recipients) {
    try {
      const emailHtml = await render(React.createElement(NewsletterEmail, { subject, contentHtml }))
      await sendEmail({ to: recipient.email, subject, emailHtml })
      recipientRecords.push({
        user: recipient.userId,
        email: recipient.email,
        deliveredAt: new Date().toISOString(),
      })
    } catch (err) {
      payload.logger.error(
        `[sendNewsletter] Email failed: ${JSON.stringify({ newsletterId, userId: recipient.userId })}`,
      )
      recipientRecords.push({
        user: recipient.userId,
        email: recipient.email,
        deliveredAt: new Date().toISOString(),
      })
    }
  }

  await payload.update({
    collection: 'newsletters',
    id: newsletterId,
    data: {
      status: 'sent',
      sentAt: new Date().toISOString(),
      recipientCount: recipients.length,
      recipients: recipientRecords,
    },
  })

  return { success: true, message: 'Newsletter sent' }
}

export async function previewNewsletter(newsletterId: string): Promise<PreviewResult> {
  const { user } = await getMeUser()
  if (!user || user.role !== 'admin') {
    return { success: false, message: 'Unauthorized' }
  }

  const payload = await getPayload({ config })

  const newsletter = await payload.findByID({
    collection: 'newsletters',
    id: newsletterId,
  })

  if (!newsletter) {
    return { success: false, message: 'Newsletter not found' }
  }

  let contentHtml: string
  try {
    contentHtml = await convertContentToHtml(newsletter.content, payload)
  } catch (err) {
    payload.logger.error(`[previewNewsletter] Content conversion failed: ${JSON.stringify(err)}`)
    return { success: false, message: 'Failed to convert content to HTML' }
  }

  const { NewsletterEmail } = await import('@/email/newsletter')
  const subject = newsletter.subject ?? ''

  const html = await render(React.createElement(NewsletterEmail, { subject, contentHtml }))

  const filter = newsletter.recipientFilter ?? {}
  const recipients = await resolveRecipients(
    filter as Parameters<typeof resolveRecipients>[0],
    payload,
  )

  return { html, estimatedCount: recipients.length }
}
