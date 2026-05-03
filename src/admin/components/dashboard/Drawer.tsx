'use client'

import React, { useEffect, useRef } from 'react'

const C = {
  deep: '#0a4a6e',
  mid: '#0e7ea8',
  pale: '#e0f5fb',
  foam: '#f0fafd',
  border: '#d4eaf2',
  ink: '#0f1f2e',
  inkMid: '#3d5a70',
  inkLight: '#8aaabb',
  white: '#fff',
}

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  sub?: string
  children: React.ReactNode
}

export function Drawer({ open, onClose, title, sub, children }: DrawerProps) {
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
      <div
        onClick={onClose}
        aria-hidden="true"
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
                fontFamily: "'Outfit',sans-serif",
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

export function DrawerLoading() {
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

export function DrawerEmpty({ label }: { label: string }) {
  return <div style={{ fontSize: 13, color: C.inkLight, padding: '16px 0' }}>{label}</div>
}

export function DrawerSection({ label, count }: { label: string; count: number }) {
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
          textTransform: 'uppercase' as const,
          letterSpacing: '.6px',
          color: C.inkLight,
        }}
      >
        {label}
      </span>
      <span
        style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, color: C.deep }}
      >
        {count}
      </span>
    </div>
  )
}

function getInitials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length === 1
    ? (p[0]?.[0]?.toUpperCase() ?? '?')
    : ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()
}

export function DrawerPersonRow({
  name,
  email,
  meta,
  badge,
}: {
  name: string
  email?: string
  meta?: string
  badge?: React.ReactNode
}) {
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
          fontFamily: "'Outfit',sans-serif",
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
        {email && (
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
        )}
      </div>
      {meta && (
        <div style={{ fontSize: 11, color: C.inkLight, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {meta}
        </div>
      )}
      {badge}
    </div>
  )
}

export function InteractiveBar({
  data,
  onBarClick,
}: {
  data: { label: string; value: number; color?: string; meta?: any }[]
  onBarClick?: (
    index: number,
    item: { label: string; value: number; color?: string; meta?: any },
  ) => void
}) {
  const [hovered, setHovered] = React.useState<number | null>(null)
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
          boxSizing: 'border-box' as const,
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
                  boxShadow: isHov ? '0 4px 12px rgba(10,74,110,.25)' : 'none',
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
              textAlign: 'center' as const,
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
