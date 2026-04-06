'use client'

import React from 'react'
import { useAuth, Card, useTranslation } from '@payloadcms/ui'

const labels: Record<string, { heading: string; pool: string; members: string; events: string }> = {
  en: {
    heading: 'Dashboards',
    pool: 'Pool',
    members: 'Members',
    events: 'Events',
  },
  pt: {
    heading: 'Dashboards',
    pool: 'Piscina',
    members: 'Membros',
    events: 'Eventos',
  },
}

export default function DashboardLinks() {
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const isAdmin = (user as any)?.role === 'admin'

  if (!isAdmin) return null

  const lang = i18n.language in labels ? i18n.language : 'en'
  const t = labels[lang] ?? labels['en']!

  const dashboards = [
    { href: '/admin/dashboard/pool', label: t.pool },
    { href: '/admin/dashboard/members', label: t.members },
    { href: '/admin/dashboard/events', label: t.events },
  ]

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '20px' }}>{t.heading}</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
          gap: 'var(--base)',
        }}
      >
        {dashboards.map(({ href, label }) => (
          <Card key={href} href={href} id={label} title={label} actions={undefined} />
        ))}
      </div>
    </div>
  )
}
