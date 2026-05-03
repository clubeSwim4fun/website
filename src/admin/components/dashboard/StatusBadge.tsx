'use client'

import React from 'react'

interface StatusBadgeProps {
  status: string
  type: 'green' | 'amber' | 'coral' | 'blue' | 'purple' | 'gray'
}

const colorMap: Record<StatusBadgeProps['type'], { bg: string; text: string }> = {
  green: { bg: '#d4f5e2', text: '#1a7a4a' },
  amber: { bg: '#fef3c7', text: '#92400e' },
  coral: { bg: '#fee2e2', text: '#991b1b' },
  blue: { bg: '#dbeafe', text: '#1e40af' },
  purple: { bg: '#ede9fe', text: '#5b21b6' },
  gray: { bg: '#f3f4f6', text: '#374151' },
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const { bg, text } = colorMap[type]

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: '"Outfit", sans-serif',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        borderRadius: '99px',
        padding: '3px 10px',
        background: bg,
        color: text,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  )
}
