'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { resolveRecipients } from '@/helpers/newsletterHelper'
import { sendEmail } from '@/helpers/emailHelper'
import { render } from '@react-email/components'
import React from 'react'
import { randomBytes } from 'crypto'

function generateToken(): string {
  return randomBytes(16).toString('hex')
}

function injectTracking(contentHtml: string, recipientToken: string, baseUrl: string): string {
  const trackBase = `${baseUrl}/api/newsletter/track`

  // Rewrite all <a href="..."> links to tracked redirect URLs
  const withTrackedLinks = contentHtml.replace(
    /<a\s([^>]*?)href="([^"]+)"([^>]*?)>/gi,
    (match, before, url, after) => {
      // Skip mailto: and already-tracked links
      if (url.startsWith('mailto:') || url.includes('/api/newsletter/track/')) return match
      const encoded = encodeURIComponent(url)
      const trackedUrl = `${trackBase}/click?token=${recipientToken}&url=${encoded}`
      return `<a ${before}href="${trackedUrl}"${after}>`
    },
  )

  // Append tracking pixel
  const pixel = `<img src="${trackBase}/open?token=${recipientToken}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`
  return withTrackedLinks + pixel
}

type SendResult = { success: boolean; message: string }
type PreviewResult = { html: string; estimatedCount: number } | { success: false; message: string }

async function convertContentToHtml(
  content: unknown,
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<string> {
  const { convertLexicalToHTMLAsync, defaultHTMLConvertersAsync } = await import(
    '@payloadcms/richtext-lexical/html-async'
  )
  const { ctaBlockToHtml, postsBlockToHtml, layoutBlockToHtml, buildLinkConverters } = await import(
    '@/blocks/newsletter/htmlConverters'
  )

  return convertLexicalToHTMLAsync({
    converters: {
      ...defaultHTMLConvertersAsync,
      ...buildLinkConverters(),
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
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  const recipientRecords: {
    user: string
    email: string
    deliveredAt: string
    trackingToken: string
    openCount: number
    clickCount: number
  }[] = []

  for (const recipient of recipients) {
    try {
      const token = generateToken()
      const trackedContentHtml = injectTracking(contentHtml, token, baseUrl)
      const emailHtml = await render(
        React.createElement(NewsletterEmail, { subject, contentHtml: trackedContentHtml }),
      )
      await sendEmail({ to: recipient.email, subject, emailHtml })
      recipientRecords.push({
        user: recipient.userId,
        email: recipient.email,
        deliveredAt: new Date().toISOString(),
        trackingToken: token,
        openCount: 0,
        clickCount: 0,
      })
    } catch (err) {
      payload.logger.error(
        `[sendNewsletter] Email failed: ${JSON.stringify({ newsletterId, userId: recipient.userId })}`,
      )
      recipientRecords.push({
        user: recipient.userId,
        email: recipient.email,
        deliveredAt: new Date().toISOString(),
        trackingToken: generateToken(),
        openCount: 0,
        clickCount: 0,
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
