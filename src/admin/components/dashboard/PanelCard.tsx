'use client'

import React, { ReactNode } from 'react'

interface PanelCardProps {
  title: string
  sub?: string
  badge?: string
  badgeType?: 'blue' | 'green' | 'amber'
  borderColor: 'blue' | 'green' | 'amber' | 'coral' | 'purple'
  children: ReactNode
}

const borderColorMap: Record<PanelCardProps['borderColor'], string> = {
  blue: '#0e7ea8',
  green: '#2ecc71',
  amber: '#f0a020',
  coral: '#e85d4a',
  purple: '#a78bfa',
}

const badgeBgMap: Record<NonNullable<PanelCardProps['badgeType']>, string> = {
  blue: '#dbeafe',
  green: '#d4f5e2',
  amber: '#fef3c7',
}

const badgeTextMap: Record<NonNullable<PanelCardProps['badgeType']>, string> = {
  blue: '#1e40af',
  green: '#1a7a4a',
  amber: '#92400e',
}

export default function PanelCard({
  title,
  sub,
  badge,
  badgeType = 'blue',
  borderColor,
  children,
}: PanelCardProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '2px solid #d4eaf2',
        display: 'grid',
        gridTemplateColumns: '7px 1fr',
        overflow: 'hidden',
        minWidth: 0,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Left border strip */}
      <div style={{ background: borderColorMap[borderColor] }} />

      {/* Content */}
      <div style={{ padding: '20px 24px', minWidth: 0 }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: sub ? '4px' : '16px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              color: '#0a4a6e',
              flex: 1,
              minWidth: 0,
            }}
          >
            {title}
          </span>

          {badge && (
            <span
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                borderRadius: '99px',
                padding: '3px 10px',
                background: badgeBgMap[badgeType],
                color: badgeTextMap[badgeType],
                whiteSpace: 'nowrap',
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {sub && (
          <p
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: '13px',
              color: '#9ca3af',
              margin: '0 0 16px',
            }}
          >
            {sub}
          </p>
        )}

        {children}
      </div>
    </div>
  )
}
