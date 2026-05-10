'use client'
import React, { useEffect, useState } from 'react'
import { T } from '../tokens'
import { useACT } from '../LocaleContext'
import QueueSection, {
  EmptySection,
  FilterReset,
  FilterSelect,
  TableWrap,
  Th,
} from './QueueSection'

interface DorsalRow {
  orderId: string
  createdAt: string
  total: number
  ticketPurchased: boolean
  suggestedDorsal: string | null
  user: {
    id: string
    name: string
    surname: string
    email: string
    federationId: number | null
    birthDate: string | null
    gender: string | null
  } | null
  event: { id: string; title: string; startDate: string | null } | null
  ticket: { id: string; name: string; category: string | null; distance: string | null } | null
  tshirtSize: string | null
  currentDorsal: string | null
}

interface DorsalsQueueProps {
  sectionRef: React.RefObject<HTMLDivElement | null>
  onAction: (msg: string, type?: 'success' | 'error') => void
  onCountChange: (count: number) => void
}

export default function DorsalsQueue({ sectionRef, onAction, onCountChange }: DorsalsQueueProps) {
  const t = useACT()
  const [docs, setDocs] = useState<DorsalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [eventFilter, setEventFilter] = useState('all')
  const [sort, setSort] = useState<'event' | 'paid'>('event')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dorsalValues, setDorsalValues] = useState<Record<string, string>>({})
  const [dorsalErrors, setDorsalErrors] = useState<Record<string, string>>({})
  const [savedDorsals, setSavedDorsals] = useState<Record<string, string>>({})
  const [purchasedOverrides, setPurchasedOverrides] = useState<Record<string, boolean>>({})
  const [savingPurchased, setSavingPurchased] = useState<Set<string>>(new Set())

  const fetchData = () => {
    setLoading(true)
    fetch('/api/action-center/dorsals')
      .then((r) => r.json())
      .then((d) => {
        const fetchedDocs: DorsalRow[] = d.docs ?? []
        setDocs(fetchedDocs)
        onCountChange(d.totalDocs ?? 0)
        // Prefill dorsal inputs from suggestedDorsal where no dorsal is assigned yet
        const prefilled: Record<string, string> = {}
        for (const row of fetchedDocs) {
          if (row.suggestedDorsal && !row.currentDorsal) {
            const key = `${row.orderId}-${row.ticket?.id}`
            prefilled[key] = row.suggestedDorsal
          }
        }
        if (Object.keys(prefilled).length > 0) {
          setDorsalValues((prev) => ({ ...prefilled, ...prev }))
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Unique events for filter
  const events = Array.from(
    new Map(docs.filter((d) => d.event).map((d) => [d.event!.id, d.event!.title])).entries(),
  )

  const filtered = docs
    .filter((d) => {
      if (eventFilter !== 'all' && d.event?.id !== eventFilter) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'paid') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      // 'event' — sort by event startDate
      const aDate = a.event?.startDate ? new Date(a.event.startDate).getTime() : 0
      const bDate = b.event?.startDate ? new Date(b.event.startDate).getTime() : 0
      return aDate - bDate
    })

  // Duplicate detection per event (only among already-assigned dorsals)
  const dorsalsByEvent: Record<string, Set<string>> = {}
  for (const d of docs) {
    if (!d.event) continue
    if (!dorsalsByEvent[d.event.id]) dorsalsByEvent[d.event.id] = new Set()
    if (d.currentDorsal) dorsalsByEvent[d.event.id]!.add(d.currentDorsal)
  }

  const handleDorsalChange = (key: string, value: string, eventId: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    setDorsalValues((prev) => ({ ...prev, [key]: cleaned }))

    if (cleaned && dorsalsByEvent[eventId]?.has(cleaned)) {
      const conflict = docs.find((d) => d.event?.id === eventId && d.currentDorsal === cleaned)
      const conflictName = conflict?.user
        ? `${conflict.user.name} ${conflict.user.surname}`
        : 'another athlete'
      setDorsalErrors((prev) => ({
        ...prev,
        [key]: t.alreadyAssigned.replace('{n}', cleaned).replace('{name}', conflictName),
      }))
    } else {
      setDorsalErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const removeRow = (key: string) => {
    setDocs((prev) => {
      const next = prev.filter((d) => `${d.orderId}-${d.ticket?.id}` !== key)
      onCountChange(next.length)
      return next
    })
  }

  const scheduleRemove = (key: string, delay = 5000) => {
    setTimeout(() => removeRow(key), delay)
  }

  const handleSaveDorsal = async (row: DorsalRow, key: string) => {
    const value = dorsalValues[key]
    if (!value || dorsalErrors[key]) return

    try {
      const res = await fetch(`/api/action-center/dorsals/${row.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: row.ticket?.id, dorsal: value }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setSavedDorsals((prev) => ({ ...prev, [key]: value }))
      setDorsalValues((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      onAction(t.dorsalSavedMsg.replace('{n}', value), 'success')
      scheduleRemove(key)
    } catch {
      onAction(t.dorsalSaveFailMsg, 'error')
    }
  }

  const handleTogglePurchased = async (row: DorsalRow, key: string, checked: boolean) => {
    setSavingPurchased((prev) => new Set(prev).add(key))
    try {
      const res = await fetch(`/api/action-center/dorsals/${row.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: row.ticket?.id,
          ticketPurchased: checked,
          // If checking with no dorsal value, mark as no dorsal required so it leaves the list
          ...(checked && !row.currentDorsal && !dorsalValues[key]
            ? { dorsalNotRequired: true }
            : {}),
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setPurchasedOverrides((prev) => ({ ...prev, [key]: checked }))
      onAction(t.ticketPurchasedSaved, 'success')
      // If marked as purchased with no dorsal intent — remove after 5s
      if (checked && !row.currentDorsal && !dorsalValues[key]) {
        scheduleRemove(key)
      }
    } catch {
      onAction(t.ticketPurchasedFail, 'error')
    } finally {
      setSavingPurchased((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  const toggleSelect = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectAll = (checked: boolean) => {
    if (checked) setSelected(new Set(filtered.map((d) => `${d.orderId}-${d.ticket?.id}`)))
    else setSelected(new Set())
  }

  const selectEvent = (eventId: string) => {
    const keys = filtered
      .filter((d) => d.event?.id === eventId)
      .map((d) => `${d.orderId}-${d.ticket?.id}`)
    setSelected((prev) => {
      const next = new Set(prev)
      keys.forEach((k) => next.add(k))
      return next
    })
  }

  const oldest = docs[0] ?? null

  return (
    <QueueSection
      id="q-dorsals"
      sectionRef={sectionRef}
      icon="🎽"
      title={t.dorsalAssignment}
      count={docs.length}
      oldestAt={oldest?.createdAt ?? null}
      hasFilter
      filterContent={
        <>
          <FilterSelect
            label={t.event}
            value={eventFilter}
            onChange={setEventFilter}
            options={[
              { value: 'all', label: t.allEvents },
              ...events.map(([id, title]) => ({ value: id, label: title })),
            ]}
          />
          <FilterSelect
            label={t.sort}
            value={sort}
            onChange={(v) => setSort(v as 'event' | 'paid')}
            options={[
              { value: 'event', label: t.eventDate },
              { value: 'paid', label: t.paidDate },
            ]}
          />
          <FilterReset
            onClick={() => {
              setEventFilter('all')
              setSort('event')
            }}
          />
        </>
      }
    >
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
          {t.loading}
        </div>
      ) : filtered.length === 0 ? (
        <EmptySection icon="🎽" title={t.allDorsalsAssigned} sub={t.newDorsalsHere} />
      ) : (
        <>
          {/* Bulk bar */}
          {selected.size > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 16px',
                background: T.blueDim,
                borderBottom: `1px solid ${T.blueBorder}`,
                fontSize: 12,
              }}
            >
              <span style={{ color: T.blue, fontWeight: 500 }}>
                <span style={{ fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>
                  {selected.size}
                </span>{' '}
                {t.selected}
              </span>
              <button
                onClick={async () => {
                  const keys = Array.from(selected)
                  setSelected(new Set())
                  // Fire PATCH for each selected row
                  await Promise.all(
                    keys.map(async (key) => {
                      const row = docs.find((d) => `${d.orderId}-${d.ticket?.id}` === key)
                      if (!row) return
                      try {
                        const res = await fetch(`/api/action-center/dorsals/${row.orderId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ticketId: row.ticket?.id,
                            ticketPurchased: true,
                            dorsalNotRequired: true,
                          }),
                        })
                        const data = await res.json()
                        if (data.success) scheduleRemove(key)
                      } catch {
                        // silent — individual failures don't block others
                      }
                    }),
                  )
                  onAction(t.markPurchased, 'success')
                }}
                style={{
                  padding: '4px 12px',
                  background: T.blueDim,
                  border: `1px solid ${T.blueBorder}`,
                  borderRadius: T.rSm,
                  color: T.blue,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t.markPurchased}
              </button>
              <button
                onClick={() => setSelected(new Set())}
                style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  color: T.textMuted,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {t.clearSelection}
              </button>
            </div>
          )}

          <TableWrap>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <Th width={28}>
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={(e) => selectAll(e.target.checked)}
                      style={{ accentColor: T.teal, width: 14, height: 14, cursor: 'pointer' }}
                    />
                  </Th>
                  <Th>{t.athlete}</Th>
                  <Th>{t.fedId}</Th>
                  <Th>{t.birthDate}</Th>
                  <Th>{t.event}</Th>
                  <Th>{t.category}</Th>
                  <Th>{t.paid}</Th>
                  <Th>{t.ticketPurchasedCol}</Th>
                  <Th>{t.dorsal}</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const key = `${row.orderId}-${row.ticket?.id}`
                  const dorsalVal = dorsalValues[key] ?? ''
                  const dorsalError = dorsalErrors[key]
                  const saved = savedDorsals[key]
                  const hasValue = !!dorsalVal && !dorsalError
                  const isSelected = selected.has(key)
                  // isPurchased: use override if admin toggled, otherwise fall back to DB value
                  const isPurchased =
                    key in purchasedOverrides ? purchasedOverrides[key] : row.ticketPurchased
                  const isSavingPurchased = savingPurchased.has(key)
                  const isSuggested =
                    !row.currentDorsal && row.suggestedDorsal === dorsalVal && !!dorsalVal

                  return (
                    <tr
                      key={key}
                      style={{
                        borderBottom: `1px solid ${T.borderSubtle}`,
                        background: isSelected ? 'rgba(59,130,246,0.05)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '10px 12px', width: 28 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(key)}
                          style={{ accentColor: T.teal, width: 14, height: 14, cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: T.textPrimary, fontSize: 13 }}>
                          {row.user ? `${row.user.name} ${row.user.surname}` : '—'}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: T.textMuted,
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          {row.user?.email ?? '—'}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: 12,
                          color: T.textSecondary,
                        }}
                      >
                        {row.user?.federationId ?? '—'}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: T.textSecondary }}>
                        {row.user?.birthDate
                          ? new Date(row.user.birthDate).toLocaleDateString('pt-PT')
                          : '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontSize: 13, color: T.textPrimary }}>
                          {row.event?.title ?? '—'}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>
                          {row.event?.startDate
                            ? new Date(row.event.startDate).toLocaleDateString('pt-PT')
                            : ''}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: T.textSecondary }}>
                        {row.ticket?.category ?? row.ticket?.name ?? '—'}
                        {row.ticket?.distance ? ` · ${row.ticket.distance}` : ''}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontSize: 12, color: T.textSecondary }}>
                          {new Date(row.createdAt).toLocaleDateString('pt-PT')}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: T.green,
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          €{row.total}
                        </div>
                      </td>
                      {/* Ticket purchased checkbox */}
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isPurchased}
                          disabled={isSavingPurchased}
                          title={t.markTicketPurchased}
                          onChange={(e) => handleTogglePurchased(row, key, e.target.checked)}
                          style={{
                            accentColor: T.teal,
                            width: 16,
                            height: 16,
                            cursor: isSavingPurchased ? 'wait' : 'pointer',
                            opacity: isSavingPurchased ? 0.5 : 1,
                          }}
                        />
                      </td>
                      {/* Dorsal input — only shown when ticket is purchased */}
                      <td style={{ padding: '10px 12px' }}>
                        {!isPurchased ? (
                          <span style={{ fontSize: 12, color: T.textMuted }}>—</span>
                        ) : saved ? (
                          <span
                            style={{
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: 13,
                              fontWeight: 600,
                              color: T.green,
                              background: 'rgba(34,197,94,0.14)',
                              padding: '4px 10px',
                              borderRadius: T.rSm,
                            }}
                          >
                            {saved} ✓
                          </span>
                        ) : (
                          <div>
                            <input
                              type="text"
                              value={dorsalVal}
                              placeholder="—"
                              maxLength={4}
                              onChange={(e) =>
                                handleDorsalChange(key, e.target.value, row.event?.id ?? '')
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveDorsal(row, key)
                              }}
                              style={{
                                width: 72,
                                background: dorsalError
                                  ? T.redDim
                                  : hasValue
                                    ? isSuggested
                                      ? 'rgba(234,179,8,0.14)'
                                      : 'rgba(34,197,94,0.14)'
                                    : T.bgRaised,
                                border: `1px solid ${
                                  dorsalError
                                    ? 'rgba(239,68,68,0.5)'
                                    : hasValue
                                      ? isSuggested
                                        ? 'rgba(234,179,8,0.4)'
                                        : 'rgba(34,197,94,0.3)'
                                      : T.borderDefault
                                }`,
                                borderRadius: T.rSm,
                                color: dorsalError
                                  ? T.red
                                  : hasValue
                                    ? isSuggested
                                      ? '#ca8a04'
                                      : T.green
                                    : T.textPrimary,
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: 13,
                                fontWeight: 600,
                                textAlign: 'center',
                                padding: '5px 8px',
                                outline: 'none',
                              }}
                            />
                            {isSuggested && !dorsalError && (
                              <div
                                style={{
                                  fontSize: 10,
                                  color: '#ca8a04',
                                  marginTop: 2,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                ✦ auto-filled
                              </div>
                            )}
                            {dorsalError && (
                              <div
                                style={{
                                  fontSize: 10,
                                  color: T.red,
                                  marginTop: 2,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {dorsalError}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {isPurchased && !saved && (
                          <button
                            onClick={() => handleSaveDorsal(row, key)}
                            disabled={!dorsalVal || !!dorsalError}
                            style={{
                              padding: '5px 10px',
                              background: T.tealDim,
                              border: `1px solid ${T.tealBorder}`,
                              borderRadius: T.rSm,
                              color: T.teal,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: !dorsalVal || !!dorsalError ? 'not-allowed' : 'pointer',
                              opacity: !dorsalVal || !!dorsalError ? 0.3 : 1,
                            }}
                          >
                            {t.save}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableWrap>

          {/* Quick-select by event */}
          {events.length > 1 && (
            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: T.textMuted }}>{t.selectAll}</span>
              {events.map(([id, title]) => {
                const count = filtered.filter((d) => d.event?.id === id).length
                return (
                  <button
                    key={id}
                    onClick={() => selectEvent(id)}
                    style={{
                      padding: '4px 12px',
                      background: T.blueDim,
                      border: `1px solid ${T.blueBorder}`,
                      borderRadius: T.rSm,
                      color: T.blue,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {title} ({count})
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </QueueSection>
  )
}
