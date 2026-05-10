'use client'
import React, { useCallback, useEffect, useRef } from 'react'
import { T } from '../tokens'

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  withUndo?: boolean
  onUndo?: () => void
}

interface ToastProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

function Toast({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), toast.withUndo ? 5000 : 3000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, toast.withUndo, onRemove])

  const borderColor = toast.type === 'success' ? T.green : toast.type === 'error' ? T.red : T.blue
  const icon = toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'
  const sub =
    toast.type === 'success' ? 'Action completed' : toast.type === 'error' ? 'Please try again' : ''

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: T.bgRaised,
        border: `1px solid ${T.borderDefault}`,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: T.rMd,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: 280,
        maxWidth: 360,
        animation: 'acToastIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes acToastIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{toast.message}</div>
        {sub && <div style={{ fontSize: 11, color: T.textMuted }}>{sub}</div>}
      </div>
      {toast.withUndo && toast.onUndo && (
        <button
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current)
            toast.onUndo?.()
            onRemove(toast.id)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: T.teal,
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 3,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Undo
        </button>
      )}
    </div>
  )
}

export default function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 9999,
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

export function useToasts() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const addToast = useCallback(
    (
      message: string,
      type: ToastItem['type'] = 'success',
      opts?: { withUndo?: boolean; onUndo?: () => void },
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      setToasts((prev) => [...prev, { id, message, type, ...opts }])
    },
    [],
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
