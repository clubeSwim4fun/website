'use client'
import React, { useEffect, useState } from 'react'
import { T } from '../tokens'
import { useACT } from '../LocaleContext'
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

interface Subscription {
  id: string
  createdAt: string
  urgency: string
  transactionId: string | null
  paymentStatus: string
  user: { id: string; name: string; surname: string; email: string } | null
  group: { id: string; title: string } | null
  submissionData: { field: string; value: string }[]
}

interface SubscriptionsQueueProps {
  sectionRef: React.RefObject<HTMLDivElement | null>
  onAction: (msg: string, type?: 'success' | 'error') => void
  onCountChange: (count: number) => void
}

export default function SubscriptionsQueue({
  sectionRef,
  onAction,
  onCountChange,
}: SubscriptionsQueueProps) {
  const t = useACT()
  const [docs, setDocs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('oldest')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)

  const fetchData = () => {
    setLoading(true)
    fetch('/api/action-center/subscriptions')
      .then((r) => r.json())
      .then((d) => {
        let list: Subscription[] = d.docs ?? []
        if (search) {
          const q = search.toLowerCase()
          list = list.filter(
            (s) =>
              (s.user?.name ?? '').toLowerCase().includes(q) ||
              (s.user?.surname ?? '').toLowerCase().includes(q) ||
              (s.user?.email ?? '').toLowerCase().includes(q),
          )
        }
        if (sort === 'newest') list = [...list].reverse()
        setDocs(list)
        onCountChange(list.length)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, search])

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
      const res = await fetch(`/api/action-center/subscriptions/${id}/approve`, { method: 'POST' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setPendingRemove(id)
      setExpandedId(null)
      onAction(t.approvedMsg, 'success')
      setTimeout(() => {
        setDocs((prev) => prev.filter((d) => d.id !== id))
        onCountChange(docs.filter((d) => d.id !== id).length)
        setPendingRemove(null)
      }, 4000)
    } catch {
      onAction(t.approveFailMsg, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/action-center/subscriptions/${id}/reject`, { method: 'POST' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setPendingRemove(id)
      setExpandedId(null)
      onAction(t.rejectedMsg, 'success')
      setTimeout(() => {
        setDocs((prev) => prev.filter((d) => d.id !== id))
        onCountChange(docs.filter((d) => d.id !== id).length)
        setPendingRemove(null)
      }, 4000)
    } catch {
      onAction(t.rejectFailMsg, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const oldest = docs[0] ?? null

  return (
    <QueueSection
      id="q-subscriptions"
      sectionRef={sectionRef}
      icon="🏷️"
      title={t.groupSubscriptions}
      count={docs.length}
      oldestAt={oldest?.createdAt ?? null}
      oldestName={oldest?.user ? `${oldest.user.name} ${oldest.user.surname}` : null}
      hasFilter
      filterContent={
        <>
          <FilterSelect
            label={t.sort}
            value={sort}
            onChange={setSort}
            options={[
              { value: 'oldest', label: t.oldestFirst },
              { value: 'newest', label: t.newestFirst },
            ]}
          />
          <FilterSearch value={search} onChange={setSearch} placeholder={t.searchPlaceholder} />
          <FilterReset
            onClick={() => {
              setSort('oldest')
              setSearch('')
            }}
          />
        </>
      }
    >
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
          {t.loading}
        </div>
      ) : docs.length === 0 ? (
        <EmptySection icon="🏷️" title={t.allSubscriptionsReviewed} sub={t.newSubscriptionsHere} />
      ) : (
        <TableWrap>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <Th width={28} />
                <Th>{t.member}</Th>
                <Th>{t.group}</Th>
                <Th>{t.paid}</Th>
                <Th>{t.transaction}</Th>
                <Th>{t.actions}</Th>
              </tr>
            </thead>
            <tbody>
              {docs.map((sub) => {
                const isPending = pendingRemove === sub.id
                const isExpanded = expandedId === sub.id
                return (
                  <React.Fragment key={sub.id}>
                    <tr
                      style={{
                        borderBottom: `1px solid ${T.borderSubtle}`,
                        background: isExpanded ? T.bgRaised : 'transparent',
                        opacity: isPending ? 0.4 : 1,
                        pointerEvents: isPending ? 'none' : 'auto',
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <UrgencyDot urgency={sub.urgency} />
                      <PersonCell
                        name={sub.user ? `${sub.user.name} ${sub.user.surname}` : '—'}
                        email={sub.user?.email ?? '—'}
                      />
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: T.textPrimary, fontSize: 13 }}>
                          {sub.group?.title ?? '—'}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>
                          {t.groupSubscription}
                        </div>
                      </td>
                      <TimeCell iso={sub.createdAt} />
                      <td
                        style={{
                          padding: '10px 12px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: 11,
                          color: T.green,
                        }}
                      >
                        {sub.transactionId ? 'Stripe ✓' : '—'}
                      </td>
                      <ActionsCell onReview={() => openPanel(sub.id)} isOpen={isExpanded} />
                    </tr>

                    {isExpanded && (
                      <ExpandPanel colSpan={6}>
                        <PanelCols>
                          <PanelBox title={t.memberInfo}>
                            <PanelField
                              label={t.name}
                              value={sub.user ? `${sub.user.name} ${sub.user.surname}` : '—'}
                              highlight
                            />
                            <PanelField label={t.email} value={sub.user?.email} />
                            <PanelField label={t.group} value={sub.group?.title} highlight />
                            <PanelField label={t.payment} value={sub.paymentStatus} />
                            <PanelField label={t.transactionId} value={sub.transactionId} />
                          </PanelBox>
                          <PanelBox title={t.submissionData}>
                            {sub.submissionData.length === 0 ? (
                              <div style={{ fontSize: 12, color: T.textMuted }}>
                                {t.noSubmissionData}
                              </div>
                            ) : (
                              sub.submissionData.map((d, i) => (
                                <PanelField key={i} label={d.field} value={d.value} />
                              ))
                            )}
                          </PanelBox>
                        </PanelCols>

                        {/* Refund warning */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 12px',
                            background: T.amberDim,
                            borderRadius: T.rSm,
                            fontSize: 11,
                            color: T.amber,
                            marginBottom: 12,
                            border: `1px solid ${T.amberBorder}`,
                          }}
                        >
                          {t.refundWarning}
                        </div>

                        <DecisionSection
                          decision={decision}
                          onDecisionChange={setDecision}
                          rejectionFields={[]}
                          selectedFields={selectedFields}
                          onFieldToggle={(f) =>
                            setSelectedFields((prev) =>
                              prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
                            )
                          }
                          note={note}
                          onNoteChange={setNote}
                          onApprove={() => handleApprove(sub.id)}
                          onReject={() => handleReject(sub.id)}
                          onCancel={() => openPanel(sub.id)}
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
