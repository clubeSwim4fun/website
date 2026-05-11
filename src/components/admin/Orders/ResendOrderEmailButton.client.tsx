'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useAuth, useTranslation } from '@payloadcms/ui'
import { resendOrderConfirmationEmail } from '@/actions/resendOrderEmail'

type FeedbackState = { type: 'success' | 'error'; message: string } | null

const labels = {
  en: { button: '✉️ Resend confirmation email', sending: 'Sending…' },
  pt: { button: '✉️ Reenviar email de confirmação', sending: 'A enviar…' },
}

export default function ResendOrderEmailButton() {
  const { id } = useDocumentInfo()
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const lang = i18n.language === 'pt' ? 'pt' : 'en'
  const t = labels[lang]

  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  if (!user || (user as any).role !== 'admin') return null
  if (!id) return null

  const handleClick = async () => {
    setLoading(true)
    setFeedback(null)
    try {
      const result = await resendOrderConfirmationEmail(String(id))
      setFeedback({ type: result.success ? 'success' : 'error', message: result.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          backgroundColor: '#1d4ed8',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '0.875rem',
          border: 'none',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? t.sending : t.button}
      </button>

      {feedback && (
        <p
          style={{
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
          }}
        >
          {feedback.message}
        </p>
      )}
    </div>
  )
}
