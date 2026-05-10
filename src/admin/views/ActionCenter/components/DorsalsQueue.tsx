'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { T } from '../tokens'
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
  const [docs, setDocs] = useState<DorsalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [eventFilter, setEventFilter] = useState('all')
  const [sort, setSort] = useState('event')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dorsalValues, setDorsalValues] = useState<Record<string, string>>({})
  const [dorsalErrors, setDorsalErrors] = useState<Record<string, string>>({})
  const [savedDorsals, setSavedDorsals] = useState<Record<string, string>>({})

  const fetchData = () => {
    setLoading(true)
    fetch('/api/action-center/dorsals')
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
  }, [])

  // Unique events for filter
  const events = Array.from(
    new Map(docs.filter((d) => d.event).map((d) => [d.event!.id, d.event!.title])).entries(),
  )

  const filtered = docs.filter((d) => {
    if (eventFilter !== 'all' && d.event?.id !== eventFilter) return false
    return true
  })

  // Duplicate detection per event
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
      // Find conflicting athlete
      const conflict = docs.find((d) => d.event?.id === eventId && d.currentDorsal === cleaned)
      const conflictName = conflict?.user
        ? `${conflict.user.name} ${conflict.user.surname}`
        : 'another athlete'
      setDorsalErrors((prev) => ({
        ...prev,
        [key]: `⚠ ${cleaned} already assigned to ${conflictName}`,
      }))
    } else {
      setDorsalErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const handleSave = async (row: DorsalRow, key: string) => {
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
      onAction(`Dorsal ${value} assigned`, 'success')
    } catch {
      onAction('Failed to save dorsal', 'error')
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
      title="Dorsal Assignment"
      count={docs.length}
      oldestAt={oldest?.createdAt ?? null}
      hasFilter
      filterContent={
        <>
          <FilterSelect
            label="Event"
            value={eventFilter}
            onChange={setEventFilter}
            options={[
              { value: 'all', label: 'All events' },
              ...events.map(([id, title]) => ({ value: id, label: title })),
            ]}
          />
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'event', label: 'Event date' },
              { value: 'paid', label: 'Paid date' },
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
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <EmptySection
          icon="🎽"
          title="All dorsals assigned"
          sub="Paid event orders needing dorsal assignment will appear here"
        />
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
                <span
                  style={{
                    fontWeight: 700,
                    fontFamily: "'Geist Mono', monospace",
                  }}
                >
                  {selected.size}
                </span>{' '}
                selected
              </span>
              <button
                onClick={() => {
                  onAction(`${selected.size} items marked as purchased (no dorsal)`, 'success')
                  setSelected(new Set())
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
                ✓ Mark as purchased (no dorsal)
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
                ✕ Clear
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
                  <Th>Athlete</Th>
                  <Th>Fed. ID</Th>
                  <Th>Birth Date</Th>
                  <Th>Event</Th>
                  <Th>Category</Th>
                  <Th>Paid</Th>
                  <Th>Dorsal</Th>
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
                      <td
                        style={{
                          padding: '10px 12px',
                          fontSize: 12,
                          color: T.textSecondary,
                        }}
                      >
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
                      <td
                        style={{
                          padding: '10px 12px',
                          fontSize: 12,
                          color: T.textSecondary,
                        }}
                      >
                        {row.ticket?.category ?? row.ticket?.name ?? '—'}
                        {row.ticket?.distance ? ` · ${row.ticket.distance}` : ''}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: T.textSecondary,
                          }}
                        >
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
                      <td style={{ padding: '10px 12px' }}>
                        {saved ? (
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
                                if (e.key === 'Enter') handleSave(row, key)
                              }}
                              style={{
                                width: 72,
                                background: dorsalError
                                  ? T.redDim
                                  : hasValue
                                    ? 'rgba(34,197,94,0.14)'
                                    : T.bgRaised,
                                border: `1px solid ${
                                  dorsalError
                                    ? 'rgba(239,68,68,0.5)'
                                    : hasValue
                                      ? 'rgba(34,197,94,0.3)'
                                      : T.borderDefault
                                }`,
                                borderRadius: T.rSm,
                                color: dorsalError ? T.red : hasValue ? T.green : T.textPrimary,
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: 13,
                                fontWeight: 600,
                                textAlign: 'center',
                                padding: '5px 8px',
                                outline: 'none',
                              }}
                            />
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
                        {!saved && (
                          <button
                            onClick={() => handleSave(row, key)}
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
                            Save
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
            <div
              style={{
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, color: T.textMuted }}>Select all for:</span>
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
