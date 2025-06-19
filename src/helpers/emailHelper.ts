'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Header, Media } from '@/payload-types'
import fetch from 'node-fetch'
import Mail from 'nodemailer/lib/mailer'

export const getLogo = async () => {
  const globals = (await getCachedGlobal('header', 1, 'pt')()) as Header
  return globals.logo
}

export const generateBase64Image = async (relativePath: string): Promise<string> => {
  try {
    // Construct the public URL
    const publicURL = `${process.env.NEXT_PUBLIC_SERVER_URL}/${relativePath}`

    // Fetch the image data
    const response = await fetch(publicURL)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    // Get the image buffer
    const imageBuffer = await response.buffer()

    // Convert the buffer to a Base64 string
    const base64String = `${imageBuffer.toString('base64')}`

    return base64String
  } catch (error) {
    console.error('Error generating Base64 image:', error)
    return ''
  }
}

export async function sendEmail({
  emailHtml,
  to,
  cc,
  subject,
  attachments,
}: {
  emailHtml: string
  to: string | string[]
  subject: string
  attachments?: Mail.Attachment[]
  cc?: string | string[]
}) {
  const payload = await getPayload({ config })
  const logo = (await getLogo()) as Media

  const email = await payload.sendEmail({
    subject,
    to,
    cc,
    html: emailHtml,
    attachments: [
      {
        filename: 'logo.png', // File name as it should appear in the email
        content: await generateBase64Image(logo?.thumbnailURL || ''), // Attach the buffer data
        encoding: 'base64',
        cid: 'logo', // Content ID (matches the "cid" in the email HTML)
      },
      ...(attachments || []),
    ],
  })
}

export async function replaceFields(
  input: string,
  submissionData: Record<string, { value: string }>,
): Promise<string> {
  const fieldRegex = /\{(\w+)\}/g // Regular expression to find {field}

  return input.replace(fieldRegex, (match, fieldName) => {
    const field = submissionData[fieldName]
    return field ? field.value : match
  })
}
