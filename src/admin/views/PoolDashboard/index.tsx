'use client'

import React, { useEffect, useState } from 'react'
import { Banner, LoadingOverlay } from '@payloadcms/ui'
import { useRequireAdmin } from '@/admin/utils/requireAdmin'
import StatCard from '@/admin/components/dashboard/StatCard'
import PanelCard from '@/admin/components/dashboard/PanelCard'
import BarChart from '@/admin/components/dashboard/BarChart'
import CapacityBar from '@/admin/components/dashboard/CapacityBar'
import StatusBadge from '@/admin/components/dashboard/StatusBadge'

interface PoolDashboardData {
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
  waitlist: {
    athleteName: string
    waitlistPosition: number
    createdAt: string
  }[]
}

function deriveSlotStatus(
  registered: number,
  capacity: number,
): { status: string; type: 'green' | 'amber' | 'coral' } {
  if (capacity <= 0 || registered >= capacity) return { status: 'Full', type: 'coral' }
  if (registered / capacity >= 0.75) return { status: 'Limited', type: 'amber' }
  return { status: 'Available', type: 'green' }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]?.[0]?.toUpperCase() ?? '?'
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

export default function PoolDashboard() {
  const { isAdmin } = useRequireAdmin()
  const [data, setData] = useState<PoolDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/dashboard/pool')
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (!isAdmin) return <Banner type="error">You do not have permission to view this page.</Banner>
  if (loading) return <LoadingOverlay />
  if (error || !data)
    return (
      <div
        style={{
          padding: '2rem',
          fontFamily: '"DM Sans", sans-serif',
          color: '#e85d4a',
          fontSize: '14px',
        }}
      >
        {error ?? 'Failed to load data.'}
      </div>
    )

  return (
    <div
      style={{
        background: '#fdf8f3',
        minHeight: '100vh',
        padding: '24px 20px 48px',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: '"Syne", sans-serif',
              fontWeight: 700,
              fontSize: '28px',
              color: '#0a4a6e',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Pool Dashboard
          </h1>
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '14px',
              color: '#6b7280',
              margin: '4px 0 0',
            }}
          >
            Current cycle overview
          </p>
        </div>
        {/* Gradient cycle period pill */}
        <span
          style={{
            background: 'linear-gradient(135deg, #0a4a6e, #0e7ea8)',
            color: '#ffffff',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '99px',
            padding: '6px 16px',
            whiteSpace: 'nowrap',
          }}
        >
          Active Cycle
        </span>
      </div>

      {/* Gradient Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0a4a6e, #0e7ea8)',
          borderRadius: '14px',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 700,
            fontSize: '22px',
            color: '#ffffff',
          }}
        >
          Pool Cycle
        </span>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                fontSize: '28px',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              {data.subscribedAthletes}
            </div>
            <div
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.75)',
                marginTop: '4px',
              }}
            >
              Athletes
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                fontSize: '28px',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              {data.waitlistTotal}
            </div>
            <div
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.75)',
                marginTop: '4px',
              }}
            >
              Waitlist
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                fontSize: '28px',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              —
            </div>
            <div
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.75)',
                marginTop: '4px',
              }}
            >
              Pool Hours
            </div>
          </div>
        </div>
      </div>

      {/* 4 StatCards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '16px',
          marginBottom: '24px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <StatCard label="Subscribed Athletes" value={data.subscribedAthletes} barColor="blue" />
        <StatCard
          label="Confirmed This Week"
          value={data.confirmedSlotsThisWeek}
          barColor="green"
        />
        <StatCard label="Waitlist Total" value={data.waitlistTotal} barColor="amber" />
        <StatCard label="Full Slots" value={data.fullSlotsCount} barColor="coral" />
      </div>

      {/* Two-column row: BarChart + Slot Fill Rate */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '16px',
          marginBottom: '24px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <PanelCard title="Weekly Registrations" borderColor="blue">
          <BarChart
            data={data.weeklyRegistrations.map((w) => ({ label: w.week, value: w.count }))}
          />
        </PanelCard>

        <PanelCard title="Slot Fill Rate by Day" borderColor="blue">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.slotFillRate.length === 0 && (
              <span
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '13px',
                  color: '#9ca3af',
                }}
              >
                No data
              </span>
            )}
            {data.slotFillRate.map((entry, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '13px',
                    color: '#374151',
                    width: '72px',
                    flexShrink: 0,
                  }}
                >
                  {entry.day}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: '8px',
                    borderRadius: '99px',
                    background: '#e5e7eb',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(entry.rate, 100)}%`,
                      height: '100%',
                      borderRadius: '99px',
                      background: '#0e7ea8',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '12px',
                    color: '#6b7280',
                    width: '36px',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {Math.round(entry.rate)}%
                </span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* Two-column row: Slot Table + Waitlist Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Slot Table */}
        <PanelCard title="Athletes per Slot — This Week" borderColor="blue">
          {data.slotTable.length === 0 ? (
            <span
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '13px',
                color: '#9ca3af',
              }}
            >
              No slots available
            </span>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Slot', 'Enrolled', 'Capacity', 'Status'].map((col) => (
                      <th
                        key={col}
                        style={{
                          fontFamily: '"DM Sans", sans-serif',
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: '#9ca3af',
                          textAlign: 'left',
                          paddingBottom: '10px',
                          paddingRight: '12px',
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
                    const { status, type } = deriveSlotStatus(slot.registered, slot.capacity)
                    return (
                      <tr key={slot.slotId}>
                        <td
                          style={{
                            fontFamily: '"DM Sans", sans-serif',
                            fontSize: '13px',
                            color: '#374151',
                            paddingBottom: '12px',
                            paddingRight: '12px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{slot.day}</div>
                          <div style={{ color: '#9ca3af', fontSize: '12px' }}>{slot.time}</div>
                        </td>
                        <td
                          style={{
                            fontFamily: '"Syne", sans-serif',
                            fontWeight: 700,
                            fontSize: '15px',
                            color: '#0a4a6e',
                            paddingBottom: '12px',
                            paddingRight: '12px',
                          }}
                        >
                          {slot.registered}
                        </td>
                        <td
                          style={{
                            paddingBottom: '12px',
                            paddingRight: '12px',
                            minWidth: '80px',
                          }}
                        >
                          <CapacityBar value={slot.registered} max={slot.capacity} />
                          <span
                            style={{
                              fontFamily: '"DM Sans", sans-serif',
                              fontSize: '11px',
                              color: '#9ca3af',
                              marginTop: '3px',
                              display: 'block',
                            }}
                          >
                            {slot.registered}/{slot.capacity}
                          </span>
                        </td>
                        <td style={{ paddingBottom: '12px' }}>
                          <StatusBadge status={status} type={type} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </PanelCard>

        {/* Waitlist Summary */}
        <PanelCard title="Waitlist Summary" borderColor="purple">
          {data.waitlist.length === 0 ? (
            <span
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '13px',
                color: '#9ca3af',
              }}
            >
              No athletes on waitlist
            </span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.waitlist.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {/* Avatar circle */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#e0f5fb',
                      color: '#0a4a6e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: '"Syne", sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(entry.athleteName)}
                  </div>

                  {/* Name */}
                  <span
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '13px',
                      color: '#374151',
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.athleteName}
                  </span>

                  {/* Purple position pill */}
                  <span
                    style={{
                      background: '#ede9fe',
                      color: '#5b21b6',
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '99px',
                      padding: '3px 10px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    #{entry.waitlistPosition}
                  </span>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </div>
    </div>
  )
}
