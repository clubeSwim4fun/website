'use client'

import React from 'react'
import { NavGroup, useAuth, useTranslation } from '@payloadcms/ui'
import Link from 'next/link'

const labels: Record<string, { pool: string; members: string; events: string }> = {
  en: { pool: 'Pool', members: 'Members', events: 'Events' },
  pt: { pool: 'Piscina', members: 'Membros', events: 'Eventos' },
}

export default function DashboardNavLinks() {
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const isAdmin = (user as any)?.role === 'admin'

  if (!isAdmin) return null

  const t = labels[i18n.language in labels ? i18n.language : 'en'] ?? labels['en']!

  return (
    <NavGroup label="Dashboards">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Link href="/admin/dashboard/pool">{t.pool}</Link>
        <Link href="/admin/dashboard/members">{t.members}</Link>
        <Link href="/admin/dashboard/events">{t.events}</Link>
      </div>
    </NavGroup>
  )
}
