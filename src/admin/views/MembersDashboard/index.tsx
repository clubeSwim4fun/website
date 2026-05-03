'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Banner, LoadingOverlay } from '@payloadcms/ui'
import { useRequireAdmin } from '@/admin/utils/requireAdmin'
import StatCard from '@/admin/components/dashboard/StatCard'
import PanelCard from '@/admin/components/dashboard/PanelCard'
import DonutChart from '@/admin/components/dashboard/DonutChart'
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
  border: '#d4eaf2',
  ink: '#0f1f2e',
  inkLight: '#8aaabb',
  sand: '#fdf8f3',
  coral: '#e85d4a',
}

interface MembersDashboardData {
  newMembersThisMonth: number
  feesCollected: number
  pendingPayment: number
  activeAccounts: number
  monthlySignups: { month: string; count: number }[]
  paymentBreakdown: { label: string; count: number }[]
  recentMembers: {
    id: string
    name: string
    surname: string
    email: string
    status: string
    createdAt: string
  }[]
}

type DrawerContent =
  | { kind: 'month'; monthIndex: number; label: string; count: number }
  | { kind: 'status'; status: string; label: string }
  | null

interface MonthDetail {
  label: string
  members: { id: string; name: string; email: string; status: string; createdAt: string }[]
}
interface StatusDetail {
  members: { id: string; name: string; email: string; status: string; createdAt: string }[]
}

function deriveMemberBadge(status: string): {
  label: string
  type: 'green' | 'amber' | 'coral' | 'blue' | 'gray'
} {
  const map: Record<
    string,
    { label: string; type: 'green' | 'amber' | 'coral' | 'blue' | 'gray' }
  > = {
    active: { label: 'Active', type: 'green' },
    pendingPayment: { label: 'Pending Payment', type: 'amber' },
    pendingAnalysis: { label: 'Pending Analysis', type: 'blue' },
    pendingUpdate: { label: 'Pending Update', type: 'blue' },
    expired: { label: 'Expired', type: 'coral' },
  }
  return map[status] ?? { label: status, type: 'gray' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const paymentColors: Record<string, string> = {
  Paid: '#2ecc71',
  Pending: '#f0a020',
  Failed: '#e85d4a',
}
const statusKeyMap: Record<string, string> = {
  Paid: 'active',
  Pending: 'pendingPayment',
  Failed: 'expired',
}

export default function MembersDashboard() {
  const { isAdmin } = useRequireAdmin()
  const [data, setData] = useState<MembersDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawer, setDrawer] = useState<DrawerContent>(null)
  const [drawerData, setDrawerData] = useState<MonthDetail | StatusDetail | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  const now = new Date()
  const subtitle = now.toLocaleString('en', { month: 'long', year: 'numeric' })
  const currentMonthShort = now.toLocaleString('en', { month: 'short' })

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/dashboard/members')
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const openMonth = useCallback((monthIndex: number, label: string, count: number) => {
    setDrawer({ kind: 'month', monthIndex, label, count })
    setDrawerData(null)
    setDrawerLoading(true)
    fetch(`/api/dashboard/members/month/${monthIndex}`)
      .then((r) => r.json())
      .then(setDrawerData)
      .finally(() => setDrawerLoading(false))
  }, [])

  const openStatus = useCallback((statusKey: string, label: string) => {
    setDrawer({ kind: 'status', status: statusKey, label })
    setDrawerData(null)
    setDrawerLoading(true)
    fetch(`/api/dashboard/members/status/${statusKey}`)
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
          fontFamily: '"Outfit",sans-serif',
          color: C.coral,
        }}
      >
        {error ?? 'Failed to load dashboard data.'}
      </div>
    )

  const barData = data.monthlySignups.map((item, i) => ({
    label: item.month,
    value: item.count,
    color: item.month === currentMonthShort ? C.deep : C.mid,
    meta: { monthIndex: i },
  }))

  const donutSegments = data.paymentBreakdown.map((item) => ({
    label: item.label,
    count: item.count,
    color: paymentColors[item.label] ?? '#9ca3af',
  }))
  const donutTotal = data.paymentBreakdown.reduce((s, i) => s + i.count, 0)

  const drawerTitle =
    drawer?.kind === 'month' ? drawer.label : drawer?.kind === 'status' ? drawer.label : ''
  const drawerSub =
    drawer?.kind === 'month'
      ? `${drawer.count} new members`
      : drawer?.kind === 'status'
        ? `Members with this status`
        : ''

  return (
    <div
      style={{
        background: C.sand,
        padding: '32px',
        minHeight: '100vh',
        fontFamily: '"Outfit",sans-serif',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .mem-row { cursor: pointer; transition: background .15s; }
        .mem-row:hover { background: #f0fafd !important; }
        .donut-seg { cursor: pointer; transition: opacity .15s; }
        .donut-seg:hover { opacity: .75; }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: '"Outfit",sans-serif',
            fontWeight: 700,
            fontSize: 28,
            color: C.deep,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Memberships
        </h1>
        <p
          style={{
            fontFamily: '"Outfit",sans-serif',
            fontSize: 14,
            color: '#6b7280',
            margin: '4px 0 0',
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Stat cards — pending/active are clickable */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,180px),1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard label="New Members This Month" value={data.newMembersThisMonth} barColor="blue" />
        <StatCard label="Fees Collected" value={`€ ${data.feesCollected}`} barColor="green" />
        <div
          onClick={() => openStatus('pendingPayment', 'Pending Payment')}
          title="Click to see members"
          style={{ cursor: 'pointer' }}
        >
          <StatCard label="Pending Payment" value={data.pendingPayment} barColor="amber" />
        </div>
        <div
          onClick={() => openStatus('active', 'Active Members')}
          title="Click to see members"
          style={{ cursor: 'pointer' }}
        >
          <StatCard label="Active Accounts" value={data.activeAccounts} barColor="green" />
        </div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <PanelCard
          title="New Registrations — Last 6 Months"
          sub="Click a bar to see who joined"
          borderColor="blue"
        >
          <InteractiveBar
            data={barData}
            onBarClick={(i, item) => openMonth(i, item.label + ' ' + now.getFullYear(), item.value)}
          />
        </PanelCard>

        <PanelCard
          title="Payment Status Breakdown"
          sub="Click a segment to see members"
          borderColor="blue"
        >
          {/* Clickable donut legend */}
          <DonutChart segments={donutSegments} total={donutTotal} centerLabel="Members" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {data.paymentBreakdown.map((item) => {
              const statusKey = statusKeyMap[item.label]
              return (
                <div
                  key={item.label}
                  onClick={() => statusKey && openStatus(statusKey, item.label + ' Members')}
                  className="donut-seg"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px',
                    borderRadius: 8,
                    cursor: statusKey ? 'pointer' : 'default',
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: paymentColors[item.label] ?? '#9ca3af',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{item.label}</span>
                  <span
                    style={{
                      fontFamily: '"Outfit",sans-serif',
                      fontWeight: 700,
                      fontSize: 13,
                      color: C.deep,
                    }}
                  >
                    {item.count}
                  </span>
                  {statusKey && <span style={{ fontSize: 11, color: C.inkLight }}>›</span>}
                </div>
              )
            })}
          </div>
        </PanelCard>
      </div>

      {/* Recent members table */}
      <PanelCard
        title="Recent Registrations"
        sub="Click a row to see member details"
        badge={currentMonthShort}
        badgeType="blue"
        borderColor="blue"
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: '"Outfit",sans-serif',
              fontSize: 14,
            }}
          >
            <thead>
              <tr>
                {['Name', 'Email', 'Status', 'Registration Date'].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '.5px',
                      borderBottom: `1px solid ${C.border}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ padding: '24px 12px', textAlign: 'center', color: '#9ca3af' }}
                  >
                    No recent registrations
                  </td>
                </tr>
              ) : (
                data.recentMembers.map((member, i) => {
                  const badge = deriveMemberBadge(member.status)
                  return (
                    <tr
                      key={member.id}
                      className="mem-row"
                      onClick={() => openStatus(member.status, badge.label + ' Members')}
                      style={{ background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}
                    >
                      <td
                        style={{
                          padding: '10px 12px',
                          color: C.ink,
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {member.name} {member.surname}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#374151' }}>{member.email}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <StatusBadge status={badge.label} type={badge.type} />
                      </td>
                      <td style={{ padding: '10px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {formatDate(member.createdAt)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>

      {/* Drawer */}
      <Drawer open={!!drawer} onClose={closeDrawer} title={drawerTitle} sub={drawerSub}>
        {drawerLoading && <DrawerLoading />}

        {!drawerLoading &&
          drawer?.kind === 'month' &&
          (() => {
            const d = drawerData as MonthDetail | null
            return (
              <>
                <DrawerSection label="New members" count={d?.members.length ?? 0} />
                {!d?.members.length ? (
                  <DrawerEmpty label="No members joined this month." />
                ) : (
                  d.members.map((m) => {
                    const badge = deriveMemberBadge(m.status)
                    return (
                      <DrawerPersonRow
                        key={m.id}
                        name={m.name}
                        email={m.email}
                        meta={formatDate(m.createdAt)}
                        badge={<StatusBadge status={badge.label} type={badge.type} />}
                      />
                    )
                  })
                )}
              </>
            )
          })()}

        {!drawerLoading &&
          drawer?.kind === 'status' &&
          (() => {
            const d = drawerData as StatusDetail | null
            return (
              <>
                <DrawerSection label="Members" count={d?.members.length ?? 0} />
                {!d?.members.length ? (
                  <DrawerEmpty label="No members with this status." />
                ) : (
                  d.members.map((m) => {
                    const badge = deriveMemberBadge(m.status)
                    return (
                      <DrawerPersonRow
                        key={m.id}
                        name={m.name}
                        email={m.email}
                        meta={formatDate(m.createdAt)}
                        badge={<StatusBadge status={badge.label} type={badge.type} />}
                      />
                    )
                  })
                )}
              </>
            )
          })()}
      </Drawer>
    </div>
  )
}
