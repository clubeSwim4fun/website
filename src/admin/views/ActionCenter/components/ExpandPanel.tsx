'use client'
import React from 'react'
import { T } from '../tokens'

interface ExpandPanelProps {
  colSpan: number
  children: React.ReactNode
}

export function ExpandPanel({ colSpan, children }: ExpandPanelProps) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 0, borderBottom: `1px solid ${T.borderDefault}` }}>
        <div
          style={{
            background: T.bgBase,
            borderTop: `1px solid ${T.borderDefault}`,
            padding: '20px 24px',
            animation: 'acSlideDown 0.15s ease',
          }}
        >
          <style>{`
            @keyframes acSlideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {children}
        </div>
      </td>
    </tr>
  )
}

export function PanelCols({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  )
}

export function PanelBox({
  title,
  children,
  scrollable,
}: {
  title: string
  children: React.ReactNode
  scrollable?: boolean
}) {
  return (
    <div
      style={{
        background: T.bgRaised,
        border: `1px solid ${T.borderSubtle}`,
        borderRadius: T.rMd,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: T.textMuted,
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: `1px solid ${T.borderSubtle}`,
          flexShrink: 0,
        }}
      >
        {title}
      </div>
      <div
        style={{
          overflowY: scrollable ? 'auto' : 'visible',
          maxHeight: scrollable ? 280 : undefined,
          scrollbarWidth: 'thin',
          scrollbarColor: `${T.bgActive} transparent`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function PanelField({
  label,
  value,
  highlight,
  valueColor,
}: {
  label: string
  value: React.ReactNode
  highlight?: boolean
  valueColor?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        padding: '5px 0',
        borderBottom: `1px solid ${T.borderSubtle}`,
      }}
    >
      <span style={{ fontSize: 11, color: T.textMuted, flexShrink: 0 }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          color: valueColor ?? (highlight ? T.textPrimary : T.textSecondary),
          textAlign: 'right',
          fontFamily: highlight ? "'DM Sans', sans-serif" : "'Geist Mono', monospace",
        }}
      >
        {value ?? '—'}
      </span>
    </div>
  )
}

export function DecisionSection({
  decision,
  onDecisionChange,
  rejectionFields,
  selectedFields,
  onFieldToggle,
  note,
  onNoteChange,
  onApprove,
  onReject,
  onCancel,
  loading,
  concurrencyWarning,
}: {
  decision: 'approve' | 'reject' | null
  onDecisionChange: (d: 'approve' | 'reject') => void
  rejectionFields: { value: string; label: string }[]
  selectedFields: string[]
  onFieldToggle: (f: string) => void
  note: string
  onNoteChange: (n: string) => void
  onApprove: () => void
  onReject: () => void
  onCancel: () => void
  loading: boolean
  concurrencyWarning?: string | null
}) {
  return (
    <div
      style={{
        background: T.bgRaised,
        border: `1px solid ${T.borderSubtle}`,
        borderRadius: T.rMd,
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: T.textMuted,
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: `1px solid ${T.borderSubtle}`,
        }}
      >
        Decision
      </div>

      {concurrencyWarning && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            background: T.amberDim,
            borderRadius: T.rSm,
            fontSize: 11,
            color: T.amber,
            marginBottom: 12,
            border: `1px solid ${T.amberBorder}`,
          }}
        >
          ⚠ {concurrencyWarning}
        </div>
      )}

      {/* Radio options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {(['approve', 'reject'] as const).map((opt) => {
          const selected = decision === opt
          return (
            <label
              key={opt}
              onClick={() => onDecisionChange(opt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: T.rSm,
                cursor: 'pointer',
                background: selected ? T.tealDim : 'transparent',
                border: `1px solid ${selected ? T.tealBorder : 'transparent'}`,
                transition: 'all 0.1s',
              }}
            >
              <div
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                  border: `2px solid ${selected ? T.teal : T.borderStrong}`,
                  background: selected ? T.teal : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {selected && (
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#001a18',
                    }}
                  />
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, color: T.textPrimary, fontWeight: 500 }}>
                  {opt === 'approve' ? 'Approve' : 'Reject'}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted }}>
                  {opt === 'approve'
                    ? 'User proceeds to payment — confirmation email sent'
                    : 'Select fields that need correction below'}
                </div>
              </div>
            </label>
          )
        })}
      </div>

      {/* Rejection fields */}
      {decision === 'reject' && (
        <div
          style={{
            background: T.bgActive,
            borderRadius: T.rSm,
            padding: '10px 12px',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: T.textMuted,
              marginBottom: 8,
            }}
          >
            Fields to fix
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 4,
            }}
          >
            {rejectionFields.map((f) => (
              <label
                key={f.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  padding: '5px 6px',
                  borderRadius: T.rSm,
                  fontSize: 12,
                  color: T.textSecondary,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedFields.includes(f.value)}
                  onChange={() => onFieldToggle(f.value)}
                  style={{ accentColor: T.teal, width: 13, height: 13, cursor: 'pointer' }}
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Optional note to user (included in notification email)…"
        style={{
          width: '100%',
          background: T.bgActive,
          border: `1px solid ${T.borderDefault}`,
          borderRadius: T.rSm,
          color: T.textSecondary,
          fontSize: 12,
          fontFamily: "'DM Sans', sans-serif",
          padding: '8px 10px',
          resize: 'vertical',
          minHeight: 56,
          outline: 'none',
          marginBottom: 12,
          boxSizing: 'border-box',
        }}
      />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '7px 14px',
            background: 'none',
            border: `1px solid ${T.borderDefault}`,
            borderRadius: T.rSm,
            color: T.textMuted,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onReject}
          disabled={loading || decision !== 'reject' || selectedFields.length === 0}
          style={{
            padding: '7px 16px',
            background: T.redDim,
            border: `1px solid ${T.redBorder}`,
            borderRadius: T.rSm,
            color: T.red,
            fontSize: 12,
            fontWeight: 700,
            cursor:
              decision !== 'reject' || selectedFields.length === 0 ? 'not-allowed' : 'pointer',
            opacity: decision !== 'reject' || selectedFields.length === 0 ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          ✕ Reject
        </button>
        <button
          onClick={onApprove}
          disabled={loading || decision !== 'approve'}
          style={{
            padding: '7px 16px',
            background: T.teal,
            border: `1px solid ${T.teal}`,
            borderRadius: T.rSm,
            color: '#001a18',
            fontSize: 12,
            fontWeight: 700,
            cursor: decision !== 'approve' ? 'not-allowed' : 'pointer',
            opacity: decision !== 'approve' ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {loading ? '…' : '✓ Approve'}
        </button>
      </div>
    </div>
  )
}
