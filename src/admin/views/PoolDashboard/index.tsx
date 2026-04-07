'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Banner, LoadingOverlay } from '@payloadcms/ui'
import { useRequireAdmin } from '@/admin/utils/requireAdmin'
import StatCard from '@/admin/components/dashboard/StatCard'
import PanelCard from '@/admin/components/dashboard/PanelCard'
import CapacityBar from '@/admin/components/dashboard/CapacityBar'
import StatusBadge from '@/admin/components/dashboard/StatusBadge'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  deep: '#0a4a6e',
  mid: '#0e7ea8',
  pale: '#e0f5fb',
  foam: '#f0fafd',
  sand: '#fdf8f3',
  border: '#d4eaf2',
  ink: '#0f1f2e',
  inkMid: '#3d5a70',
  inkLight: '#8aaabb',
  green: '#2ecc71',
  greenL: '#e8f8f0',
  greenD: '#1a9950',
  amber: '#f0a020',
  amberL: '#fef6e4',
  coral: '#e85d4a',
  coralL: '#fdf0ee',
  purple: '#a78bfa',
  purpleL: '#f3f0ff',
  white: '#fff',
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface PoolDashboardData {
  subscribedAthletes: number
  confirmedSlotsThisWeek: number
  waitlistTotal: number
  fullSlotsCount: number
  weeklyRegistrations: { week: string; count: number }[]
  slotFillRate: { day: string; rate: number }[]
  slotTable: {
    slotId: string
    day: string
    time: string
    registered: number
    capacity: number
    waitlisted: number
  }[]
  waitlist: { athleteName: string; waitlistPosition: number; createdAt: string }[]
}

type DrawerContent =
  | {
      kind: 'slot'
      slotId: string
      day: string
      time: string
      registered: number
      capacity: number
    }
  | { kind: 'week'; weekIndex: number; weekLabel: string; count: number }
  | { kind: 'day'; day: string; rate: number }
  | null

interface SlotDetail {
  enrolled: { id: string; name: string; email: string; registeredAt: string }[]
  waitlist: { position: number; name: string; email: string; joinedAt: string }[]
}
interface WeekDetail {
  week: { label: string; start: string; end: string } | null
  athletes: {
    id: string
    name: string
    email: string
    slotDay: string
    slotTime: string
    registeredAt: string
  }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function deriveSlotStatus(
  r: number,
  c: number,
): { status: string; type: 'green' | 'amber' | 'coral' } {
  if (c <= 0 || r >= c) return { status: 'Full', type: 'coral' }
  if (r / c >= 0.75) return { status: 'Limited', type: 'amber' }
  return { status: 'Available', type: 'green' }
}
function getInitials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length === 1
    ? (p[0]?.[0]?.toUpperCase() ?? '?')
    : ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function Drawer({
  open,
  onClose,
  title,
  sub,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  sub?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,30,46,.35)',
          backdropFilter: 'blur(2px)',
          zIndex: 1000,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .22s ease',
        }}
      />
      {/* Panel */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(480px, 100vw)',
          background: C.white,
          boxShadow: '-8px 0 40px rgba(10,74,110,.15)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .26s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: `1.5px solid ${C.border}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: 17,
                color: C.deep,
              }}
            >
              {title}
            </div>
            {sub && <div style={{ fontSize: 12, color: C.inkLight, marginTop: 3 }}>{sub}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: C.pale,
              border: 'none',
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: C.inkMid,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>{children}</div>
      </div>
    </>
  )
}

// ─── Drawer content components ────────────────────────────────────────────────
function AthleteLine({ name, email, meta }: { name: string; email: string; meta?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: C.pale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Syne',sans-serif",
          fontWeight: 700,
          fontSize: 12,
          color: C.deep,
          flexShrink: 0,
        }}
      >
        {getInitials(name || '?')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.ink,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name || '—'}
        </div>
        <div
          style={{
            fontSize: 11,
            color: C.inkLight,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {email}
        </div>
      </div>
      {meta && <div style={{ fontSize: 11, color: C.inkLight, flexShrink: 0 }}>{meta}</div>}
    </div>
  )
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        marginTop: 20,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.6px',
          color: C.inkLight,
        }}
      >
        {label}
      </span>
      <span
        style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: C.deep }}
      >
        {count}
      </span>
    </div>
  )
}

function DrawerLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
        color: C.inkLight,
        fontSize: 13,
      }}
    >
      Loading…
    </div>
  )
}

function DrawerEmpty({ label }: { label: string }) {
  return <div style={{ fontSize: 13, color: C.inkLight, padding: '16px 0' }}>{label}</div>
}

// ─── Interactive bar chart ────────────────────────────────────────────────────
function InteractiveBarChart({
  data,
  onBarClick,
}: {
  data: { label: string; value: number; color?: string; meta?: any }[]
  onBarClick?: (index: number, item: (typeof data)[0]) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => d.value), 1)
  const DEFAULT_COLOR = C.mid

  if (!data.length)
    return (
      <div
        style={{
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          color: C.inkLight,
        }}
      >
        No data
      </div>
    )

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          height: 160,
          paddingTop: 20,
          boxSizing: 'border-box',
        }}
      >
        {data.map((item, i) => {
          const pct = (item.value / max) * 100
          const isHov = hovered === i
          const clickable = !!onBarClick
          return (
            <div
              key={i}
              onClick={() => onBarClick?.(i, item)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              title={clickable ? `${item.label}: ${item.value} — click for details` : undefined}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
                gap: 4,
                cursor: clickable ? 'pointer' : 'default',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: isHov ? C.deep : C.inkLight,
                  fontWeight: isHov ? 700 : 400,
                  lineHeight: 1,
                  transition: 'color .15s',
                }}
              >
                {item.value}
              </span>
              <div
                style={{
                  width: '100%',
                  height: `${pct}%`,
                  minHeight: item.value > 0 ? 4 : 0,
                  background: isHov ? C.deep : (item.color ?? DEFAULT_COLOR),
                  borderRadius: '4px 4px 0 0',
                  transition: 'background .15s, transform .15s',
                  transform: isHov ? 'scaleX(0.92)' : 'scaleX(1)',
                  boxShadow: isHov ? `0 4px 12px rgba(10,74,110,.25)` : 'none',
                }}
              />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {data.map((item, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 11,
              color: hovered === i ? C.deep : C.inkLight,
              fontWeight: hovered === i ? 600 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color .15s',
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Interactive fill-rate row ────────────────────────────────────────────────
function FillRateRow({ day, rate, onClick }: { day: string; rate: number; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const fill = rate >= 100 ? C.coral : rate >= 75 ? C.amber : C.mid
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={`${day}: ${rate}% — click for details`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 8px',
        borderRadius: 8,
        cursor: 'pointer',
        background: hov ? C.foam : 'transparent',
        transition: 'background .15s',
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: C.ink,
          width: 72,
          flexShrink: 0,
          fontWeight: hov ? 600 : 400,
        }}
      >
        {day}
      </span>
      <div
        style={{ flex: 1, height: 8, borderRadius: 99, background: C.border, overflow: 'hidden' }}
      >
        <div
          style={{
            width: `${Math.min(rate, 100)}%`,
            height: '100%',
            borderRadius: 99,
            background: fill,
            transition: 'width .3s',
          }}
        />
      </div>
      <span
        style={{ fontSize: 12, color: C.inkLight, width: 36, textAlign: 'right', flexShrink: 0 }}
      >
        {Math.round(rate)}%
      </span>
      <span style={{ fontSize: 11, color: C.inkLight, flexShrink: 0 }}>›</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PoolDashboard() {
  const { isAdmin } = useRequireAdmin()
  const [data, setData] = useState<PoolDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Drawer state
  const [drawer, setDrawer] = useState<DrawerContent>(null)
  const [drawerData, setDrawerData] = useState<SlotDetail | WeekDetail | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/dashboard/pool')
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const openSlot = useCallback((slot: PoolDashboardData['slotTable'][0]) => {
    setDrawer({
      kind: 'slot',
      slotId: slot.slotId,
      day: slot.day,
      time: slot.time,
      registered: slot.registered,
      capacity: slot.capacity,
    })
    setDrawerData(null)
    setDrawerLoading(true)
    fetch(`/api/dashboard/pool/slot/${slot.slotId}`)
      .then((r) => r.json())
      .then(setDrawerData)
      .finally(() => setDrawerLoading(false))
  }, [])

  const openWeek = useCallback((weekIndex: number, weekLabel: string, count: number) => {
    setDrawer({ kind: 'week', weekIndex, weekLabel, count })
    setDrawerData(null)
    setDrawerLoading(true)
    fetch(`/api/dashboard/pool/week/${weekIndex}`)
      .then((r) => r.json())
      .then(setDrawerData)
      .finally(() => setDrawerLoading(false))
  }, [])

  const openDay = useCallback((day: string, rate: number) => {
    setDrawer({ kind: 'day', day, rate })
    setDrawerData(null)
  }, [])

  const closeDrawer = useCallback(() => setDrawer(null), [])

  if (!isAdmin) return <Banner type="error">You do not have permission to view this page.</Banner>
  if (loading) return <LoadingOverlay />
  if (error || !data)
    return (
      <div
        style={{
          padding: '2rem',
          fontFamily: '"DM Sans",sans-serif',
          color: C.coral,
          fontSize: 14,
        }}
      >
        {error ?? 'Failed to load data.'}
      </div>
    )

  const drawerTitle =
    drawer?.kind === 'slot'
      ? `${drawer.time} — ${drawer.day}`
      : drawer?.kind === 'week'
        ? drawer.weekLabel
        : drawer?.kind === 'day'
          ? `${drawer.day} — fill rate`
          : ''

  const drawerSub =
    drawer?.kind === 'slot'
      ? `${drawer.registered}/${drawer.capacity} enrolled`
      : drawer?.kind === 'week'
        ? `${drawer.count} registrations`
        : drawer?.kind === 'day'
          ? `${Math.round(drawer.rate ?? 0)}% capacity used`
          : ''

  return (
    <div
      style={{
        background: C.sand,
        minHeight: '100vh',
        padding: '24px 20px 48px',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .pool-slot-table{width:100%;border-collapse:collapse;}
        .pool-slot-table th{font-family:"DM Sans",sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#8aaabb;text-align:left;padding-bottom:10px;padding-right:12px;white-space:nowrap;}
        .pool-slot-row{cursor:pointer;transition:background .15s;}
        .pool-slot-row:hover{background:#f0fafd;}
        .pool-slot-cards{display:none;}
        .pool-slot-card{background:#f0fafd;border-radius:10px;padding:12px 14px;display:grid;grid-template-columns:1fr auto;gap:4px 12px;align-items:center;cursor:pointer;transition:box-shadow .15s;}
        .pool-slot-card:hover{box-shadow:0 2px 12px rgba(10,74,110,.12);}
        @media(max-width:600px){
          .pool-slot-table-wrap{display:none;}
          .pool-slot-cards{display:flex;flex-direction:column;gap:10px;}
        }
      `}</style>

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: '"Syne",sans-serif',
              fontWeight: 700,
              fontSize: 28,
              color: C.deep,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Pool Dashboard
          </h1>
          <p
            style={{
              fontFamily: '"DM Sans",sans-serif',
              fontSize: 14,
              color: C.inkMid,
              margin: '4px 0 0',
            }}
          >
            Current cycle overview
          </p>
        </div>
        <span
          style={{
            background: `linear-gradient(135deg,${C.deep},${C.mid})`,
            color: C.white,
            fontFamily: '"DM Sans",sans-serif',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 99,
            padding: '6px 16px',
            whiteSpace: 'nowrap',
          }}
        >
          Active Cycle
        </span>
      </div>

      {/* Gradient Banner */}
      <div
        style={{
          background: `linear-gradient(135deg,${C.deep},${C.mid})`,
          borderRadius: 14,
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: 22, color: C.white }}
        >
          Pool Cycle
        </span>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {[
            { v: data.subscribedAthletes, l: 'Athletes' },
            { v: data.waitlistTotal, l: 'Waitlist' },
            { v: '—', l: 'Pool Hours' },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: '"Syne",sans-serif',
                  fontWeight: 800,
                  fontSize: 28,
                  color: C.white,
                  lineHeight: 1,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontFamily: '"DM Sans",sans-serif',
                  fontSize: 12,
                  color: 'rgba(255,255,255,.75)',
                  marginTop: 4,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard label="Subscribed Athletes" value={data.subscribedAthletes} barColor="blue" />
        <StatCard
          label="Confirmed This Week"
          value={data.confirmedSlotsThisWeek}
          barColor="green"
        />
        <StatCard label="Waitlist Total" value={data.waitlistTotal} barColor="amber" />
        <StatCard label="Full Slots" value={data.fullSlotsCount} barColor="coral" />
      </div>

      {/* Charts row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <PanelCard
          title="Weekly Registrations"
          sub="Click a bar to see who registered"
          borderColor="blue"
        >
          <InteractiveBarChart
            data={data.weeklyRegistrations.map((w, i) => ({
              label: w.week,
              value: w.count,
              meta: { weekIndex: i },
            }))}
            onBarClick={(i, item) => openWeek(i, item.label, item.value)}
          />
        </PanelCard>

        <PanelCard
          title="Slot Fill Rate by Day"
          sub="Click a row to see slot breakdown"
          borderColor="blue"
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.slotFillRate.length === 0 ? (
              <span style={{ fontSize: 13, color: C.inkLight }}>No data</span>
            ) : (
              data.slotFillRate.map((entry, i) => (
                <FillRateRow
                  key={i}
                  day={entry.day}
                  rate={entry.rate}
                  onClick={() => openDay(entry.day, entry.rate)}
                />
              ))
            )}
          </div>
        </PanelCard>
      </div>

      {/* Slot table + Waitlist */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))',
          gap: 16,
        }}
      >
        <PanelCard
          title="Athletes per Slot — This Week"
          sub="Click a row to see enrolled athletes"
          borderColor="blue"
        >
          {data.slotTable.length === 0 ? (
            <span style={{ fontSize: 13, color: C.inkLight }}>No slots available</span>
          ) : (
            <>
              <div className="pool-slot-table-wrap">
                <table className="pool-slot-table">
                  <thead>
                    <tr>
                      {['Slot', 'Enrolled', 'Capacity', 'Status'].map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slotTable.map((slot) => {
                      const { status, type } = deriveSlotStatus(slot.registered, slot.capacity)
                      return (
                        <tr
                          key={slot.slotId}
                          className="pool-slot-row"
                          onClick={() => openSlot(slot)}
                          title="Click to see enrolled athletes"
                        >
                          <td
                            style={{
                              fontSize: 13,
                              color: C.inkMid,
                              paddingBottom: 12,
                              paddingRight: 12,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <div style={{ fontWeight: 600, color: C.ink }}>{slot.day}</div>
                            <div style={{ color: C.inkLight, fontSize: 12 }}>{slot.time}</div>
                          </td>
                          <td
                            style={{
                              fontFamily: '"Syne",sans-serif',
                              fontWeight: 700,
                              fontSize: 15,
                              color: C.deep,
                              paddingBottom: 12,
                              paddingRight: 12,
                            }}
                          >
                            {slot.registered}
                          </td>
                          <td style={{ paddingBottom: 12, paddingRight: 12, minWidth: 80 }}>
                            <CapacityBar value={slot.registered} max={slot.capacity} />
                            <span
                              style={{
                                fontSize: 11,
                                color: C.inkLight,
                                marginTop: 3,
                                display: 'block',
                              }}
                            >
                              {slot.registered}/{slot.capacity}
                            </span>
                          </td>
                          <td style={{ paddingBottom: 12 }}>
                            <StatusBadge status={status} type={type} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="pool-slot-cards">
                {data.slotTable.map((slot) => {
                  const { status, type } = deriveSlotStatus(slot.registered, slot.capacity)
                  return (
                    <div
                      key={slot.slotId}
                      className="pool-slot-card"
                      onClick={() => openSlot(slot)}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: C.deep }}>
                          {slot.time}
                        </div>
                        <div style={{ fontSize: 12, color: C.inkLight }}>{slot.day}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontFamily: '"Syne",sans-serif',
                            fontWeight: 800,
                            fontSize: 20,
                            color: C.deep,
                            lineHeight: 1,
                          }}
                        >
                          {slot.registered}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: C.inkLight,
                            textTransform: 'uppercase',
                            letterSpacing: '.4px',
                          }}
                        >
                          enrolled
                        </div>
                      </div>
                      <div style={{ gridColumn: '1/-1', marginTop: 4 }}>
                        <CapacityBar value={slot.registered} max={slot.capacity} />
                      </div>
                      <div
                        style={{
                          gridColumn: '1/-1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 6,
                        }}
                      >
                        <span style={{ fontSize: 11, color: C.inkLight }}>
                          {slot.registered}/{slot.capacity} spots
                        </span>
                        <StatusBadge status={status} type={type} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </PanelCard>

        <PanelCard title="Waitlist Summary" borderColor="purple">
          {data.waitlist.length === 0 ? (
            <span style={{ fontSize: 13, color: C.inkLight }}>No athletes on waitlist</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.waitlist.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: C.pale,
                      color: C.deep,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: '"Syne",sans-serif',
                      fontWeight: 700,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(entry.athleteName)}
                  </div>
                  <span
                    style={{
                      fontFamily: '"DM Sans",sans-serif',
                      fontSize: 13,
                      color: C.inkMid,
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.athleteName}
                  </span>
                  <span
                    style={{
                      background: '#ede9fe',
                      color: '#5b21b6',
                      fontFamily: '"DM Sans",sans-serif',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 99,
                      padding: '3px 10px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    #{entry.waitlistPosition}
                  </span>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </div>

      {/* Drawer */}
      <Drawer open={!!drawer} onClose={closeDrawer} title={drawerTitle} sub={drawerSub}>
        {drawer?.kind === 'slot' &&
          (drawerLoading ? (
            <DrawerLoading />
          ) : (
            (() => {
              const d = drawerData as SlotDetail | null
              return (
                <>
                  <SectionLabel label="Enrolled athletes" count={d?.enrolled.length ?? 0} />
                  {!d?.enrolled.length ? (
                    <DrawerEmpty label="No athletes enrolled in this slot." />
                  ) : (
                    d.enrolled.map((a) => (
                      <AthleteLine
                        key={a.id}
                        name={a.name}
                        email={a.email}
                        meta={fmtDate(a.registeredAt)}
                      />
                    ))
                  )}
                  <SectionLabel label="Slot waitlist" count={d?.waitlist.length ?? 0} />
                  {!d?.waitlist.length ? (
                    <DrawerEmpty label="No athletes on waitlist for this slot." />
                  ) : (
                    d.waitlist.map((a) => (
                      <div
                        key={a.position}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 0',
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        <span
                          style={{
                            background: '#ede9fe',
                            color: '#5b21b6',
                            fontFamily: '"DM Sans",sans-serif',
                            fontSize: 11,
                            fontWeight: 600,
                            borderRadius: 99,
                            padding: '3px 8px',
                            flexShrink: 0,
                          }}
                        >
                          #{a.position}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: C.ink,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {a.name}
                          </div>
                          <div style={{ fontSize: 11, color: C.inkLight }}>{a.email}</div>
                        </div>
                        <div style={{ fontSize: 11, color: C.inkLight, flexShrink: 0 }}>
                          {fmtDate(a.joinedAt)}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )
            })()
          ))}

        {drawer?.kind === 'week' &&
          (drawerLoading ? (
            <DrawerLoading />
          ) : (
            (() => {
              const d = drawerData as WeekDetail | null
              return (
                <>
                  <SectionLabel label="Athletes registered" count={d?.athletes.length ?? 0} />
                  {!d?.athletes.length ? (
                    <DrawerEmpty label="No registrations this week." />
                  ) : (
                    d.athletes.map((a) => (
                      <AthleteLine
                        key={a.id}
                        name={a.name}
                        email={a.email}
                        meta={`${a.slotDay} ${a.slotTime}`}
                      />
                    ))
                  )}
                </>
              )
            })()
          ))}

        {drawer?.kind === 'day' && (
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.6 }}>
              Showing aggregated fill rate for <strong>{drawer.day}</strong> across all slots in the
              current cycle.
            </div>
            <div
              style={{ marginTop: 20, background: C.foam, borderRadius: 12, padding: '16px 20px' }}
            >
              <div
                style={{
                  fontFamily: '"Syne",sans-serif',
                  fontWeight: 800,
                  fontSize: 36,
                  color: C.deep,
                }}
              >
                {Math.round(drawer.rate)}%
              </div>
              <div style={{ fontSize: 12, color: C.inkLight, marginTop: 4 }}>
                average capacity used on {drawer.day}
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: C.inkLight }}>
              To see individual athletes per slot, click a row in the "Athletes per Slot" table.
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
