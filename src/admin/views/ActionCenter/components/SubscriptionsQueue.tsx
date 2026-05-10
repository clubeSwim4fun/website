'use client'
import React, { useEffect, useState } from 'react'
import { T } from '../tokens'
import { useACT } from '../LocaleContext'
import AssignIdDialog, { type Group } from './AssignIdDialog'
import { SubmissionField } from './FormsQueue'
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
import { ExpandPanel, PanelBox, PanelCols, PanelField } from './ExpandPanel'

interface Subscription {
  id: string
  createdAt: string
  urgency: string
  amount: number
  description: string | null
  stripePaymentIntentId: string | null
  user: { id: string; name: string; surname: string; email: string } | null
  form: { id: string; title: string } | null
  group: { relationTo: string; id: string; title: string } | null
  submissionData: { field: string; label: string; value: string; isFile: boolean }[]
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
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('oldest')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dialogSub, setDialogSub] = useState<Subscription | null>(null)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/action-center/subscriptions').then((r) => r.json()),
      fetch('/api/action-center/groups').then((r) => r.json()),
    ])
      .then(([subsData, groupsData]) => {
        let list: Subscription[] = subsData.docs ?? []
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
        setGroups(groupsData.docs ?? [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, search])

  const openPanel = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleDialogSave = async (
    assignId: boolean,
    groupId?: string,
    groupRelationTo?: string,
    idNumber?: string,
  ) => {
    if (!dialogSub) return
    try {
      const res = await fetch(`/api/action-center/forms/${dialogSub.id}/handle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignId, groupId, groupRelationTo, idNumber }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Unknown error')

      onAction(t.formHandledMsg, 'success')
      const next = docs.filter((d) => d.id !== dialogSub.id)
      setDocs(next)
      onCountChange(next.length)
      setExpandedId(null)
    } catch (err) {
      onAction(t.formHandleFailMsg.replace('{err}', String(err)), 'error')
    } finally {
      setDialogSub(null)
    }
  }

  const oldest = docs[0] ?? null

  return (
    <>
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
                  const isExpanded = expandedId === sub.id
                  return (
                    <React.Fragment key={sub.id}>
                      <tr
                        style={{
                          borderBottom: `1px solid ${T.borderSubtle}`,
                          background: isExpanded ? T.bgRaised : 'transparent',
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
                          {sub.stripePaymentIntentId ? `€${sub.amount} ✓` : '—'}
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
                              <PanelField label={t.form} value={sub.form?.title} />
                              <PanelField
                                label={t.amount}
                                value={sub.amount ? `€${sub.amount}` : null}
                              />
                              <PanelField
                                label={t.transactionId}
                                value={sub.stripePaymentIntentId}
                              />
                            </PanelBox>
                            <PanelBox title={t.submissionData} scrollable>
                              {sub.submissionData.length === 0 ? (
                                <div style={{ fontSize: 12, color: T.textMuted, padding: '8px 0' }}>
                                  {t.noSubmissionData}
                                </div>
                              ) : (
                                sub.submissionData.map((d, i) => (
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
                              onClick={() => openPanel(sub.id)}
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
                              onClick={() => setDialogSub(sub)}
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

      {dialogSub && (
        <AssignIdDialog
          user={dialogSub.user}
          groups={groups}
          initialGroupId={dialogSub.group?.id}
          onClose={() => setDialogSub(null)}
          onSave={handleDialogSave}
        />
      )}
    </>
  )
}
