'use client'

import React, { useEffect, useState } from 'react'
import { Banner, LoadingOverlay } from '@payloadcms/ui'
import { useRequireAdmin } from '@/admin/utils/requireAdmin'
import StatCard from '@/admin/components/dashboard/StatCard'
import PanelCard from '@/admin/components/dashboard/PanelCard'
import BarChart from '@/admin/components/dashboard/BarChart'
import CapacityBar from '@/admin/components/dashboard/CapacityBar'
import StatusBadge from '@/admin/components/dashboard/StatusBadge'

interface EventsDashboardData {
  activeEvents: number
  totalEnrolled: number
  upcomingIn30Days: number
  totalWaitlisted: 0
  events: {
    id: string
    title: string
    start: string
    end: string
    enrolledCount: number
    ticketCount: number
  }[]
  enrollmentByEvent: { eventTitle: string; enrolled: number }[]
  weeklySignups: { week: string; count: number }[]
}

function deriveEventStatus(
  enrolledCount: number,
  ticketCount: number,
): {
  borderColor: 'blue' | 'amber' | 'coral'
  badgeLabel: string
  badgeType: 'blue' | 'amber' | 'coral'
} {
  if (ticketCount <= 0 || enrolledCount >= ticketCount)
    return { borderColor: 'coral', badgeLabel: 'Full', badgeType: 'coral' }
  if (enrolledCount / ticketCount >= 0.75)
    return { borderColor: 'amber', badgeLabel: 'Limited', badgeType: 'amber' }
  return { borderColor: 'blue', badgeLabel: 'Available', badgeType: 'blue' }
}

function interpolateColor(i: number, total: number): string {
  if (total <= 1) return '#0a4a6e'
  const t = i / (total - 1)
  const r = Math.round(0x3b + (0x0a - 0x3b) * t)
  const g = Math.round(0xb8 + (0x4a - 0xb8) * t)
  const b = Math.round(0xd8 + (0x6e - 0xd8) * t)
  return `rgb(${r},${g},${b})`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function EventsDashboard() {
  const { isAdmin } = useRequireAdmin()
  const [data, setData] = useState<EventsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/dashboard/events')
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (!isAdmin) {
    return <Banner type="error">You do not have permission to view this page.</Banner>
  }
  if (loading) return <LoadingOverlay />
  if (error || !data) {
    return (
      <div
        style={{
          background: '#fdf8f3',
          padding: '2rem',
          fontFamily: '"DM Sans", sans-serif',
          color: '#e85d4a',
        }}
      >
        {error ?? 'Failed to load dashboard data.'}
      </div>
    )
  }

  const enrollmentBarData = data.enrollmentByEvent.map((item) => ({
    label: item.eventTitle,
    value: item.enrolled,
    color: '#0e7ea8',
  }))

  const weeklyBarData = data.weeklySignups.map((item, i) => ({
    label: item.week,
    value: item.count,
    color: interpolateColor(i, data.weeklySignups.length),
  }))

  return (
    <div
      style={{
        background: '#fdf8f3',
        padding: '24px 20px 48px',
        minHeight: '100vh',
        fontFamily: '"DM Sans", sans-serif',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
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
          Events
        </h1>
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
            color: '#6b7280',
            margin: '4px 0 0',
          }}
        >
          Active and upcoming events
        </p>
      </div>

      {/* 4 StatCards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 180px), 1fr))',
          gap: '16px',
          marginBottom: '24px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <StatCard label="Active Events" value={data.activeEvents} barColor="blue" />
        <StatCard label="Total Enrolled" value={data.totalEnrolled} barColor="green" />
        <StatCard label="Upcoming in 30 Days" value={data.upcomingIn30Days} barColor="amber" />
        <StatCard
          label="Waitlisted"
          value={data.totalWaitlisted}
          sub="Reserved for future use"
          barColor="purple"
        />
      </div>

      {/* Full-width active events panel */}
      <div style={{ marginBottom: '24px' }}>
        <PanelCard title="Active & Upcoming Events" borderColor="blue">
          {data.events.length === 0 ? (
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '14px',
                color: '#9ca3af',
                margin: 0,
              }}
            >
              No active or upcoming events.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.events.map((event) => {
                const { borderColor, badgeLabel, badgeType } = deriveEventStatus(
                  event.enrolledCount,
                  event.ticketCount,
                )
                const pct =
                  event.ticketCount > 0
                    ? Math.round((event.enrolledCount / event.ticketCount) * 100)
                    : 0
                const spotsRemaining = Math.max(event.ticketCount - event.enrolledCount, 0)

                return (
                  <PanelCard key={event.id} title={event.title} borderColor={borderColor}>
                    <div
                      style={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '8px',
                      }}
                    >
                      {formatDate(event.start)}
                    </div>

                    <span
                      style={{
                        fontFamily: '"Syne", sans-serif',
                        fontWeight: 800,
                        fontSize: '24px',
                        color: '#0a4a6e',
                        display: 'block',
                        marginBottom: '10px',
                      }}
                    >
                      {event.enrolledCount}
                    </span>

                    <div style={{ marginBottom: '12px' }}>
                      <CapacityBar value={event.enrolledCount} max={event.ticketCount} />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <StatusBadge status={badgeLabel} type={badgeType} />
                      <span
                        style={{
                          fontFamily: '"DM Sans", sans-serif',
                          fontSize: '12px',
                          color: '#6b7280',
                        }}
                      >
                        {pct}% full
                      </span>
                      <span
                        style={{
                          fontFamily: '"DM Sans", sans-serif',
                          fontSize: '12px',
                          color: '#6b7280',
                        }}
                      >
                        {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining
                      </span>
                    </div>
                  </PanelCard>
                )
              })}
            </div>
          )}
        </PanelCard>
      </div>

      {/* Two-column row: charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <PanelCard title="Enrollment by Event" borderColor="blue">
          <BarChart data={enrollmentBarData} height={160} />
        </PanelCard>

        <PanelCard title="Registration Timeline" borderColor="blue">
          <BarChart data={weeklyBarData} height={160} />
        </PanelCard>
      </div>
    </div>
  )
}
