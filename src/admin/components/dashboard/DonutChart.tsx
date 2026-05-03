'use client'

import React from 'react'

interface DonutChartProps {
  segments: { label: string; count: number; color: string }[]
  total: number
  centerLabel?: string
}

const RADIUS = 54
const STROKE_WIDTH = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SIZE = (RADIUS + STROKE_WIDTH) * 2

export default function DonutChart({ segments, total, centerLabel }: DonutChartProps) {
  const nonZero = segments.filter((s) => s.count > 0)
  const displayTotal = total > 0 ? total : nonZero.reduce((sum, s) => sum + s.count, 0)

  // Build stroke-dasharray offsets
  let offset = 0
  const arcs = nonZero.map((seg) => {
    const fraction = displayTotal > 0 ? seg.count / displayTotal : 0
    const dash = fraction * CIRCUMFERENCE
    const gap = CIRCUMFERENCE - dash
    const currentOffset = offset
    offset += dash
    return { ...seg, dash, gap, offset: currentOffset }
  })

  const center = SIZE / 2

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
      }}
    >
      {/* SVG donut */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={STROKE_WIDTH}
          />

          {arcs.length === 0 ? (
            <circle
              cx={center}
              cy={center}
              r={RADIUS}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={STROKE_WIDTH}
            />
          ) : (
            arcs.map((arc, i) => (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${arc.dash} ${arc.gap}`}
                strokeDashoffset={CIRCUMFERENCE / 4 - arc.offset}
                strokeLinecap="butt"
                style={{ transition: 'stroke-dasharray 0.4s ease' }}
              />
            ))
          )}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 800,
              fontSize: '22px',
              color: '#0a4a6e',
              lineHeight: 1,
            }}
          >
            {displayTotal}
          </span>
          {centerLabel && (
            <span
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: '11px',
                color: '#9ca3af',
                marginTop: '2px',
                textAlign: 'center',
                maxWidth: '60px',
              }}
            >
              {centerLabel}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: seg.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: '13px',
                color: '#374151',
                whiteSpace: 'nowrap',
              }}
            >
              {seg.label}
            </span>
            <span
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: '13px',
                color: '#6b7280',
                marginLeft: 'auto',
                paddingLeft: '12px',
              }}
            >
              {seg.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
