'use client'
import React from 'react'
import { T } from '../tokens'
import { relativeTime } from '../utils'

interface QueueSectionProps {
  id: string
  icon: string
  title: string
  count: number
  oldestAt?: string | null
  oldestName?: string | null
  hasFilter?: boolean
  filterContent?: React.ReactNode
  children: React.ReactNode
  sectionRef?: React.RefObject<HTMLDivElement | null>
}

export default function QueueSection({
  id,
  icon,
  title,
  count,
  oldestAt,
  oldestName,
  hasFilter,
  filterContent,
  children,
  sectionRef,
}: QueueSectionProps) {
  const [collapsed, setCollapsed] = React.useState(count === 0)
  const [filterOpen, setFilterOpen] = React.useState(false)

  // Auto-expand when count changes from 0 to >0
  React.useEffect(() => {
    if (count > 0) setCollapsed(false)
  }, [count])

  const hasItems = count > 0

  return (
    <div
      id={id}
      ref={sectionRef}
      style={{
        background: T.bgSurface,
        border: `1px solid ${T.borderSubtle}`,
        borderRadius: T.rLg,
        marginBottom: 12,
        overflow: 'hidden',
        opacity: collapsed && !hasItems ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Section header */}
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          background: T.bgRaised,
          borderBottom: collapsed ? 'none' : `1px solid ${T.borderSubtle}`,
          cursor: 'pointer',
          userSelect: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: T.textPrimary,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            background: hasItems ? T.tealDim : T.bgActive,
            border: `1px solid ${hasItems ? T.tealBorder : T.borderDefault}`,
            color: hasItems ? T.teal : T.textSecondary,
            padding: '1px 8px',
            borderRadius: 10,
          }}
        >
          {count}
        </span>
        {oldestAt && oldestName && (
          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 4 }}>
            Oldest: <span style={{ color: T.textSecondary }}>{oldestName}</span>
            {' — '}
            <span style={{ color: T.amber }}>{relativeTime(oldestAt)}</span>
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasFilter && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFilterOpen((f) => !f)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                background: T.bgActive,
                border: `1px solid ${T.borderDefault}`,
                borderRadius: T.rSm,
                color: T.textSecondary,
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              ⚙ Filters
            </button>
          )}
          <span style={{ fontSize: 11, color: T.textMuted, width: 20, textAlign: 'center' }}>
            {collapsed ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {/* Filter bar */}
      {hasFilter && filterOpen && !collapsed && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            background: T.bgBase,
            borderBottom: `1px solid ${T.borderSubtle}`,
            flexWrap: 'wrap',
          }}
        >
          {filterContent}
        </div>
      )}

      {/* Body */}
      {!collapsed && <div>{children}</div>}
    </div>
  )
}

// Shared filter primitives
export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, color: T.textMuted }}>{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: T.bgRaised,
          border: `1px solid ${T.borderDefault}`,
          borderRadius: T.rSm,
          color: T.textSecondary,
          fontSize: 12,
          padding: '4px 8px',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function FilterSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? 'Search…'}
      style={{
        background: T.bgRaised,
        border: `1px solid ${T.borderDefault}`,
        borderRadius: T.rSm,
        color: T.textPrimary,
        fontSize: 12,
        padding: '4px 10px',
        outline: 'none',
        width: 160,
      }}
    />
  )
}

export function FilterReset({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        color: T.textMuted,
        fontSize: 11,
        cursor: 'pointer',
        padding: '4px 6px',
      }}
    >
      ✕ Reset
    </button>
  )
}

// Shared table primitives
export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div style={{ overflowX: 'auto' }}>{children}</div>
}

export function Th({ children, width }: { children?: React.ReactNode; width?: number | string }) {
  return (
    <th
      style={{
        padding: '8px 12px',
        textAlign: 'left',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        color: T.textMuted,
        borderBottom: `1px solid ${T.borderSubtle}`,
        background: T.bgBase,
        whiteSpace: 'nowrap',
        width: width ?? undefined,
      }}
    >
      {children}
    </th>
  )
}

export function UrgencyDot({ urgency }: { urgency: string }) {
  const color = urgency === 'red' ? T.red : urgency === 'amber' ? T.amber : T.textDisabled
  const shadow =
    urgency === 'red' ? `0 0 5px ${T.red}` : urgency === 'amber' ? `0 0 5px ${T.amber}` : 'none'
  return (
    <td style={{ width: 28, textAlign: 'center', padding: '10px 12px' }}>
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          boxShadow: shadow,
          margin: '0 auto',
        }}
      />
    </td>
  )
}

export function PersonCell({
  name,
  email,
  badge,
}: {
  name: string
  email: string
  badge?: React.ReactNode
}) {
  return (
    <td style={{ padding: '10px 12px' }}>
      <div style={{ fontWeight: 600, color: T.textPrimary, fontSize: 13 }}>
        {name}
        {badge && <span style={{ marginLeft: 6 }}>{badge}</span>}
      </div>
      <div
        style={{
          fontSize: 11,
          color: T.textMuted,
          fontFamily: "'Geist Mono', monospace",
        }}
      >
        {email}
      </div>
    </td>
  )
}

export function TimeCell({ iso }: { iso: string }) {
  return (
    <td style={{ padding: '10px 12px' }}>
      <div style={{ color: T.textSecondary, fontSize: 12 }}>{relativeTime(iso)}</div>
      <div style={{ fontSize: 11, color: T.textMuted }}>
        {new Date(iso).toLocaleDateString('pt-PT', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </td>
  )
}

export function ActionsCell({ onReview, isOpen }: { onReview: () => void; isOpen: boolean }) {
  return (
    <td style={{ padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
        <button
          onClick={onReview}
          style={{
            padding: '5px 12px',
            background: isOpen ? T.teal : T.tealDim,
            border: `1px solid ${T.tealBorder}`,
            borderRadius: T.rSm,
            color: isOpen ? '#001a18' : T.teal,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {isOpen ? '▲ Hide' : 'Review'}
        </button>
      </div>
    </td>
  )
}

export function EmptySection({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>{icon}</div>
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: T.textMuted,
          marginBottom: 3,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 11, color: T.textDisabled }}>{sub}</div>
    </div>
  )
}
