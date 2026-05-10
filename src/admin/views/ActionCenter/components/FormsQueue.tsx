'use client'

import React, { useEffect, useState } from 'react'
import { T } from '../tokens'
import QueueSection, {
  ActionsCell,
  EmptySection,
  PersonCell,
  TableWrap,
  Th,
  TimeCell,
  UrgencyDot,
} from './QueueSection'
import { ExpandPanel, PanelBox, PanelCols, PanelField } from './ExpandPanel'

interface FormPayment {
  id: string
  createdAt: string
  urgency: string
  amount: number
  description: string | null
  user: { id: string; name: string; surname: string; email: string } | null
  form: { id: string; title: string } | null
  submissionData: { field: string; label: string; value: string; isFile: boolean }[]
}

interface Group {
  id: string
  relationTo: 'groups' | 'group-categories'
  title: string
  isPermanentId: boolean
  userField: string | null
}

interface FormsQueueProps {
  sectionRef: React.RefObject<HTMLDivElement | null>
  onAction: (msg: string, type?: 'success' | 'error') => void
  onCountChange: (count: number) => void
}

// ─── Assign ID Dialog ─────────────────────────────────────────────────────────
function AssignIdDialog({
  fp,
  groups,
  onClose,
  onSave,
}: {
  fp: FormPayment
  groups: Group[]
  onClose: () => void
  onSave: (assignId: boolean, groupId?: string, idNumber?: string) => Promise<void>
}) {
  const [step, setStep] = useState<'ask' | 'form'>('ask')
  const [selectedGroupId, setSelectedGroupId] = useState('')
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
    await onSave(true, selectedGroupId, idNumber.trim())
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
                Assign an ID to this user?
              </div>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                {fp.user ? `${fp.user.name} ${fp.user.surname}` : '—'}
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
                Cancel
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
                No — just mark handled
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
                Yes — assign ID
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
                Assign ID
              </div>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                {fp.user ? `${fp.user.name} ${fp.user.surname}` : '—'}
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
                  Group
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
                  <option value="">Select a group…</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                      {g.relationTo === 'group-categories' ? ' (subgroup)' : ''}
                      {g.isPermanentId ? ' — permanent' : ' — seasonal'}
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
                    {selectedGroup?.isPermanentId ? 'Permanent ID' : 'Seasonal ID'}
                    {selectedGroup?.isPermanentId && selectedGroup.userField
                      ? ` (→ ${selectedGroup.userField})`
                      : ''}
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Enter ID number…"
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
                      Stored in Temporary Group IDs for the current season.
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
                Back
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
                {saving ? 'Saving…' : 'Save & Mark Handled'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FormsQueue({ sectionRef, onAction, onCountChange }: FormsQueueProps) {
  const [docs, setDocs] = useState<FormPayment[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dialogFp, setDialogFp] = useState<FormPayment | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/action-center/forms').then((r) => r.json()),
      fetch('/api/action-center/groups').then((r) => r.json()),
    ])
      .then(([formsData, groupsData]) => {
        setDocs(formsData.docs ?? [])
        onCountChange(formsData.totalDocs ?? 0)
        setGroups(groupsData.docs ?? [])
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openPanel = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleMarkAsHandled = (fp: FormPayment) => {
    setDialogFp(fp)
  }

  const handleDialogSave = async (assignId: boolean, groupId?: string, idNumber?: string) => {
    if (!dialogFp) return
    try {
      const res = await fetch(`/api/action-center/forms/${dialogFp.id}/handle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignId,
          groupId,
          groupRelationTo: groups.find((g) => g.id === groupId)?.relationTo,
          idNumber,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Unknown error')

      onAction('Form submission marked as handled', 'success')
      const next = docs.filter((d) => d.id !== dialogFp.id)
      setDocs(next)
      onCountChange(next.length)
      setExpandedId(null)
    } catch (err) {
      onAction(`Error: ${String(err)}`, 'error')
    } finally {
      setDialogFp(null)
    }
  }

  const oldest = docs[0] ?? null

  return (
    <>
      <QueueSection
        id="q-forms"
        sectionRef={sectionRef}
        icon="📋"
        title="Paid Form Submissions"
        count={docs.length}
        oldestAt={oldest?.createdAt ?? null}
        oldestName={oldest?.user ? `${oldest.user.name} ${oldest.user.surname}` : null}
      >
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
            Loading…
          </div>
        ) : docs.length === 0 ? (
          <EmptySection
            icon="📋"
            title="All form submissions handled"
            sub="Paid form submissions requiring action will appear here"
          />
        ) : (
          <TableWrap>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <Th width={28} />
                  <Th>Submitter</Th>
                  <Th>Form</Th>
                  <Th>Paid</Th>
                  <Th>Amount</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {docs.map((fp) => {
                  const isExpanded = expandedId === fp.id
                  return (
                    <React.Fragment key={fp.id}>
                      <tr
                        style={{
                          borderBottom: `1px solid ${T.borderSubtle}`,
                          background: isExpanded ? T.bgRaised : 'transparent',
                        }}
                      >
                        <UrgencyDot urgency={fp.urgency} />
                        <PersonCell
                          name={fp.user ? `${fp.user.name} ${fp.user.surname}` : '—'}
                          email={fp.user?.email ?? '—'}
                        />
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontSize: 13, color: T.textPrimary }}>
                            {fp.form?.title ?? '—'}
                          </div>
                          {fp.description && (
                            <div style={{ fontSize: 11, color: T.textMuted }}>{fp.description}</div>
                          )}
                        </td>
                        <TimeCell iso={fp.createdAt} />
                        <td
                          style={{
                            padding: '10px 12px',
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: 12,
                            color: T.green,
                          }}
                        >
                          €{fp.amount} ✓
                        </td>
                        <ActionsCell onReview={() => openPanel(fp.id)} isOpen={isExpanded} />
                      </tr>

                      {isExpanded && (
                        <ExpandPanel colSpan={6}>
                          <PanelCols>
                            <PanelBox title="Submission Info">
                              <PanelField
                                label="Submitter"
                                value={fp.user ? `${fp.user.name} ${fp.user.surname}` : '—'}
                                highlight
                              />
                              <PanelField label="Email" value={fp.user?.email} />
                              <PanelField label="Form" value={fp.form?.title} highlight />
                              <PanelField label="Amount" value={`€${fp.amount}`} />
                              <PanelField label="Description" value={fp.description} />
                            </PanelBox>
                            <PanelBox title="Submission Data" scrollable>
                              {fp.submissionData.length === 0 ? (
                                <div style={{ fontSize: 12, color: T.textMuted, padding: '8px 0' }}>
                                  No submission data
                                </div>
                              ) : (
                                fp.submissionData.map((d, i) => (
                                  <SubmissionField key={i} item={d} />
                                ))
                              )}
                            </PanelBox>
                          </PanelCols>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              gap: 8,
                              marginTop: 8,
                            }}
                          >
                            <button
                              onClick={() => openPanel(fp.id)}
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
                              Close
                            </button>
                            <button
                              onClick={() => handleMarkAsHandled(fp)}
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
                              ✓ Mark as Handled
                            </button>
                          </div>
                        </ExpandPanel>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </QueueSection>

      {dialogFp && (
        <AssignIdDialog
          fp={dialogFp}
          groups={groups}
          onClose={() => setDialogFp(null)}
          onSave={handleDialogSave}
        />
      )}
    </>
  )
}

function SubmissionField({
  item,
}: {
  item: { field: string; label: string; value: string; isFile: boolean }
}) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (!item.value) {
    return <PanelField label={item.label} value={null} />
  }

  if (item.isFile) {
    const filenames = item.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return (
      <>
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
          <span style={{ fontSize: 11, color: T.textMuted, flexShrink: 0 }}>{item.label}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            {filenames.map((filename, i) => {
              const fileUrl = `/api/media/file/${encodeURIComponent(filename)}`
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: T.textMuted,
                      fontFamily: "'Geist Mono', monospace",
                      maxWidth: 160,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {filename}
                  </span>
                  <button
                    onClick={() => setLightbox(fileUrl)}
                    style={{
                      padding: '2px 8px',
                      background: T.tealDim,
                      border: `1px solid ${T.tealBorder}`,
                      borderRadius: T.rSm,
                      color: T.teal,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {lightbox && (
          <div
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.88)',
              zIndex: 9998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 20,
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 32,
                cursor: 'pointer',
                lineHeight: 1,
                zIndex: 1,
              }}
            >
              ×
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/\.(png|jpg|jpeg|gif|webp)$/i.test(lightbox) ? (
                <img
                  src={lightbox}
                  alt={item.label}
                  style={{
                    maxWidth: '85vw',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                    borderRadius: 8,
                    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                  }}
                />
              ) : (
                <iframe
                  src={lightbox}
                  title={item.label}
                  style={{
                    width: '80vw',
                    height: '80vh',
                    border: 'none',
                    borderRadius: 8,
                    background: '#fff',
                  }}
                />
              )}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <a
                  href={lightbox}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: T.teal, textDecoration: 'none' }}
                >
                  Open in new tab ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return <PanelField label={item.label} value={item.value} />
}
