'use client'
import React, { useState } from 'react'
import { T } from '../tokens'
import { useACT } from '../LocaleContext'

export interface Group {
  id: string
  relationTo: 'groups' | 'group-categories'
  title: string
  isPermanentId: boolean
  userField: string | null
}

interface AssignIdDialogProps {
  user: { name: string; surname: string } | null
  groups: Group[]
  initialGroupId?: string
  onClose: () => void
  onSave: (
    assignId: boolean,
    groupId?: string,
    groupRelationTo?: string,
    idNumber?: string,
  ) => Promise<void>
}

export default function AssignIdDialog({
  user,
  groups,
  initialGroupId,
  onClose,
  onSave,
}: AssignIdDialogProps) {
  const t = useACT()
  const [step, setStep] = useState<'ask' | 'form'>('ask')
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId ?? '')
  const [idNumber, setIdNumber] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null

  const handleNo = async () => {
    setSaving(true)
    await onSave(false)
    setSaving(false)
  }

  const handleYes = () => setStep('form')

  const handleSave = async () => {
    if (!selectedGroupId || !idNumber.trim()) return
    setSaving(true)
    await onSave(true, selectedGroupId, selectedGroup?.relationTo, idNumber.trim())
    setSaving(false)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bgSurface,
          border: `1px solid ${T.borderDefault}`,
          borderRadius: T.rLg,
          padding: 24,
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {step === 'ask' ? (
          <>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: T.textPrimary,
                  marginBottom: 6,
                }}
              >
                {t.assignIdQuestion}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                {user ? `${user.name} ${user.surname}` : '—'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
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
                {t.cancel}
              </button>
              <button
                onClick={handleNo}
                disabled={saving}
                style={{
                  padding: '7px 14px',
                  background: T.bgRaised,
                  border: `1px solid ${T.borderDefault}`,
                  borderRadius: T.rSm,
                  color: T.textSecondary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {t.noJustMark}
              </button>
              <button
                onClick={handleYes}
                style={{
                  padding: '7px 16px',
                  background: T.teal,
                  border: `1px solid ${T.teal}`,
                  borderRadius: T.rSm,
                  color: '#001a18',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t.yesAssignId}
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: T.textPrimary,
                  marginBottom: 6,
                }}
              >
                {t.assignIdTitle}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                {user ? `${user.name} ${user.surname}` : '—'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    color: T.textMuted,
                    marginBottom: 4,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                  }}
                >
                  {t.groupLabel}
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => {
                    setSelectedGroupId(e.target.value)
                    setIdNumber('')
                  }}
                  style={{
                    width: '100%',
                    background: T.bgRaised,
                    border: `1px solid ${T.borderDefault}`,
                    borderRadius: T.rSm,
                    color: T.textPrimary,
                    fontSize: 13,
                    padding: '7px 10px',
                    outline: 'none',
                  }}
                >
                  <option value="">{t.selectGroup}</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                      {g.relationTo === 'group-categories' ? ` ${t.subgroup}` : ''}
                      {g.isPermanentId ? ` ${t.permanent}` : ` ${t.seasonal}`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedGroupId && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      color: T.textMuted,
                      marginBottom: 4,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    {selectedGroup?.isPermanentId ? t.permanentId : t.seasonalId}
                    {selectedGroup?.isPermanentId && selectedGroup.userField
                      ? ` (→ ${selectedGroup.userField})`
                      : ''}
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder={t.idNumberPlaceholder}
                    style={{
                      width: '100%',
                      background: T.bgRaised,
                      border: `1px solid ${T.borderDefault}`,
                      borderRadius: T.rSm,
                      color: T.textPrimary,
                      fontSize: 13,
                      padding: '7px 10px',
                      outline: 'none',
                    }}
                  />
                  {selectedGroup && !selectedGroup.isPermanentId && (
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
                      {t.seasonalNote}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setStep('ask')}
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
                {t.back}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !selectedGroupId || !idNumber.trim()}
                style={{
                  padding: '7px 16px',
                  background: T.teal,
                  border: `1px solid ${T.teal}`,
                  borderRadius: T.rSm,
                  color: '#001a18',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor:
                    saving || !selectedGroupId || !idNumber.trim() ? 'not-allowed' : 'pointer',
                  opacity: saving || !selectedGroupId || !idNumber.trim() ? 0.6 : 1,
                }}
              >
                {saving ? t.saving : t.saveMarkHandled}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
