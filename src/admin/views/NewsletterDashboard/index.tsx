'use client'

import React, { useEffect, useState } from 'react'
import { Banner, LoadingOverlay } from '@payloadcms/ui'
import { useRequireAdmin } from '@/admin/utils/requireAdmin'
import StatCard from '@/admin/components/dashboard/StatCard'
import PanelCard from '@/admin/components/dashboard/PanelCard'
import {
  Drawer,
  DrawerEmpty,
  DrawerLoading,
  DrawerSection,
} from '@/admin/components/dashboard/Drawer'

const C = {
  deep: '#0a4a6e',
  mid: '#0e7ea8',
  pale: '#e0f5fb',
  border: '#d4eaf2',
  ink: '#0f1f2e',
  inkLight: '#8aaabb',
  sand: '#fdf8f3',
  green: '#2ecc71',
  amber: '#f0a020',
  coral: '#e85d4a',
}

interface RecipientRow {
  email: string
  openedAt: string | null
  clickedAt: string | null
  openCount: number
  clickCount: number
}

interface NewsletterRow {
  id: string
  subject: string
  sentAt: string | null
  totalSent: number
  totalOpened: number
  totalClicks: number
  openRate: number
  clickRate: number
  recipients: RecipientRow[]
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RateBar({ value }: { value: number }) {
  const color = value >= 50 ? C.green : value >= 20 ? C.amber : C.coral
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: C.border,
          borderRadius: 99,
          overflow: 'hidden',
        }}
      >
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 99, background: color }} />
      </div>
      <span style={{ fontSize: 12, color: C.ink, fontWeight: 600, minWidth: 32 }}>{value}%</span>
    </div>
  )
}

export default function NewsletterDashboard() {
  const { isAdmin } = useRequireAdmin()
  const [newsletters, setNewsletters] = useState<NewsletterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<NewsletterRow | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/dashboard/newsletter')
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then((d) => setNewsletters(d.newsletters ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (!isAdmin) return <Banner type="error">You do not have permission to view this page.</Banner>
  if (loading) return <LoadingOverlay />
  if (error)
    return (
      <div
        style={{ background: C.sand, padding: '2rem', color: C.coral, fontFamily: 'sans-serif' }}
      >
        {error}
      </div>
    )

  // Aggregate totals
  const totalSent = newsletters.reduce((s, n) => s + n.totalSent, 0)
  const totalOpened = newsletters.reduce((s, n) => s + n.totalOpened, 0)
  const totalClicks = newsletters.reduce((s, n) => s + n.totalClicks, 0)
  const avgOpenRate =
    newsletters.length > 0
      ? Math.round(newsletters.reduce((s, n) => s + n.openRate, 0) / newsletters.length)
      : 0

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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: '"Syne",sans-serif',
            fontWeight: 700,
            fontSize: 28,
            color: C.deep,
            margin: 0,
          }}
        >
          Newsletter Analytics
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>
          Engagement tracking for sent newsletters
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
        <StatCard label="Newsletters Sent" value={newsletters.length} barColor="blue" />
        <StatCard label="Total Recipients" value={totalSent} barColor="blue" />
        <StatCard label="Unique Opens" value={totalOpened} barColor="green" />
        <StatCard label="Avg Open Rate" value={`${avgOpenRate}%`} barColor="amber" />
        <StatCard label="Unique Clicks" value={totalClicks} barColor="purple" />
      </div>

      <PanelCard
        title="Sent Newsletters"
        sub="Click a row to see recipient details"
        borderColor="blue"
      >
        {newsletters.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>No newsletters sent yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {[
                    'Subject',
                    'Sent at',
                    'Recipients',
                    'Opens',
                    'Open rate',
                    'Clicks',
                    'Click rate',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: C.inkLight,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '.5px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {newsletters.map((nl) => (
                  <tr
                    key={nl.id}
                    onClick={() => setSelected(nl)}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      cursor: 'pointer',
                      transition: 'background .12s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = C.pale)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')
                    }
                  >
                    <td
                      style={{
                        padding: '10px 12px',
                        fontWeight: 600,
                        color: C.deep,
                        maxWidth: 240,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {nl.subject}
                    </td>
                    <td style={{ padding: '10px 12px', color: C.inkLight, whiteSpace: 'nowrap' }}>
                      {formatDate(nl.sentAt)}
                    </td>
                    <td style={{ padding: '10px 12px', color: C.ink }}>{nl.totalSent}</td>
                    <td style={{ padding: '10px 12px', color: C.ink }}>{nl.totalOpened}</td>
                    <td style={{ padding: '10px 12px', minWidth: 120 }}>
                      <RateBar value={nl.openRate} />
                    </td>
                    <td style={{ padding: '10px 12px', color: C.ink }}>{nl.totalClicks}</td>
                    <td style={{ padding: '10px 12px', minWidth: 120 }}>
                      <RateBar value={nl.clickRate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.subject ?? ''}
        sub={selected ? `${selected.totalSent} recipients · ${selected.openRate}% open rate` : ''}
      >
        {!selected ? (
          <DrawerLoading />
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                { label: 'Sent', value: selected.totalSent },
                { label: 'Opened', value: selected.totalOpened },
                { label: 'Open rate', value: `${selected.openRate}%` },
                { label: 'Clicks', value: selected.totalClicks },
                { label: 'Click rate', value: `${selected.clickRate}%` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: C.pale,
                    borderRadius: 8,
                    padding: '10px 14px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: C.inkLight,
                      textTransform: 'uppercase',
                      letterSpacing: '.5px',
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: '"Syne",sans-serif',
                      fontWeight: 800,
                      fontSize: 18,
                      color: C.deep,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <DrawerSection label="Recipients" count={selected.recipients.length} />
            {selected.recipients.length === 0 ? (
              <DrawerEmpty label="No recipients." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                      {['Email', 'Opened at', 'Opens', 'Clicked at', 'Clicks'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '6px 8px',
                            textAlign: 'left',
                            color: C.inkLight,
                            fontWeight: 700,
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '.5px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.recipients.map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '7px 8px', color: C.ink }}>{r.email}</td>
                        <td style={{ padding: '7px 8px', color: C.inkLight, whiteSpace: 'nowrap' }}>
                          {formatDate(r.openedAt)}
                        </td>
                        <td style={{ padding: '7px 8px', color: C.ink }}>{r.openCount}</td>
                        <td style={{ padding: '7px 8px', color: C.inkLight, whiteSpace: 'nowrap' }}>
                          {formatDate(r.clickedAt)}
                        </td>
                        <td style={{ padding: '7px 8px', color: C.ink }}>{r.clickCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
