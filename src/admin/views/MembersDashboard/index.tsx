'use client'

import React, { useEffect, useState } from 'react'
import { Banner, LoadingOverlay } from '@payloadcms/ui'
import { useRequireAdmin } from '@/admin/utils/requireAdmin'
import StatCard from '@/admin/components/dashboard/StatCard'
import PanelCard from '@/admin/components/dashboard/PanelCard'
import BarChart from '@/admin/components/dashboard/BarChart'
import DonutChart from '@/admin/components/dashboard/DonutChart'
import StatusBadge from '@/admin/components/dashboard/StatusBadge'

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

function deriveMemberBadge(status: string): {
  label: string
  type: 'green' | 'amber' | 'coral' | 'blue' | 'gray'
} {
  switch (status) {
    case 'active':
      return { label: 'Active', type: 'green' }
    case 'pendingPayment':
      return { label: 'Pending Payment', type: 'amber' }
    case 'pendingAnalysis':
      return { label: 'Pending Analysis', type: 'blue' }
    case 'pendingUpdate':
      return { label: 'Pending Update', type: 'blue' }
    case 'expired':
      return { label: 'Expired', type: 'coral' }
    default:
      return { label: status, type: 'gray' }
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const paymentColors: Record<string, string> = {
  Paid: '#2ecc71',
  Pending: '#f0a020',
  Failed: '#e85d4a',
}

export default function MembersDashboard() {
  const { isAdmin } = useRequireAdmin()
  const [data, setData] = useState<MembersDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const barChartData = data.monthlySignups.map((item) => ({
    label: item.month,
    value: item.count,
    color: item.month === currentMonthShort ? '#0a4a6e' : '#0e7ea8',
  }))

  const donutSegments = data.paymentBreakdown.map((item) => ({
    label: item.label,
    count: item.count,
    color: paymentColors[item.label] ?? '#9ca3af',
  }))

  const donutTotal = data.paymentBreakdown.reduce((sum, item) => sum + item.count, 0)

  return (
    <div
      style={{
        background: '#fdf8f3',
        padding: '32px',
        minHeight: '100vh',
        fontFamily: '"DM Sans", sans-serif',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

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
          Memberships
        </h1>
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
            color: '#6b7280',
            margin: '4px 0 0',
          }}
        >
          {subtitle}
        </p>
      </div>

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
        <StatCard label="New Members This Month" value={data.newMembersThisMonth} barColor="blue" />
        <StatCard label="Fees Collected" value={`€ ${data.feesCollected}`} barColor="green" />
        <StatCard label="Pending Payment" value={data.pendingPayment} barColor="amber" />
        <StatCard label="Active Accounts" value={data.activeAccounts} barColor="green" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '16px',
          marginBottom: '24px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <PanelCard title="New Registrations \u2014 Last 6 Months" borderColor="blue">
          <BarChart data={barChartData} height={160} />
        </PanelCard>

        <PanelCard title="Payment Status Breakdown" borderColor="blue">
          <DonutChart segments={donutSegments} total={donutTotal} centerLabel="Members" />
        </PanelCard>
      </div>

      <PanelCard
        title="Recent Registrations"
        badge={currentMonthShort}
        badgeType="blue"
        borderColor="blue"
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '14px',
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
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '1px solid #e5e7eb',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentMembers.map((member, i) => {
                const badge = deriveMemberBadge(member.status)
                return (
                  <tr key={member.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                    <td
                      style={{
                        padding: '10px 12px',
                        color: '#111827',
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
              })}
              {data.recentMembers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: '24px 12px',
                      textAlign: 'center',
                      color: '#9ca3af',
                      fontFamily: '"DM Sans", sans-serif',
                    }}
                  >
                    No recent registrations
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  )
}
