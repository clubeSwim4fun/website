import React from 'react'
import { TemplateEmail } from '@/email/template'

type Props = {
  subject: string
  contentHtml: string
}

export async function NewsletterEmail({ subject, contentHtml }: Props) {
  return <TemplateEmail title={subject}>{contentHtml}</TemplateEmail>
}
