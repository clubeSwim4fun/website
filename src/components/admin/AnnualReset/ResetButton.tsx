'use client'

import React, { useState } from 'react'
import { useAuth, useTranslation } from '@payloadcms/ui'
import { performAnnualReset } from '@/actions/annualReset'
import { ConfirmationDialog } from './ConfirmationDialog'

const labels = {
  en: {
    button: '🔄 Annual Membership Reset',
    fetchError: 'Could not fetch the number of affected members. Please try again.',
    resetFailed: (msg: string) => `❌ Reset failed: ${msg}`,
    resetSuccess: (count: number) =>
      `✅ Annual reset complete — ${count} member(s) set to pending payment.`,
  },
  pt: {
    button: '🔄 Renovação Anual de Membros',
    fetchError: 'Não foi possível obter o número de membros afetados. Por favor tente novamente.',
    resetFailed: (msg: string) => `❌ Renovação falhou: ${msg}`,
    resetSuccess: (count: number) =>
      `✅ Renovação anual concluída — ${count} membro(s) definidos como pagamento pendente.`,
  },
}

type FeedbackState = { type: 'success' | 'error'; message: string } | null

export default function ResetButton() {
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const lang = i18n.language === 'pt' ? 'pt' : 'en'
  const t = labels[lang]

  const [open, setOpen] = useState(false)
  const [affectedCount, setAffectedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  if (!user || (user as any).role !== 'admin') {
    return null
  }

  const handleButtonClick = async () => {
    setFeedback(null)
    try {
      const res = await fetch('/api/users?where[status][in]=active,expired&limit=0', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch user count')
      const data = await res.json()
      setAffectedCount(data.totalDocs ?? 0)
      setOpen(true)
    } catch {
      setFeedback({ type: 'error', message: t.fetchError })
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const result = await performAnnualReset()
      setOpen(false)
      if (result.success) {
        setFeedback({ type: 'success', message: t.resetSuccess(result.updatedCount ?? 0) })
      } else {
        setFeedback({ type: 'error', message: t.resetFailed(result.message) })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        type="button"
        onClick={handleButtonClick}
        style={{
          backgroundColor: '#b91c1c',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.875rem',
          border: 'none',
        }}
      >
        {t.button}
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

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        affectedCount={affectedCount}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </div>
  )
}
