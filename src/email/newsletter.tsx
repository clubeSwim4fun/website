import React from 'react'
import { TemplateEmail } from '@/email/template'
import { NewsletterFooter } from '@/email/newsletterFooter'

type Props = {
  subject: string
  contentHtml: string
  trackingToken?: string
}

export async function NewsletterEmail({ subject, contentHtml, trackingToken }: Props) {
  // Use a placeholder token for preview so the footer always renders
  const footerToken = trackingToken ?? 'preview'

  return (
    <TemplateEmail title={subject}>
      <main dangerouslySetInnerHTML={{ __html: contentHtml }} />
      <NewsletterFooter trackingToken={footerToken} />
    </TemplateEmail>
  )
}
