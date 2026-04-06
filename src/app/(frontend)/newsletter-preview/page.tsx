'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { useEffect, useRef, useState } from 'react'

type NewsletterData = {
  id?: string
  subject?: string
  content?: unknown
}

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

export default function NewsletterPreviewPage() {
  const { data } = useLivePreview<NewsletterData>({
    serverURL,
    depth: 1,
    initialData: {},
  })

  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevDataRef = useRef<string>('')

  useEffect(() => {
    const serialized = JSON.stringify({ subject: data?.subject, content: data?.content })
    if (serialized === prevDataRef.current) return
    prevDataRef.current = serialized

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/newsletters/render-preview', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: data?.subject, content: data?.content }),
        })
        const result = await res.json()
        if ('html' in result) {
          setHtml(result.html)
        } else {
          setError(result.error ?? 'Preview failed')
        }
      } catch {
        setError('Failed to load preview')
      } finally {
        setLoading(false)
      }
    }, 600)
  }, [data])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            background: '#2D6CB3',
            color: 'white',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            fontSize: '13px',
            zIndex: 9999,
          }}
        >
          Updating...
        </div>
      )}
      {error && <p style={{ color: '#f44336', fontFamily: 'Arial, sans-serif' }}>{error}</p>}
      {!html && !loading && !error && (
        <p style={{ color: '#888', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
          Start editing to see the preview...
        </p>
      )}
      {html && (
        <div
          style={{ maxWidth: '660px', margin: '0 auto' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  )
}
