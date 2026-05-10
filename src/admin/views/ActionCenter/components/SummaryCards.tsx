'use client'
import React from 'react'
import { T } from '../tokens'
import { relativeTime } from '../utils'
import { useACT } from '../LocaleContext'

interface QueueInfo {
  count: number
  urgency: string
  oldestAt: string | null
  oldestName?: string | null
}

interface SummaryCardsProps {
  queues: {
    registrations: QueueInfo
    subscriptions: QueueInfo
    dorsals: QueueInfo
    forms: QueueInfo
    stories: QueueInfo
  }
  onCardClick: (queue: string) => void
}

function borderColor(q: QueueInfo): string {
  if (q.count === 0) return 'transparent'
  if (q.urgency === 'red') return T.red
  if (q.urgency === 'amber') return T.amber
  return T.teal
}

function SummaryCard({
  icon,
  label,
  count,
  status,
  flag,
  flagColor,
  isEmpty,
  onClick,
  urgency,
}: {
  icon: string
  label: string
  count: number
  status: string
  flag?: string
  flagColor?: 'amber' | 'green' | 'teal'
  isEmpty: boolean
  onClick: () => void
  urgency: string
}) {
  const [hovered, setHovered] = React.useState(false)
  const leftBorder = isEmpty
    ? 'transparent'
    : urgency === 'red'
      ? T.red
      : urgency === 'amber'
        ? T.amber
        : T.teal

  const flagBg =
    flagColor === 'amber' ? T.amberDim : flagColor === 'green' ? 'rgba(34,197,94,0.14)' : T.tealDim
  const flagFg = flagColor === 'amber' ? T.amber : flagColor === 'green' ? T.green : T.teal

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? T.bgRaised : T.bgSurface,
        borderTop: `1px solid ${hovered ? T.borderDefault : T.borderSubtle}`,
        borderRight: `1px solid ${hovered ? T.borderDefault : T.borderSubtle}`,
        borderBottom: `1px solid ${hovered ? T.borderDefault : T.borderSubtle}`,
        borderLeft: `3px solid ${leftBorder}`,
        borderRadius: T.rLg,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        opacity: isEmpty ? 0.5 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: T.tealGlow,
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
      <div
        style={{
          fontSize: 11,
          color: T.textMuted,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 28,
          fontWeight: 600,
          color: isEmpty ? T.textMuted : T.textPrimary,
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {isEmpty ? '—' : count}
      </div>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: flag ? 8 : 0 }}>{status}</div>
      {flag && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 3,
            background: flagBg,
            color: flagFg,
            display: 'inline-block',
          }}
        >
          {flag}
        </span>
      )}
    </div>
  )
}

export default function SummaryCards({ queues, onCardClick }: SummaryCardsProps) {
  const t = useACT()
  const regFlag =
    queues.registrations.urgency === 'red' || queues.registrations.urgency === 'amber'
      ? `⚠ ${t.oldest} ${queues.registrations.oldestAt ? relativeTime(queues.registrations.oldestAt) : ''}`
      : undefined

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 10,
        marginBottom: 24,
      }}
    >
      <SummaryCard
        icon="👤"
        label={t.registrations}
        count={queues.registrations.count}
        status={t.pendingReview}
        flag={regFlag}
        flagColor="amber"
        isEmpty={queues.registrations.count === 0}
        onClick={() => onCardClick('registrations')}
        urgency={queues.registrations.urgency}
      />
      <SummaryCard
        icon="🏷️"
        label={t.subscriptions}
        count={queues.subscriptions.count}
        status={t.awaitingApproval}
        isEmpty={queues.subscriptions.count === 0}
        onClick={() => onCardClick('subscriptions')}
        urgency={queues.subscriptions.urgency}
      />
      <SummaryCard
        icon="🎽"
        label={t.dorsals}
        count={queues.dorsals.count}
        status={t.toAssign}
        isEmpty={queues.dorsals.count === 0}
        onClick={() => onCardClick('dorsals')}
        urgency={queues.dorsals.urgency}
      />
      <SummaryCard
        icon="📋"
        label={t.formReviews}
        count={queues.forms.count}
        status={t.toComplete}
        isEmpty={queues.forms.count === 0}
        onClick={() => onCardClick('forms')}
        urgency={queues.forms.urgency}
      />
      <SummaryCard
        icon="📖"
        label={t.stories}
        count={queues.stories.count}
        status={t.allReviewed}
        isEmpty={queues.stories.count === 0}
        onClick={() => onCardClick('stories')}
        urgency={queues.stories.urgency}
      />
    </div>
  )
}
