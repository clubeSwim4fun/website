'use client'

import React from 'react'

interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
}

const DEFAULT_COLOR = '#0e7ea8'
const DEFAULT_HEIGHT = 160

export default function BarChart({ data, height = DEFAULT_HEIGHT }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '13px',
          color: '#9ca3af',
        }}
      >
        No data
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div style={{ width: '100%' }}>
      {/* Bars */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '6px',
          height,
          width: '100%',
        }}
      >
        {data.map((item, i) => {
          const pct = (item.value / maxValue) * 100
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
                gap: '4px',
              }}
            >
              {/* Value label on top */}
              <span
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '11px',
                  color: '#6b7280',
                  lineHeight: 1,
                }}
              >
                {item.value}
              </span>
              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  height: `${pct}%`,
                  minHeight: item.value > 0 ? '4px' : '0',
                  background: item.color ?? DEFAULT_COLOR,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginTop: '6px',
        }}
      >
        {data.map((item, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '11px',
              color: '#6b7280',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
