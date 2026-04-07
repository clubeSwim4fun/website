'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Banner, LoadingOverlay } from '@payloadcms/ui'
import { useRequireAdmin } from '@/admin/utils/requireAdmin'
import StatCard from '@/admin/components/dashboard/StatCard'
import PanelCard from '@/admin/components/dashboard/PanelCard'
import CapacityBar from '@/admin/components/dashboard/CapacityBar'
import StatusBadge from '@/admin/components/dashboard/StatusBadge'
import {
  Drawer,
  DrawerEmpty,
  DrawerLoading,
  DrawerPersonRow,
  DrawerSection,
  InteractiveBar,
} from '@/admin/components/dashboard/Drawer'

const C = {
  deep: '#0a4a6e',
  mid: '#0e7ea8',
  pale: '#e0f5fb',
  foam: '#f0fafd',
  border: '#d4eaf2',
  ink: '#0f1f2e',
  inkLight: '#8aaabb',
  sand: '#fdf8f3',
  coral: '#e85d4a',
  amber: '#f0a020',
  green: '#2ecc71',
}

interface EventsDashboardData {
  activeEvents: number
  totalEnrolled: number
  upcomingIn30Days: number
  totalWaitlisted: number
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

type DrawerContent =
  | { kind: 'event'; eventId: string; title: string; enrolledCount: number; ticketCount: number }
  | { kind: 'week'; weekIndex: number; weekLabel: string; count: number }
  | null

interface EventDetail {
  attendees: {
    orderId: string
    name: string
    email: string
    tickets: { name: string; tshirtSize?: string }[]
    orderedAt: string
  }[]
}
interface WeekDetail {
  label: string
  orders: {
    id: string
    name: string
    email: string
    eventTitles: string[]
    total: number
    orderedAt: string
  }[]
}

function deriveEventStatus(
  enrolled: number,
  total: number,
): {
  borderColor: 'blue' | 'amber' | 'coral'
  badgeLabel: string
  badgeType: 'blue' | 'amber' | 'coral'
} {
  if (total <= 0 || enrolled >= total)
    return { borderColor: 'coral', badgeLabel: 'Full', badgeType: 'coral' }
  if (enrolled / total >= 0.75)
    return { borderColor: 'amber', badgeLabel: 'Limited', badgeType: 'amber' }
  return { borderColor: 'blue', badgeLabel: 'Available', badgeType: 'blue' }
}

function interpolateColor(i: number, total: number): string {
  if (total <= 1) return C.deep
  const t = i / (total - 1)
  const r = Math.round(0x3b + (0x0a - 0x3b) * t)
  const g = Math.round(0xb8 + (0x4a - 0xb8) * t)
  const b = Math.round(0xd8 + (0x6e - 0xd8) * t)
  return `rgb(${r},${g},${b})`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function EventsDashboard() {
  const { isAdmin } = useRequireAdmin()
  const [data, setData] = useState<EventsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawer, setDrawer] = useState<DrawerContent>(null)
  const [drawerData, setDrawerData] = useState<EventDetail | WeekDetail | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

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

  const openEvent = useCallback(
    (eventId: string, title: string, enrolledCount: number, ticketCount: number) => {
      setDrawer({ kind: 'event', eventId, title, enrolledCount, ticketCount })
      setDrawerData(null)
      setDrawerLoading(true)
      fetch(`/api/dashboard/events/event/${eventId}`)
        .then((r) => r.json())
        .then(setDrawerData)
        .finally(() => setDrawerLoading(false))
    },
    [],
  )

  const openWeek = useCallback((weekIndex: number, weekLabel: string, count: number) => {
    setDrawer({ kind: 'week', weekIndex, weekLabel, count })
    setDrawerData(null)
    setDrawerLoading(true)
    fetch(`/api/dashboard/events/week/${weekIndex}`)
      .then((r) => r.json())
      .then(setDrawerData)
      .finally(() => setDrawerLoading(false))
  }, [])

  const closeDrawer = useCallback(() => setDrawer(null), [])

  if (!isAdmin) return <Banner type="error">You do not have permission to view this page.</Banner>
  if (loading) return <LoadingOverlay />
  if (error || !data)
    return (
      <div
        style={{
          background: C.sand,
          padding: '2rem',
          fontFamily: '"DM Sans",sans-serif',
          color: C.coral,
        }}
      >
        {error ?? 'Failed to load dashboard data.'}
      </div>
    )

  // Map enrollmentByEvent back to event IDs for bar click
  const enrollmentBarData = data.enrollmentByEvent.map((item, i) => ({
    label: item.eventTitle,
    value: item.enrolled,
    color: C.mid,
    meta: {
      eventId: data.events[i]?.id,
      title: item.eventTitle,
      ticketCount: data.events[i]?.ticketCount ?? 0,
    },
  }))

  const weeklyBarData = data.weeklySignups.map((item, i) => ({
    label: item.week,
    value: item.count,
    color: interpolateColor(i, data.weeklySignups.length),
    meta: { weekIndex: i },
  }))

  const drawerTitle =
    drawer?.kind === 'event'
      ? drawer.title
      : drawer?.kind === 'week'
        ? `Week of ${drawer.weekLabel}`
        : ''
  const drawerSub =
    drawer?.kind === 'event'
      ? `${drawer.enrolledCount}/${drawer.ticketCount} enrolled`
      : drawer?.kind === 'week'
        ? `${drawer.count} orders`
        : ''

  return (
    <div
      style={{
        background: C.sand,
        padding: '24px 20px 48px',
        minHeight: '100vh',
        fontFamily: '"DM Sans",sans-serif',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .event-card { cursor: pointer; transition: box-shadow .15s; }
        .event-card:hover { box-shadow: 0 4px 20px rgba(10,74,110,.12); }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: '"Syne",sans-serif',
            fontWeight: 700,
            fontSize: 28,
            color: C.deep,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Events
        </h1>
        <p
          style={{
            fontFamily: '"DM Sans",sans-serif',
            fontSize: 14,
            color: '#6b7280',
            margin: '4px 0 0',
          }}
        >
          Active and upcoming events
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,180px),1fr))',
          gap: 16,
          marginBottom: 24,
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

      {/* Active events — each card is clickable */}
      <div style={{ marginBottom: 24 }}>
        <PanelCard
          title="Active & Upcoming Events"
          sub="Click an event to see enrolled attendees"
          borderColor="blue"
        >
          {data.events.length === 0 ? (
            <p
              style={{
                fontFamily: '"DM Sans",sans-serif',
                fontSize: 14,
                color: '#9ca3af',
                margin: 0,
              }}
            >
              No active or upcoming events.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  <div
                    key={event.id}
                    className="event-card"
                    onClick={() =>
                      openEvent(event.id, event.title, event.enrolledCount, event.ticketCount)
                    }
                    title="Click to see enrolled attendees"
                  >
                    <PanelCard title={event.title} borderColor={borderColor}>
                      <div
                        style={{
                          fontFamily: '"DM Sans",sans-serif',
                          fontSize: 13,
                          color: '#6b7280',
                          marginBottom: 8,
                        }}
                      >
                        {formatDate(event.start)}
                      </div>
                      <span
                        style={{
                          fontFamily: '"Syne",sans-serif',
                          fontWeight: 800,
                          fontSize: 24,
                          color: C.deep,
                          display: 'block',
                          marginBottom: 10,
                        }}
                      >
                        {event.enrolledCount}
                      </span>
                      <div style={{ marginBottom: 12 }}>
                        <CapacityBar value={event.enrolledCount} max={event.ticketCount} />
                      </div>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
                      >
                        <StatusBadge status={badgeLabel} type={badgeType} />
                        <span
                          style={{
                            fontFamily: '"DM Sans",sans-serif',
                            fontSize: 12,
                            color: '#6b7280',
                          }}
                        >
                          {pct}% full
                        </span>
                        <span
                          style={{
                            fontFamily: '"DM Sans",sans-serif',
                            fontSize: 12,
                            color: '#6b7280',
                          }}
                        >
                          {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: C.inkLight }}>
                          View attendees ›
                        </span>
                      </div>
                    </PanelCard>
                  </div>
                )
              })}
            </div>
          )}
        </PanelCard>
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))',
          gap: 16,
        }}
      >
        <PanelCard
          title="Enrollment by Event"
          sub="Click a bar to see attendees"
          borderColor="blue"
        >
          <InteractiveBar
            data={enrollmentBarData}
            onBarClick={(i, item) => {
              if (item.meta?.eventId)
                openEvent(item.meta.eventId, item.meta.title, item.value, item.meta.ticketCount)
            }}
          />
        </PanelCard>

        <PanelCard
          title="Registration Timeline"
          sub="Click a bar to see orders that week"
          borderColor="blue"
        >
          <InteractiveBar
            data={weeklyBarData}
            onBarClick={(i, item) => openWeek(i, item.label, item.value)}
          />
        </PanelCard>
      </div>

      {/* Drawer */}
      <Drawer open={!!drawer} onClose={closeDrawer} title={drawerTitle} sub={drawerSub}>
        {drawerLoading && <DrawerLoading />}

        {!drawerLoading &&
          drawer?.kind === 'event' &&
          (() => {
            const d = drawerData as EventDetail | null
            return (
              <>
                <DrawerSection label="Attendees" count={d?.attendees.length ?? 0} />
                {!d?.attendees.length ? (
                  <DrawerEmpty label="No attendees for this event yet." />
                ) : (
                  d.attendees.map((a) => (
                    <DrawerPersonRow
                      key={a.orderId}
                      name={a.name}
                      email={a.email}
                      meta={formatDate(a.orderedAt)}
                      badge={
                        a.tickets.length > 0 ? (
                          <span
                            style={{
                              fontSize: 11,
                              color: C.inkLight,
                              background: C.pale,
                              borderRadius: 99,
                              padding: '2px 8px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {a.tickets
                              .map((t) => t.name + (t.tshirtSize ? ` (${t.tshirtSize})` : ''))
                              .join(', ')}
                          </span>
                        ) : undefined
                      }
                    />
                  ))
                )}
              </>
            )
          })()}

        {!drawerLoading &&
          drawer?.kind === 'week' &&
          (() => {
            const d = drawerData as WeekDetail | null
            return (
              <>
                <DrawerSection label="Orders" count={d?.orders.length ?? 0} />
                {!d?.orders.length ? (
                  <DrawerEmpty label="No orders this week." />
                ) : (
                  d.orders.map((o) => (
                    <DrawerPersonRow
                      key={o.id}
                      name={o.name}
                      email={o.email}
                      meta={`€${o.total}`}
                      badge={
                        o.eventTitles.length > 0 ? (
                          <span
                            style={{
                              fontSize: 11,
                              color: C.inkLight,
                              background: C.pale,
                              borderRadius: 99,
                              padding: '2px 8px',
                              whiteSpace: 'nowrap',
                              maxWidth: 120,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'block',
                            }}
                          >
                            {o.eventTitles.join(', ')}
                          </span>
                        ) : undefined
                      }
                    />
                  ))
                )}
              </>
            )
          })()}
      </Drawer>
    </div>
  )
}
