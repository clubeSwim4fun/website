'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useField, useTranslation } from '@payloadcms/ui'

const labels = {
  en: {
    send: 'Send Now',
    schedule: 'Schedule Send',
    sending: 'Sending...',
    confirm: 'Are you sure you want to send this newsletter? This cannot be undone.',
    confirmScheduled: (date: string) =>
      `Schedule this newsletter to be sent on ${date}? This cannot be undone.`,
    saveFirst: 'Save the newsletter before sending.',
  },
  pt: {
    send: 'Enviar Agora',
    schedule: 'Agendar Envio',
    sending: 'A enviar...',
    confirm: 'Tem a certeza que quer enviar esta newsletter? Esta ação não pode ser desfeita.',
    confirmScheduled: (date: string) =>
      `Agendar esta newsletter para ${date}? Esta ação não pode ser desfeita.`,
    saveFirst: 'Guarde a newsletter antes de enviar.',
  },
}

const SendNewsletterButton: React.FC<{ path: string }> = () => {
  const { id } = useDocumentInfo()
  const { value: scheduledAt } = useField<string>({ path: 'scheduledAt' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const trans = useTranslation()
  const lang = (trans.i18n.language as 'pt' | 'en') ?? 'en'
  const t = labels[lang] ?? labels.en

  const isDisabled = !id || loading
  const isScheduled = !!scheduledAt

  const confirmMessage = isScheduled
    ? t.confirmScheduled(new Date(scheduledAt).toLocaleString(lang === 'pt' ? 'pt-PT' : 'en-GB'))
    : t.confirm

  const handleSend = async () => {
    if (isDisabled) return
    if (!window.confirm(confirmMessage)) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`/api/newsletters/${id}/send`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      setResult(data)
      if (data.success) {
        window.location.reload()
      }
    } catch {
      setResult({ success: false, message: 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
      <button
        type="button"
        onClick={handleSend}
        disabled={isDisabled}
        title={!id ? t.saveFirst : undefined}
        style={{
          backgroundColor: isDisabled ? '#888' : '#2D6CB3',
          color: 'white',
          padding: '0.6rem 1rem',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          borderRadius: '4px',
          border: 'none',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        {loading ? t.sending : isScheduled ? t.schedule : t.send}
      </button>
      {result && (
        <p style={{ margin: 0, fontSize: '13px', color: result.success ? '#4CAF50' : '#f44336' }}>
          {result.message}
        </p>
      )}
    </div>
  )
}

export default SendNewsletterButton
