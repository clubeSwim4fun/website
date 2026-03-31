'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@payloadcms/ui'

const CONFIRMATION_PHRASE = 'RESET'

const labels = {
  en: {
    title: '⚠️ Annual Membership Reset',
    description: (count: number) =>
      `This will reset ${count} member(s) with status active or expired back to pendingPayment.`,
    warning: 'Each affected member will receive a renewal email. This action cannot be undone.',
    inputLabel: `Type ${CONFIRMATION_PHRASE} to confirm`,
    cancel: 'Cancel',
    confirm: 'Confirm Reset',
    confirming: '⏳ Resetting...',
  },
  pt: {
    title: '⚠️ Renovação Anual de Membros',
    description: (count: number) =>
      `Isto irá redefinir ${count} membro(s) com estado ativo ou expirado para pagamento pendente.`,
    warning:
      'Cada membro afetado receberá um e-mail de renovação. Esta ação não pode ser desfeita.',
    inputLabel: `Digite ${CONFIRMATION_PHRASE} para confirmar`,
    cancel: 'Cancelar',
    confirm: 'Confirmar Renovação',
    confirming: '⏳ A renovar...',
  },
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  affectedCount: number
  onConfirm: () => Promise<void>
  isLoading: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  affectedCount,
  onConfirm,
  isLoading,
}: Props) {
  const [inputValue, setInputValue] = useState('')
  const { i18n } = useTranslation()
  const lang = i18n.language === 'pt' ? 'pt' : 'en'
  const t = labels[lang]

  useEffect(() => {
    if (!open) setInputValue('')
  }, [open])

  if (!open) return null

  const isConfirmEnabled = inputValue === CONFIRMATION_PHRASE && !isLoading

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLoading && e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  const handleConfirm = async () => {
    await onConfirm()
    setInputValue('')
  }

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '480px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#b91c1c' }}>
          {t.title}
        </h2>

        <div style={{ fontSize: '0.9rem', color: '#111827', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 0.5rem' }}>{t.description(affectedCount)}</p>
          <p style={{ margin: 0 }}>{t.warning}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label
            htmlFor="annual-reset-confirm"
            style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}
          >
            {t.inputLabel}
          </label>
          <input
            id="annual-reset-confirm"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={CONFIRMATION_PHRASE}
            disabled={isLoading}
            autoComplete="off"
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.875rem',
              outline: 'none',
              color: '#111827',
              backgroundColor: '#fff',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              color: '#111827',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isConfirmEnabled ? '#b91c1c' : '#fca5a5',
              color: '#fff',
              cursor: isConfirmEnabled ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {isLoading ? t.confirming : t.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
