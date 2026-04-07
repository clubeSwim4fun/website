'use client'

import React, { useEffect, useState } from 'react'
import { Banner, LoadingOverlay } from '@payloadcms/ui'
import { useRequireAdmin } from '@/admin/utils/requireAdmin'

// ─── CSS-in-JS design tokens (mirrors the HTML reference) ─────────────────────
const C = {
  deep: '#0a4a6e',
  mid: '#0e7ea8',
  light: '#3bb8d8',
  pale: '#e0f5fb',
  foam: '#f0fafd',
  sand: '#fdf8f3',
  coral: '#e85d4a',
  coralL: '#fdf0ee',
  amber: '#f0a020',
  amberL: '#fef6e4',
  green: '#2ecc71',
  greenL: '#e8f8f0',
  greenD: '#1a9950',
  purple: '#a78bfa',
  purpleL: '#f3f0ff',
  ink: '#0f1f2e',
  inkMid: '#3d5a70',
  inkLight: '#8aaabb',
  border: '#d4eaf2',
  white: '#fff',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PoolData {
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

interface MembersData {
  newMembersThisMonth: number
  feesCollected: number
  pendingPayment: number
  activeAccounts: number
  monthlySignups: { month: string; count: number }[]
  paymentBreakdown: { label: string; count: number }[]
  recentMembers: {
    id: string
    name: string
    surname: string
    email: string
    status: string
    createdAt: string
  }[]
}

interface EventsData {
  activeEvents: number
  totalEnrolled: number
  upcomingIn30Days: number
  totalWaitlisted: number
  events: {
    id: string
    title: string
    start: string
    end: string
    enrolledCount: number
    ticketCount: number
  }[]
  enrollmentByEvent: { eventTitle: string; enrolled: number }[]
  weeklySignups: { week: string; count: number }[]
}

type TabId = 'pool' | 'members' | 'events'

// ─── Shared primitives ────────────────────────────────────────────────────────

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: C.white,
        border: `2px solid ${C.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function PanelHeader({
  title,
  sub,
  badge,
  badgeColor,
}: {
  title: string
  sub?: string
  badge?: string
  badgeColor?: 'blue' | 'green' | 'amber'
}) {
  const badgeBg = badgeColor === 'green' ? C.greenL : badgeColor === 'amber' ? C.amberL : C.pale
  const badgeFg = badgeColor === 'green' ? C.greenD : badgeColor === 'amber' ? '#b07010' : C.deep
  return (
    <div
      style={{
        padding: '16px 20px',
        borderBottom: `1.5px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div>
        <div
          style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: C.deep }}
        >
          {title}
        </div>
        {sub && <div style={{ fontSize: 12, color: C.inkLight, marginTop: 2 }}>{sub}</div>}
      </div>
      {badge && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.6px',
            padding: '3px 9px',
            borderRadius: 99,
            background: badgeBg,
            color: badgeFg,
            whiteSpace: 'nowrap',
          }}
        >
          {badge}
        </span>
      )}
    </div>
  )
}

function PanelBody({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return <div style={{ padding: '18px 20px', ...style }}>{children}</div>
}

type BarColor = 'blue' | 'green' | 'amber' | 'coral' | 'purple'
const barColors: Record<BarColor, string> = {
  blue: C.mid,
  green: C.green,
  amber: C.amber,
  coral: C.coral,
  purple: C.purple,
}

function StatCard({
  label,
  value,
  sub,
  trend,
  trendType,
  barColor,
}: {
  label: string
  value: string | number
  sub?: string
  trend?: string
  trendType?: 'up' | 'down' | 'flat'
  barColor: BarColor
}) {
  const trendBg = trendType === 'up' ? C.greenL : trendType === 'down' ? C.coralL : C.pale
  const trendFg = trendType === 'up' ? C.greenD : trendType === 'down' ? C.coral : C.mid
  return (
    <div
      style={{
        background: C.white,
        border: `2px solid ${C.border}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '6px 1fr', alignItems: 'stretch' }}>
        <div style={{ width: 6, background: barColors[barColor], alignSelf: 'stretch' }} />
        <div style={{ padding: '18px 18px 16px' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '.7px',
              color: C.inkLight,
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: C.deep,
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          {sub && <div style={{ fontSize: 12, color: C.inkLight, marginTop: 5 }}>{sub}</div>}
          {trend && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: 99,
                marginTop: 6,
                background: trendBg,
                color: trendFg,
              }}
            >
              {trend}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatsGrid({ children }: { children: React.ReactNode }) {
  return <div className="dash-stats-grid">{children}</div>
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="dash-row2">{children}</div>
}

function RowFull({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 16 }}>{children}</div>
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function BarChart({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 10,
        height: 160,
        paddingTop: 20,
        paddingBottom: 4,
      }}
    >
      {data.map((d, i) => {
        const h = Math.max(8, Math.round((d.value / max) * 120))
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              flex: 1,
            }}
          >
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 11,
                fontWeight: 700,
                color: C.inkMid,
                textAlign: 'center',
              }}
            >
              {d.value}
            </div>
            <div
              style={{
                height: h,
                width: '100%',
                borderRadius: '5px 5px 0 0',
                background: d.color ?? C.mid,
                minHeight: 4,
              }}
            />
            <div
              style={{ fontSize: 10, color: C.inkLight, textAlign: 'center', whiteSpace: 'nowrap' }}
            >
              {d.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Donut chart ──────────────────────────────────────────────────────────────

function DonutChart({
  segments,
  total,
  centerLabel,
}: {
  segments: { label: string; count: number; color: string }[]
  total: number
  centerLabel: string
}) {
  const r = 40
  const circ = 2 * Math.PI * r
  let offset = 0
  const arcs = segments.map((s) => {
    const len = total > 0 ? (s.count / total) * circ : 0
    const arc = { ...s, dasharray: `${len} ${circ - len}`, dashoffset: -offset }
    offset += len
    return arc
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '4px 0' }}>
      <svg width="110" height="110" viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke={C.border} strokeWidth="16" />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx="55"
            cy="55"
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="16"
            strokeDasharray={arc.dasharray}
            strokeDashoffset={arc.dashoffset}
            transform="rotate(-90 55 55)"
          />
        ))}
        <text
          x="55"
          y="51"
          textAnchor="middle"
          fontFamily="Syne,sans-serif"
          fontSize="18"
          fontWeight="800"
          fill={C.deep}
        >
          {total}
        </text>
        <text
          x="55"
          y="65"
          textAnchor="middle"
          fontFamily="DM Sans,sans-serif"
          fontSize="10"
          fill={C.inkLight}
        >
          {centerLabel}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: s.color,
                flexShrink: 0,
              }}
            />
            <span style={{ color: C.inkMid, flex: 1 }}>{s.label}</span>
            <span
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: C.ink,
              }}
            >
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeType = 'green' | 'amber' | 'coral' | 'blue' | 'purple' | 'gray'
const badgeBg: Record<BadgeType, string> = {
  green: C.greenL,
  amber: C.amberL,
  coral: C.coralL,
  blue: C.pale,
  purple: C.purpleL,
  gray: '#f1f5f9',
}
const badgeFg: Record<BadgeType, string> = {
  green: C.greenD,
  amber: '#b07010',
  coral: C.coral,
  blue: C.deep,
  purple: '#7c3aed',
  gray: '#64748b',
}

function Badge({ label, type }: { label: string; type: BadgeType }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 99,
        textTransform: 'uppercase',
        letterSpacing: '.5px',
        whiteSpace: 'nowrap',
        background: badgeBg[type],
        color: badgeFg[type],
      }}
    >
      {label}
    </span>
  )
}

// ─── Mini capacity bar ────────────────────────────────────────────────────────

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  const fill = pct >= 100 ? C.coral : pct >= 75 ? C.amber : C.green
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div
        style={{ height: 5, background: C.border, borderRadius: 99, overflow: 'hidden', width: 80 }}
      >
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: fill }} />
      </div>
      <div style={{ fontSize: 11, color: C.inkLight }}>
        {value}/{max}
      </div>
    </div>
  )
}

// ─── Progress row (slot fill rate) ───────────────────────────────────────────

function ProgRow({ name, value, max }: { name: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  const fill = pct >= 100 ? C.coral : pct >= 75 ? C.amber : C.green
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
      <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, width: 90, flexShrink: 0 }}>
        {name}
      </div>
      <div
        style={{ flex: 1, height: 8, background: C.border, borderRadius: 99, overflow: 'hidden' }}
      >
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: fill }} />
      </div>
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: C.ink,
          width: 36,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {value}
      </div>
      <div
        style={{ fontSize: 11, color: C.inkLight, width: 32, textAlign: 'right', flexShrink: 0 }}
      >
        {pct}%
      </div>
    </div>
  )
}

// ─── Waitlist item ────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length === 1
    ? (parts[0]?.[0]?.toUpperCase() ?? '?')
    : ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

function WaitlistItem({ name, sub, pos }: { name: string; sub?: string; pos: string }) {
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
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: C.pale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Syne',sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: C.deep,
          flexShrink: 0,
        }}
      >
        {getInitials(name)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{name}</div>
        {sub && <div style={{ fontSize: 11, color: C.inkLight, marginTop: 1 }}>{sub}</div>}
      </div>
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: C.purple,
          background: C.purpleL,
          padding: '3px 8px',
          borderRadius: 99,
          flexShrink: 0,
        }}
      >
        {pos}
      </div>
    </div>
  )
}

// ─── Event card ───────────────────────────────────────────────────────────────

function EventCard({
  title,
  date,
  enrolledCount,
  ticketCount,
}: {
  title: string
  date: string
  enrolledCount: number
  ticketCount: number
}) {
  const pct = ticketCount > 0 ? Math.round((enrolledCount / ticketCount) * 100) : 0
  const fillColor = pct >= 90 ? C.coral : pct >= 60 ? C.amber : C.green
  const stripColor = pct >= 90 ? C.coral : pct >= 60 ? C.amber : C.mid
  const statusType: BadgeType = pct >= 100 ? 'coral' : pct >= 75 ? 'amber' : 'blue'
  const statusLabel = pct >= 100 ? 'Full' : pct >= 75 ? 'Limited' : 'Available'
  const spotsLeft = Math.max(ticketCount - enrolledCount, 0)

  return (
    <div
      style={{
        background: C.white,
        border: `2px solid ${C.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '7px 1fr' }}>
        <div style={{ width: 7, background: stripColor, alignSelf: 'stretch' }} />
        <div style={{ padding: '16px 20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 10,
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.deep,
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 12, color: C.inkLight, marginTop: 3 }}>📅 {date}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: C.deep,
                }}
              >
                {enrolledCount}
              </div>
              <div style={{ fontSize: 11, color: C.inkLight }}>of {ticketCount} spots</div>
            </div>
          </div>
          <div
            style={{
              height: 6,
              background: C.border,
              borderRadius: 99,
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <div
              style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: fillColor }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 10,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Badge label={statusLabel} type={statusType} />
              <Badge label={`${pct}% full`} type="gray" />
            </div>
            <span style={{ fontSize: 12, color: C.inkLight }}>{spotsLeft} spots remaining</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; labelShort: string; sub: string }[] = [
  {
    id: 'pool',
    label: '🏊 Pool subscriptions',
    labelShort: '🏊 Pool',
    sub: 'Slots, capacity & waitlists',
  },
  { id: 'members', label: '👤 Memberships', labelShort: '👤 Members', sub: 'Registrations & fees' },
  { id: 'events', label: '🏅 Events', labelShort: '🏅 Events', sub: 'Active & upcoming' },
]

function TabBar({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        marginBottom: 28,
        background: C.white,
        border: `1.5px solid ${C.border}`,
        borderRadius: 12,
        padding: 5,
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all .18s',
              background: isActive ? `linear-gradient(135deg,${C.deep},${C.mid})` : 'transparent',
            }}
          >
            <span
              className="tab-label-full"
              style={{
                display: 'block',
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: isActive ? '#fff' : C.inkMid,
              }}
            >
              {tab.label}
            </span>
            <span
              className="tab-label-short"
              style={{
                display: 'none',
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: isActive ? '#fff' : C.inkMid,
              }}
            >
              {tab.labelShort}
            </span>
            <span
              className="tab-sub"
              style={{
                display: 'block',
                fontSize: 11,
                marginTop: 1,
                color: isActive ? 'rgba(255,255,255,.8)' : C.inkLight,
              }}
            >
              {tab.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Pool tab ─────────────────────────────────────────────────────────────────

// Shared drawer for ClubDashboard pool tab
function PoolDrawer({
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
  React.useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])
  return (
    <>
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
          transition: 'opacity .22s',
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(480px,100vw)',
          background: C.white,
          boxShadow: '-8px 0 40px rgba(10,74,110,.15)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .26s cubic-bezier(.4,0,.2,1)',
        }}
      >
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>{children}</div>
      </div>
    </>
  )
}

type PoolDrawerContent =
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

interface ClubSlotDetail {
  enrolled: { id: string; name: string; email: string; registeredAt: string }[]
  waitlist: { position: number; name: string; email: string; joinedAt: string }[]
}
interface ClubWeekDetail {
  week: { label: string } | null
  athletes: {
    id: string
    name: string
    email: string
    slotDay: string
    slotTime: string
    registeredAt: string
  }[]
}

function PoolTab({ data }: { data: PoolData }) {
  const now = new Date()
  const monthLabel = now.toLocaleString('en', { month: 'long', year: 'numeric' })
  const [drawer, setDrawer] = React.useState<PoolDrawerContent>(null)
  const [drawerData, setDrawerData] = React.useState<ClubSlotDetail | ClubWeekDetail | null>(null)
  const [drawerLoading, setDrawerLoading] = React.useState(false)
  const [hovBar, setHovBar] = React.useState<number | null>(null)

  const openSlot = (slot: PoolData['slotTable'][0]) => {
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
  }
  const openWeek = (i: number, label: string, count: number) => {
    setDrawer({ kind: 'week', weekIndex: i, weekLabel: label, count })
    setDrawerData(null)
    setDrawerLoading(true)
    fetch(`/api/dashboard/pool/week/${i}`)
      .then((r) => r.json())
      .then(setDrawerData)
      .finally(() => setDrawerLoading(false))
  }
  const openDay = (day: string, rate: number) => setDrawer({ kind: 'day', day, rate })
  const closeDrawer = () => setDrawer(null)

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
          ? `${Math.round((drawer as any).rate ?? 0)}% capacity used`
          : ''

  const barMax = Math.max(...data.weeklyRegistrations.map((w) => w.count), 1)

  return (
    <>
      <StatsGrid>
        <StatCard
          label="Subscribed athletes"
          value={data.subscribedAthletes}
          sub={monthLabel}
          barColor="blue"
        />
        <StatCard
          label="Slots confirmed"
          value={data.confirmedSlotsThisWeek}
          sub="this week"
          barColor="green"
        />
        <StatCard
          label="On waitlist"
          value={data.waitlistTotal}
          sub="across all slots"
          barColor="amber"
        />
        <StatCard
          label="Full slots"
          value={data.fullSlotsCount}
          sub="out of total"
          barColor="coral"
        />
      </StatsGrid>

      <Row2>
        <Panel>
          <PanelHeader
            title={`Weekly registrations — ${monthLabel}`}
            sub="Click a bar to see who registered"
            badge="4 weeks"
            badgeColor="blue"
          />
          <PanelBody>
            {/* Interactive bar chart */}
            <div style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 10,
                  height: 160,
                  paddingTop: 20,
                  boxSizing: 'border-box',
                }}
              >
                {data.weeklyRegistrations.map((w, i) => {
                  const pct = (w.count / barMax) * 100
                  const isHov = hovBar === i
                  return (
                    <div
                      key={i}
                      onClick={() => openWeek(i, w.week, w.count)}
                      onMouseEnter={() => setHovBar(i)}
                      onMouseLeave={() => setHovBar(null)}
                      title={`${w.week}: ${w.count} — click for details`}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '100%',
                        gap: 5,
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Syne',sans-serif",
                          fontSize: 11,
                          fontWeight: isHov ? 700 : 400,
                          color: isHov ? C.deep : C.inkMid,
                          transition: 'color .15s',
                        }}
                      >
                        {w.count}
                      </div>
                      <div
                        style={{
                          height: `${pct}%`,
                          width: '100%',
                          borderRadius: '5px 5px 0 0',
                          background: isHov ? C.deep : C.mid,
                          minHeight: 4,
                          transition: 'background .15s, transform .15s',
                          transform: isHov ? 'scaleX(0.9)' : 'scaleX(1)',
                          boxShadow: isHov ? '0 4px 12px rgba(10,74,110,.25)' : 'none',
                        }}
                      />
                      <div
                        style={{
                          fontSize: 10,
                          color: isHov ? C.deep : C.inkLight,
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          transition: 'color .15s',
                        }}
                      >
                        {w.week}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader
            title="Slot fill rate by day"
            sub="Click a row to see slot breakdown"
            badge="This week"
            badgeColor="green"
          />
          <PanelBody>
            {data.slotFillRate.length === 0 ? (
              <span style={{ fontSize: 13, color: C.inkLight }}>No data</span>
            ) : (
              data.slotFillRate.map((entry, i) => {
                const pct = Math.min(Math.round(entry.rate), 100)
                const fill = pct >= 100 ? C.coral : pct >= 75 ? C.amber : C.green
                return (
                  <div
                    key={i}
                    onClick={() => openDay(entry.day, entry.rate)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 8px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.foam)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: C.ink,
                        width: 90,
                        flexShrink: 0,
                      }}
                    >
                      {entry.day}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        background: C.border,
                        borderRadius: 99,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          borderRadius: 99,
                          background: fill,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.ink,
                        width: 36,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {pct}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.inkLight,
                        width: 32,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {pct}%
                    </div>
                    <span style={{ fontSize: 11, color: C.inkLight }}>›</span>
                  </div>
                )
              })
            )}
          </PanelBody>
        </Panel>
      </Row2>

      <Row2>
        <Panel>
          <PanelHeader
            title="Athletes per slot — this week"
            sub="Click a row to see enrolled athletes"
          />
          <PanelBody>
            {data.slotTable.length === 0 ? (
              <span style={{ fontSize: 13, color: C.inkLight }}>No slots</span>
            ) : (
              <>
                <div className="club-slot-table-wrap">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {['Slot', 'Day', 'Enrolled', 'Capacity', 'Status'].map((col) => (
                          <th
                            key={col}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '.6px',
                              color: C.inkLight,
                              padding: '8px 12px',
                              textAlign: 'left',
                              borderBottom: `1.5px solid ${C.border}`,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slotTable.map((slot) => {
                        const pct =
                          slot.capacity > 0
                            ? Math.round((slot.registered / slot.capacity) * 100)
                            : 0
                        const type: BadgeType = pct >= 100 ? 'coral' : pct >= 75 ? 'amber' : 'green'
                        const label = pct >= 100 ? 'Full' : pct >= 75 ? 'Limited' : 'Available'
                        return (
                          <tr
                            key={slot.slotId}
                            onClick={() => openSlot(slot)}
                            title="Click to see enrolled athletes"
                            style={{
                              borderBottom: `1px solid ${C.border}`,
                              cursor: 'pointer',
                              transition: 'background .15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = C.foam)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <td style={{ padding: '11px 12px', fontWeight: 500, color: C.ink }}>
                              {slot.time}
                            </td>
                            <td style={{ padding: '11px 12px', color: C.inkMid }}>{slot.day}</td>
                            <td style={{ padding: '11px 12px', color: C.inkMid }}>
                              {slot.registered}
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <MiniBar value={slot.registered} max={slot.capacity} />
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <Badge label={label} type={type} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="club-slot-cards">
                  {data.slotTable.map((slot) => {
                    const pct =
                      slot.capacity > 0 ? Math.round((slot.registered / slot.capacity) * 100) : 0
                    const type: BadgeType = pct >= 100 ? 'coral' : pct >= 75 ? 'amber' : 'green'
                    const label = pct >= 100 ? 'Full' : pct >= 75 ? 'Limited' : 'Available'
                    return (
                      <div
                        key={slot.slotId}
                        onClick={() => openSlot(slot)}
                        style={{
                          background: C.foam,
                          borderRadius: 10,
                          padding: '12px 14px',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '4px 12px',
                          alignItems: 'center',
                          marginBottom: 10,
                          cursor: 'pointer',
                          transition: 'box-shadow .15s',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.boxShadow = '0 2px 12px rgba(10,74,110,.12)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
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
                              fontFamily: "'Syne',sans-serif",
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
                        <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                          <MiniBar value={slot.registered} max={slot.capacity} />
                        </div>
                        <div
                          style={{
                            gridColumn: '1 / -1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: 6,
                          }}
                        >
                          <span style={{ fontSize: 11, color: C.inkLight }}>
                            {slot.registered}/{slot.capacity} spots
                          </span>
                          <Badge label={label} type={type} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader
            title="Waitlist summary"
            sub="Athletes waiting for a confirmed spot"
            badge={`${data.waitlistTotal} waiting`}
            badgeColor="amber"
          />
          <PanelBody>
            {data.waitlist.length === 0 ? (
              <span style={{ fontSize: 13, color: C.inkLight }}>No athletes on waitlist</span>
            ) : (
              data.waitlist.map((entry, i) => (
                <WaitlistItem key={i} name={entry.athleteName} pos={`#${entry.waitlistPosition}`} />
              ))
            )}
          </PanelBody>
        </Panel>
      </Row2>

      {/* Drawer */}
      <PoolDrawer open={!!drawer} onClose={closeDrawer} title={drawerTitle} sub={drawerSub}>
        {drawer?.kind === 'slot' &&
          (drawerLoading ? (
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
          ) : (
            (() => {
              const d = drawerData as ClubSlotDetail | null
              return (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                      marginTop: 4,
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
                      Enrolled athletes
                    </span>
                    <span
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: C.deep,
                      }}
                    >
                      {d?.enrolled.length ?? 0}
                    </span>
                  </div>
                  {!d?.enrolled.length ? (
                    <div style={{ fontSize: 13, color: C.inkLight, padding: '12px 0' }}>
                      No athletes enrolled.
                    </div>
                  ) : (
                    d.enrolled.map((a) => (
                      <div
                        key={a.id}
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
                          {getInitials(a.name || '?')}
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
                            {a.name}
                          </div>
                          <div style={{ fontSize: 11, color: C.inkLight }}>{a.email}</div>
                        </div>
                        <div style={{ fontSize: 11, color: C.inkLight, flexShrink: 0 }}>
                          {new Date(a.registeredAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </div>
                      </div>
                    ))
                  )}
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
                      Slot waitlist
                    </span>
                    <span
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: C.deep,
                      }}
                    >
                      {d?.waitlist.length ?? 0}
                    </span>
                  </div>
                  {!d?.waitlist.length ? (
                    <div style={{ fontSize: 13, color: C.inkLight, padding: '12px 0' }}>
                      No athletes on waitlist.
                    </div>
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
                      </div>
                    ))
                  )}
                </>
              )
            })()
          ))}
        {drawer?.kind === 'week' &&
          (drawerLoading ? (
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
          ) : (
            (() => {
              const d = drawerData as ClubWeekDetail | null
              return (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
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
                      Athletes registered
                    </span>
                    <span
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: C.deep,
                      }}
                    >
                      {d?.athletes.length ?? 0}
                    </span>
                  </div>
                  {!d?.athletes.length ? (
                    <div style={{ fontSize: 13, color: C.inkLight, padding: '12px 0' }}>
                      No registrations this week.
                    </div>
                  ) : (
                    d.athletes.map((a) => (
                      <div
                        key={a.id}
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
                          {getInitials(a.name || '?')}
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
                            {a.name}
                          </div>
                          <div style={{ fontSize: 11, color: C.inkLight }}>{a.email}</div>
                        </div>
                        <div style={{ fontSize: 11, color: C.inkLight, flexShrink: 0 }}>
                          {a.slotDay} {a.slotTime}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )
            })()
          ))}
        {drawer?.kind === 'day' && (
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.6 }}>
              Aggregated fill rate for <strong>{drawer.day}</strong> across all slots in the current
              cycle.
            </div>
            <div
              style={{ marginTop: 20, background: C.foam, borderRadius: 12, padding: '16px 20px' }}
            >
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
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
              To see individual athletes, click a row in the "Athletes per Slot" table.
            </div>
          </div>
        )}
      </PoolDrawer>
    </>
  )
}

// ─── Members tab ──────────────────────────────────────────────────────────────

function deriveMemberBadge(status: string): { label: string; type: BadgeType } {
  const map: Record<string, { label: string; type: BadgeType }> = {
    active: { label: 'Active', type: 'blue' },
    pendingPayment: { label: 'Pending Payment', type: 'amber' },
    pendingAnalysis: { label: 'Pending Analysis', type: 'amber' },
    pendingUpdate: { label: 'Pending Update', type: 'amber' },
    expired: { label: 'Expired', type: 'coral' },
  }
  return map[status] ?? { label: status, type: 'gray' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const paymentColors: Record<string, string> = { Paid: C.green, Pending: C.amber, Failed: C.coral }

function MembersTab({ data }: { data: MembersData }) {
  const now = new Date()
  const monthLabel = now.toLocaleString('en', { month: 'long', year: 'numeric' })
  const currentMonthShort = now.toLocaleString('en', { month: 'short' })

  const barData = data.monthlySignups.map((item) => ({
    label: item.month,
    value: item.count,
    color: item.month === currentMonthShort ? C.deep : C.mid,
  }))

  const donutSegments = data.paymentBreakdown.map((item) => ({
    label: item.label,
    count: item.count,
    color: paymentColors[item.label] ?? C.inkLight,
  }))
  const donutTotal = data.paymentBreakdown.reduce((s, i) => s + i.count, 0)

  return (
    <>
      <StatsGrid>
        <StatCard
          label="New members"
          value={data.newMembersThisMonth}
          sub="this month"
          barColor="blue"
        />
        <StatCard
          label="Fees collected"
          value={`€ ${data.feesCollected}`}
          sub="registration fees"
          barColor="green"
        />
        <StatCard
          label="Pending payment"
          value={data.pendingPayment}
          sub="awaiting fee"
          barColor="amber"
        />
        <StatCard label="Active accounts" value={data.activeAccounts} barColor="green" />
      </StatsGrid>

      <Row2>
        <Panel>
          <PanelHeader title="New registrations — last 6 months" sub="Monthly new member signups" />
          <PanelBody>
            <BarChart data={barData} />
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Payment status breakdown" sub={monthLabel} />
          <PanelBody>
            <DonutChart segments={donutSegments} total={donutTotal} centerLabel="members" />
          </PanelBody>
        </Panel>
      </Row2>

      <RowFull>
        <Panel>
          <PanelHeader
            title="Recent registrations"
            sub={`New members this month — sorted by signup date`}
            badge={monthLabel}
            badgeColor="blue"
          />
          <PanelBody style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Name', 'Joined', 'Status', 'Registration Date'].map((col) => (
                    <th
                      key={col}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '.6px',
                        color: C.inkLight,
                        padding: '8px 12px',
                        textAlign: 'left',
                        borderBottom: `1.5px solid ${C.border}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ padding: '24px 12px', textAlign: 'center', color: C.inkLight }}
                    >
                      No recent registrations
                    </td>
                  </tr>
                ) : (
                  data.recentMembers.map((member, i) => {
                    const badge = deriveMemberBadge(member.status)
                    return (
                      <tr key={member.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '11px 12px', fontWeight: 500, color: C.ink }}>
                          {member.name} {member.surname}
                        </td>
                        <td style={{ padding: '11px 12px', color: C.inkMid }}>
                          {formatDate(member.createdAt)}
                        </td>
                        <td style={{ padding: '11px 12px' }}>
                          <Badge label={badge.label} type={badge.type} />
                        </td>
                        <td style={{ padding: '11px 12px', color: C.inkMid }}>{member.email}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </PanelBody>
        </Panel>
      </RowFull>
    </>
  )
}

// ─── Events tab ───────────────────────────────────────────────────────────────

function EventsTab({ data }: { data: EventsData }) {
  const enrollmentBarData = data.enrollmentByEvent.map((item) => ({
    label: item.eventTitle.slice(0, 8),
    value: item.enrolled,
    color: C.mid,
  }))
  const weeklyBarData = data.weeklySignups.map((item, i, arr) => ({
    label: item.week,
    value: item.count,
    color: i === arr.length - 1 ? C.deep : i >= arr.length - 3 ? C.mid : C.light,
  }))

  return (
    <>
      <StatsGrid>
        <StatCard
          label="Active events"
          value={data.activeEvents}
          sub="open for registration"
          barColor="blue"
        />
        <StatCard
          label="Total enrolled"
          value={data.totalEnrolled}
          sub="across all events"
          barColor="green"
        />
        <StatCard
          label="Upcoming (30d)"
          value={data.upcomingIn30Days}
          sub="events scheduled"
          barColor="amber"
        />
        <StatCard
          label="Waitlisted"
          value={data.totalWaitlisted}
          sub="across all events"
          barColor="purple"
        />
      </StatsGrid>

      <RowFull>
        <Panel>
          <PanelHeader
            title="Active & upcoming events"
            sub="Sorted by event date — showing registrations and capacity"
            badge={`${data.activeEvents} active`}
            badgeColor="green"
          />
          <PanelBody>
            {data.events.length === 0 ? (
              <p style={{ fontSize: 14, color: C.inkLight, margin: 0 }}>
                No active or upcoming events.
              </p>
            ) : (
              data.events.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  date={formatDate(event.start)}
                  enrolledCount={event.enrolledCount}
                  ticketCount={event.ticketCount}
                />
              ))
            )}
          </PanelBody>
        </Panel>
      </RowFull>

      <Row2>
        <Panel>
          <PanelHeader title="Enrollment by event" sub="Athletes registered vs capacity" />
          <PanelBody>
            <BarChart data={enrollmentBarData} />
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Registration timeline" sub="Sign-ups per week — last 6 weeks" />
          <PanelBody>
            <BarChart data={weeklyBarData} />
          </PanelBody>
        </Panel>
      </Row2>
    </>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function getInitialTab(): TabId {
  if (typeof window === 'undefined') return 'pool'
  const p = new URLSearchParams(window.location.search).get('tab')
  return p === 'pool' || p === 'members' || p === 'events' ? p : 'pool'
}

export default function ClubDashboard() {
  const { isAdmin } = useRequireAdmin()
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab)
  const [poolData, setPoolData] = useState<PoolData | null>(null)
  const [membersData, setMembersData] = useState<MembersData | null>(null)
  const [eventsData, setEventsData] = useState<EventsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const now = new Date()
  const cycleLabel = now.toLocaleString('en', { month: 'long', year: 'numeric' })

  useEffect(() => {
    if (!isAdmin) return
    Promise.all([
      fetch('/api/dashboard/pool').then((r) => r.json()),
      fetch('/api/dashboard/members').then((r) => r.json()),
      fetch('/api/dashboard/events').then((r) => r.json()),
    ])
      .then(([pool, members, events]) => {
        setPoolData(pool)
        setMembersData(members)
        setEventsData(events)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [isAdmin])

  function handleTabChange(tab: TabId) {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.replaceState(null, '', url.toString())
  }

  if (!isAdmin) return <Banner type="error">You do not have permission to view this page.</Banner>
  if (loading) return <LoadingOverlay />
  if (error || !poolData || !membersData || !eventsData) {
    return (
      <div
        style={{
          padding: '2rem',
          fontFamily: "'DM Sans',sans-serif",
          color: C.coral,
          fontSize: 14,
        }}
      >
        {error ?? 'Failed to load data.'}
      </div>
    )
  }

  return (
    <div
      style={{
        background: C.sand,
        minHeight: '100vh',
        padding: '36px 24px 80px',
        boxSizing: 'border-box',
        width: '100%',
        fontFamily: "'DM Sans',sans-serif",
        color: C.ink,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .dash-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px;}
        .dash-row2{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:16px;margin-bottom:16px;}
        .club-slot-cards{display:none;}
        @media(max-width:900px){
          .dash-stats-grid{grid-template-columns:repeat(2,1fr);}
          .dash-row2{grid-template-columns:1fr;}
        }
        @media(max-width:600px){
          .club-slot-table-wrap{display:none;}
          .club-slot-cards{display:block;}
          .tab-label-full{display:none !important;}
          .tab-label-short{display:block !important;}
          .tab-sub{display:none !important;}
        }
        @media(max-width:520px){
          .dash-stats-grid{grid-template-columns:1fr;}
        }
      `}</style>

      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 26,
              fontWeight: 800,
              color: C.deep,
            }}
          >
            Club Dashboard
          </div>
          <div style={{ fontSize: 14, color: C.inkMid, marginTop: 4 }}>
            Overview of pool subscriptions, memberships, and upcoming events
          </div>
        </div>
        <div
          style={{
            background: `linear-gradient(135deg,${C.deep},${C.mid})`,
            color: '#fff',
            borderRadius: 99,
            padding: '8px 18px',
            fontFamily: "'Syne',sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '.4px',
            whiteSpace: 'nowrap',
          }}
        >
          {cycleLabel} — Active cycle
        </div>
      </div>

      <TabBar active={activeTab} onChange={handleTabChange} />

      {activeTab === 'pool' && <PoolTab data={poolData} />}
      {activeTab === 'members' && <MembersTab data={membersData} />}
      {activeTab === 'events' && <EventsTab data={eventsData} />}
    </div>
  )
}
