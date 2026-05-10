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

interface FormsQueueProps {
  sectionRef: React.RefObject<HTMLDivElement | null>
  onAction: (msg: string, type?: 'success' | 'error') => void
  onCountChange: (count: number) => void
}

export default function FormsQueue({ sectionRef, onAction, onCountChange }: FormsQueueProps) {
  const [docs, setDocs] = useState<FormPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/action-center/forms')
      .then((r) => r.json())
      .then((d) => {
        setDocs(d.docs ?? [])
        onCountChange(d.totalDocs ?? 0)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openPanel = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const oldest = docs[0] ?? null

  return (
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
                              fp.submissionData.map((d, i) => <SubmissionField key={i} item={d} />)
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
                            onClick={() => {
                              onAction('Form submission marked as handled', 'success')
                              const next = docs.filter((d) => d.id !== fp.id)
                              setDocs(next)
                              onCountChange(next.length)
                              setExpandedId(null)
                            }}
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
    // Values may be comma-separated filenames
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
              const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(filename)
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
