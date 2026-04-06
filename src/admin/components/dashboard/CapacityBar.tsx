'use client'

import React from 'react'

interface CapacityBarProps {
  value: number
  max: number
}

function deriveCapacityColor(value: number, max: number): string {
  if (max <= 0) return '#2ecc71'
  const ratio = value / max
  if (ratio >= 1) return '#e85d4a'
  if (ratio >= 0.75) return '#f0a020'
  return '#2ecc71'
}

export { deriveCapacityColor }

export default function CapacityBar({ value, max }: CapacityBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const color = deriveCapacityColor(value, max)

  return (
    <div
      style={{
        width: '100%',
        height: '5px',
        borderRadius: '99px',
        background: '#e5e7eb',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: '99px',
          background: color,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  )
}
