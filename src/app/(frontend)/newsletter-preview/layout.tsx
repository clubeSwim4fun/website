import React from 'react'

export default function NewsletterPreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ margin: 0, padding: 0, background: '#f5f5f5' }}>{children}</body>
    </html>
  )
}
