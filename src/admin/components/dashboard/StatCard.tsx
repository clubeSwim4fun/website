'use client'

import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: string
  trendType?: 'up' | 'down' | 'flat'
  barColor: 'blue' | 'green' | 'amber' | 'coral' | 'purple'
}

const barColorMap: Record<StatCardProps['barColor'], string> = {
  blue: '#0e7ea8',
  green: '#2ecc71',
  amber: '#f0a020',
  coral: '#e85d4a',
  purple: '#a78bfa',
}

const trendSymbol: Record<NonNullable<StatCardProps['trendType']>, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
}

const trendColor: Record<NonNullable<StatCardProps['trendType']>, string> = {
  up: '#2ecc71',
  down: '#e85d4a',
  flat: '#f0a020',
}

export default function StatCard({ label, value, sub, trend, trendType, barColor }: StatCardProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '2px solid #d4eaf2',
        padding: '20px 24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '13px',
          color: '#6b7280',
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontFamily: '"Syne", sans-serif',
          fontWeight: 800,
          fontSize: '20px',
          color: '#0a4a6e',
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>

      {sub && (
        <span
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '12px',
            color: '#9ca3af',
          }}
        >
          {sub}
        </span>
      )}

      {trend && trendType && (
        <span
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '12px',
            color: trendColor[trendType],
            fontWeight: 600,
          }}
        >
          {trendSymbol[trendType]} {trend}
        </span>
      )}

      <div
        style={{
          marginTop: '12px',
          height: '4px',
          borderRadius: '99px',
          background: barColorMap[barColor],
          opacity: 0.7,
        }}
      />
    </div>
  )
}
