'use client'
import React, { useEffect, useRef, useState } from 'react'
import { T } from '../tokens'
import { maskNif } from '../utils'
import QueueSection, {
  ActionsCell,
  EmptySection,
  FilterReset,
  FilterSearch,
  FilterSelect,
  PersonCell,
  TableWrap,
  Th,
  TimeCell,
  UrgencyDot,
} from './QueueSection'
import { DecisionSection, ExpandPanel, PanelBox, PanelCols, PanelField } from './ExpandPanel'

interface Registration {
  id: string
  name: string
  surname: string
  email: string
  nif: string | null
  phone: string | null
  birthDate: string | null
  identity: string | null
  gender: string | null
  nationality: string | null
  // Additional fields
  associateId: number | null
  federationId: number | null
  tshirtSize: string | null
  sportInsurance: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  emailNotificationsEnabled: boolean
  mustResetPassword: boolean
  address: {
    street: string | null
    number: string | null
    state: string | null
    zipcode: string | null
  } | null
  disability: string[]
  groups: { id: string; label: string }[]
  heardAboutClub: string | null
  createdAt: string
  urgency: string
  isResubmission: boolean
  fieldsToUpdate: string[]
  hasProfilePicture: boolean
  hasIdentityFile: boolean
  hasNif: boolean
  profilePicture: {
    id: string
    url: string | null
    filename: string | null
    mimeType: string | null
  } | null
  identityFiles: {
    id: string
    url: string | null
    filename: string | null
    mimeType: string | null
  }[]
}

const REJECTION_FIELDS = [
  { value: 'profilePicture', label: 'Profile photo' },
  { value: 'identityCardFile', label: 'Identity doc' },
  { value: 'nif', label: 'NIF document' },
  { value: 'nationality', label: 'Nationality' },
  { value: 'phoneNumber', label: 'Phone number' },
  { value: 'identityCardNumber', label: 'ID number' },
  { value: 'gender', label: 'Gender' },
  { value: 'address', label: 'Address' },
  { value: 'emergencyContact', label: 'Emergency contact' },
  { value: 'emergencyPhone', label: 'Emergency phone' },
  { value: 'tshirtSize', label: 'T-shirt size' },
]

interface RegistrationsQueueProps {
  sectionRef: React.RefObject<HTMLDivElement | null>
  onAction: (msg: string, type?: 'success' | 'error') => void
  onCountChange: (count: number) => void
}

export default function RegistrationsQueue({
  sectionRef,
  onAction,
  onCountChange,
}: RegistrationsQueueProps) {
  const [docs, setDocs] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('oldest')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)

  const fetchData = () => {
    setLoading(true)
    const params = new URLSearchParams({ sort, status: statusFilter, search })
    fetch(`/api/action-center/registrations?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setDocs(d.docs ?? [])
        onCountChange(d.totalDocs ?? 0)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, statusFilter, search])

  const openPanel = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      setDecision(null)
      setSelectedFields([])
      setNote('')
    } else {
      setExpandedId(id)
      setDecision(null)
      setSelectedFields([])
      setNote('')
    }
  }

  const handleApprove = async (id: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/action-center/registrations/${id}/approve`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      // Optimistic: mark for removal after undo window
      setPendingRemove(id)
      setExpandedId(null)
      onAction('Registration approved — email sent', 'success')

      setTimeout(() => {
        setDocs((prev) => prev.filter((d) => d.id !== id))
        onCountChange(docs.filter((d) => d.id !== id).length)
        setPendingRemove(null)
      }, 4000)
    } catch {
      onAction('Failed to approve registration', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id: string) => {
    if (selectedFields.length === 0) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/action-center/registrations/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: selectedFields, note }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setPendingRemove(id)
      setExpandedId(null)
      onAction('Registration rejected — email sent', 'success')

      setTimeout(() => {
        setDocs((prev) => prev.filter((d) => d.id !== id))
        onCountChange(docs.filter((d) => d.id !== id).length)
        setPendingRemove(null)
      }, 4000)
    } catch {
      onAction('Failed to reject registration', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const oldest = docs[0] ?? null

  return (
    <QueueSection
      id="q-registrations"
      sectionRef={sectionRef}
      icon="👤"
      title="User Registrations"
      count={docs.length}
      oldestAt={oldest?.createdAt ?? null}
      oldestName={oldest ? `${oldest.name} ${oldest.surname}` : null}
      hasFilter
      filterContent={
        <>
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'oldest', label: 'Oldest first' },
              { value: 'newest', label: 'Newest first' },
              { value: 'name', label: 'Name A–Z' },
            ]}
          />
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'complete', label: 'Complete docs' },
              { value: 'missing', label: 'Missing docs' },
              { value: 'resubmission', label: 'Re-submission' },
            ]}
          />
          <FilterSearch value={search} onChange={setSearch} placeholder="Search name or email…" />
          <FilterReset
            onClick={() => {
              setSort('oldest')
              setStatusFilter('all')
              setSearch('')
            }}
          />
        </>
      }
    >
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
          Loading…
        </div>
      ) : docs.length === 0 ? (
        <EmptySection
          icon="👤"
          title="All registrations reviewed"
          sub="New registration requests will appear here"
        />
      ) : (
        <TableWrap>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <Th width={28} />
                <Th>Member</Th>
                <Th>NIF</Th>
                <Th>Submitted</Th>
                <Th>Documents</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {docs.map((reg) => {
                const isPending = pendingRemove === reg.id
                const isExpanded = expandedId === reg.id
                return (
                  <React.Fragment key={reg.id}>
                    <tr
                      style={{
                        borderBottom: `1px solid ${T.borderSubtle}`,
                        background: isExpanded ? T.bgRaised : 'transparent',
                        opacity: isPending ? 0.4 : 1,
                        pointerEvents: isPending ? 'none' : 'auto',
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <UrgencyDot urgency={reg.urgency} />
                      <PersonCell
                        name={`${reg.name} ${reg.surname}`}
                        email={reg.email}
                        badge={
                          reg.isResubmission ? (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 3,
                                background: T.blueDim,
                                color: T.blue,
                              }}
                            >
                              🔄 Re-submission
                            </span>
                          ) : undefined
                        }
                      />
                      <td
                        style={{
                          padding: '10px 12px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: 12,
                          color: T.textSecondary,
                        }}
                      >
                        {maskNif(reg.nif)}
                      </td>
                      <TimeCell iso={reg.createdAt} />
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <DocChip ok={reg.hasProfilePicture} label="Photo" />
                          <DocChip ok={reg.hasIdentityFile} label="ID" />
                          <DocChip ok={reg.hasNif} label="NIF" />
                        </div>
                      </td>
                      <ActionsCell onReview={() => openPanel(reg.id)} isOpen={isExpanded} />
                    </tr>

                    {isExpanded && (
                      <ExpandPanel colSpan={6}>
                        <PanelCols>
                          <PanelBox title="Personal Info" scrollable>
                            <PanelField
                              label="Full name"
                              value={`${reg.name} ${reg.surname}`}
                              highlight
                            />
                            <PanelField label="Email" value={reg.email} />
                            <PanelField label="Phone" value={reg.phone} />
                            <PanelField label="NIF" value={reg.nif} highlight />
                            <PanelField
                              label="Birth date"
                              value={
                                reg.birthDate
                                  ? new Date(reg.birthDate).toLocaleDateString('pt-PT')
                                  : null
                              }
                            />
                            <PanelField label="Identity doc nº" value={reg.identity} />
                            <PanelField label="Gender" value={reg.gender} />
                            <PanelField label="Nationality" value={reg.nationality} />
                            <PanelField label="Associate ID" value={reg.associateId} />
                            <PanelField label="Federation ID" value={reg.federationId} />
                            <PanelField label="T-shirt size" value={reg.tshirtSize} />
                            <PanelField label="Sport insurance" value={reg.sportInsurance} />
                            <PanelField label="Emergency contact" value={reg.emergencyContact} />
                            <PanelField label="Emergency phone" value={reg.emergencyPhone} />
                            <PanelField
                              label="Email notifications"
                              value={reg.emailNotificationsEnabled ? 'Yes' : 'No'}
                            />
                            {reg.address && (
                              <PanelField
                                label="Address"
                                value={
                                  [
                                    reg.address.street,
                                    reg.address.number,
                                    reg.address.state,
                                    reg.address.zipcode,
                                  ]
                                    .filter(Boolean)
                                    .join(', ') || null
                                }
                              />
                            )}
                            {reg.disability.length > 0 && (
                              <PanelField label="Disability" value={reg.disability.join(', ')} />
                            )}
                            {reg.groups.length > 0 && (
                              <PanelField
                                label="Groups"
                                value={reg.groups.map((g) => g.label).join(', ')}
                              />
                            )}
                            {reg.heardAboutClub && (
                              <PanelField label="Heard about club" value={reg.heardAboutClub} />
                            )}
                            {reg.isResubmission && reg.fieldsToUpdate.length > 0 && (
                              <PanelField
                                label="Previous rejection"
                                value={reg.fieldsToUpdate.join(', ')}
                                valueColor={T.amber}
                              />
                            )}
                          </PanelBox>
                          <PanelBox title="Documents">
                            <DocItem
                              ok={reg.hasProfilePicture}
                              name="Profile Photo"
                              file={reg.profilePicture}
                            />
                            {reg.identityFiles.length > 0 ? (
                              reg.identityFiles.map((f, i) => (
                                <DocItem
                                  key={f.id}
                                  ok
                                  name={`Identity Document${reg.identityFiles.length > 1 ? ` ${i + 1}` : ''}`}
                                  file={f}
                                />
                              ))
                            ) : (
                              <DocItem ok={false} name="Identity Document" file={null} />
                            )}
                            {/* NIF is a text field, not a file — show as info row */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '8px 0',
                              }}
                            >
                              <span style={{ fontSize: 14 }}>{reg.hasNif ? '✅' : '❌'}</span>
                              <span
                                style={{
                                  fontSize: 12,
                                  color: reg.hasNif ? T.textSecondary : T.red,
                                  flex: 1,
                                }}
                              >
                                NIF Document
                                {!reg.hasNif && ' — missing'}
                              </span>
                              {reg.hasNif && (
                                <span
                                  style={{
                                    fontFamily: "'Geist Mono', monospace",
                                    fontSize: 11,
                                    color: T.textMuted,
                                    padding: '3px 8px',
                                    background: T.bgActive,
                                    borderRadius: T.rSm,
                                  }}
                                >
                                  {reg.nif}
                                </span>
                              )}
                            </div>
                          </PanelBox>
                        </PanelCols>
                        <DecisionSection
                          decision={decision}
                          onDecisionChange={setDecision}
                          rejectionFields={REJECTION_FIELDS}
                          selectedFields={selectedFields}
                          onFieldToggle={(f) =>
                            setSelectedFields((prev) =>
                              prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
                            )
                          }
                          note={note}
                          onNoteChange={setNote}
                          onApprove={() => handleApprove(reg.id)}
                          onReject={() => handleReject(reg.id)}
                          onCancel={() => openPanel(reg.id)}
                          loading={actionLoading}
                        />
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

function DocChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: '2px 7px',
        borderRadius: 3,
        background: ok ? 'rgba(34,197,94,0.14)' : T.redDim,
        color: ok ? T.green : T.red,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
      }}
    >
      {ok ? '✓' : '✗'} {label}
    </span>
  )
}

type MediaFile = {
  id: string
  url: string | null
  filename: string | null
  mimeType: string | null
} | null

function DocItem({ ok, name, file }: { ok: boolean; name: string; file: MediaFile }) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const isImage = file?.mimeType?.startsWith('image/') ?? false
  const viewUrl = file?.url ?? null

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 0',
          borderBottom: `1px solid ${T.borderSubtle}`,
        }}
      >
        <span style={{ fontSize: 14 }}>{ok ? '✅' : '❌'}</span>
        <span style={{ fontSize: 12, color: ok ? T.textSecondary : T.red, flex: 1 }}>
          {name}
          {!ok && ' — missing'}
        </span>
        <div style={{ display: 'flex', gap: 5 }}>
          {ok && viewUrl ? (
            <button
              onClick={() => setLightbox(viewUrl)}
              style={{
                padding: '3px 9px',
                background: T.bgActive,
                border: `1px solid ${T.borderDefault}`,
                borderRadius: T.rSm,
                color: T.textSecondary,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              View
            </button>
          ) : (
            <button
              disabled
              style={{
                padding: '3px 9px',
                background: T.bgActive,
                border: `1px solid ${T.borderDefault}`,
                borderRadius: T.rSm,
                color: T.textSecondary,
                fontSize: 11,
                opacity: 0.3,
                cursor: 'not-allowed',
              }}
            >
              View
            </button>
          )}
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
            {isImage ? (
              <img
                src={lightbox}
                alt={name}
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
                title={name}
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
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                {file?.filename ?? name}
              </span>
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
