'use server'

import { getMeUser } from '@/utilities/getMeUser'
import { sendEmail } from '@/helpers/emailHelper'
import { render } from '@react-email/components'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Footer } from '@/payload-types'
import { TemplateEmail } from '@/email/template'
import React from 'react'
import type Mail from 'nodemailer/lib/mailer'

export async function submitStory(
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const { user } = await getMeUser()
  if (!user) return { success: false, message: 'Não autenticado.' }

  const title = (formData.get('title') as string)?.trim()
  const text = (formData.get('text') as string)?.trim()

  if (!title || !text) return { success: false, message: 'Título e texto são obrigatórios.' }

  const footer = (await getCachedGlobal('footer', 0, 'pt')()) as Footer
  const contactEmail = footer?.contact?.email
  if (!contactEmail) return { success: false, message: 'Email de contacto não configurado.' }

  const userName = [user.name, user.surname].filter(Boolean).join(' ') || user.email

  // Process uploaded images as attachments
  const imageFiles = formData.getAll('images') as File[]
  const imageAttachments: Mail.Attachment[] = await Promise.all(
    imageFiles
      .filter((f) => f instanceof File && f.size > 0)
      .map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer())
        return {
          filename: file.name,
          content: buffer,
          contentType: file.type,
        } satisfies Mail.Attachment
      }),
  )

  // Build inline image HTML if images were attached
  const imagesHtml =
    imageAttachments.length > 0
      ? imageAttachments
          .map(
            (att) =>
              `<img src="cid:${att.filename}" style="max-width:100%;margin-top:12px;border-radius:8px;" />`,
          )
          .join('')
      : ''

  // Add cid references so nodemailer inlines them
  const inlineAttachments: Mail.Attachment[] = imageAttachments.map((att) => ({
    ...att,
    cid: att.filename as string,
  }))

  const emailHtml = await render(
    React.createElement(
      TemplateEmail,
      { title: `Nova história: ${title}` },
      React.createElement(
        'div',
        null,
        React.createElement('p', null, `De: ${userName} (${user.email})`),
        React.createElement('hr', null),
        React.createElement('p', { style: { whiteSpace: 'pre-wrap' } }, text),
        imagesHtml
          ? React.createElement('div', { dangerouslySetInnerHTML: { __html: imagesHtml } })
          : null,
      ),
    ),
  )

  await sendEmail({
    to: contactEmail,
    cc: user.email,
    subject: `Nova história submetida: ${title}`,
    emailHtml,
    attachments: inlineAttachments,
  })

  return { success: true, message: 'História enviada com sucesso!' }
}
