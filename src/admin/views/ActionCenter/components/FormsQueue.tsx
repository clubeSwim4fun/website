'use client'

import React, { useEffect, useState } from 'react'
import { T } from '../tokens'
import { useACT } from '../LocaleContext'
import AssignIdDialog, { type Group } from './AssignIdDialog'
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

interface FormsQueueProps {
  sectionRef: React.RefObject<HTMLDivElement | null>
  onAction: (msg: string, type?: 'success' | 'error') => void
  onCountChange: (count: number) => void
}

export default function FormsQueue({ sectionRef, onAction, onCountChange }: FormsQueueProps) {
  const t = useACT()
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

  const handleDialogSave = async (
    assignId: boolean,
    groupId?: string,
    groupRelationTo?: string,
    idNumber?: string,
  ) => {
    if (!dialogFp) return
    try {
      const res = await fetch(`/api/action-center/forms/${dialogFp.id}/handle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignId, groupId, groupRelationTo, idNumber }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Unknown error')

      onAction(t.formHandledMsg, 'success')
      const next = docs.filter((d) => d.id !== dialogFp.id)
      setDocs(next)
      onCountChange(next.length)
      setExpandedId(null)
    } catch (err) {
      onAction(t.formHandleFailMsg.replace('{err}', String(err)), 'error')
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
        title={t.paidFormSubmissions}
        count={docs.length}
        oldestAt={oldest?.createdAt ?? null}
        oldestName={oldest?.user ? `${oldest.user.name} ${oldest.user.surname}` : null}
      >
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
            {t.loading}
          </div>
        ) : docs.length === 0 ? (
          <EmptySection icon="📋" title={t.allFormsHandled} sub={t.newFormsHere} />
        ) : (
          <TableWrap>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <Th width={28} />
                  <Th>{t.submitter}</Th>
                  <Th>{t.form}</Th>
                  <Th>{t.paid}</Th>
                  <Th>{t.amount}</Th>
                  <Th>{t.actions}</Th>
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
                            <PanelBox title={t.submissionInfo}>
                              <PanelField
                                label={t.submitter}
                                value={fp.user ? `${fp.user.name} ${fp.user.surname}` : '—'}
                                highlight
                              />
                              <PanelField label={t.email} value={fp.user?.email} />
                              <PanelField label={t.form} value={fp.form?.title} highlight />
                              <PanelField label={t.amount} value={`€${fp.amount}`} />
                              <PanelField label={t.description} value={fp.description} />
                            </PanelBox>
                            <PanelBox title={t.submissionData} scrollable>
                              {fp.submissionData.length === 0 ? (
                                <div style={{ fontSize: 12, color: T.textMuted, padding: '8px 0' }}>
                                  {t.noSubmissionDataLabel}
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
                              {t.close}
                            </button>
                            <button
                              onClick={() => setDialogFp(fp)}
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
                              {t.markAsHandled}
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
          user={dialogFp.user}
          groups={groups}
          onClose={() => setDialogFp(null)}
          onSave={handleDialogSave}
        />
      )}
    </>
  )
}

export function SubmissionField({
  item,
}: {
  item: { field: string; label: string; value: string; isFile: boolean }
}) {
  const t = useACT()
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
                    {t.view}
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
                  {t.openInNewTab}
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
