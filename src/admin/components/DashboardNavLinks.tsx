'use client'

import React from 'react'
import { NavGroup, useAuth, useTranslation } from '@payloadcms/ui'
import Link from 'next/link'

const labels: Record<
  string,
  { actionCenter: string; pool: string; members: string; events: string; newsletter: string }
> = {
  en: {
    actionCenter: 'Action Center',
    pool: 'Pool',
    members: 'Members',
    events: 'Events',
    newsletter: 'Newsletter',
  },
  pt: {
    actionCenter: 'Central de Ação',
    pool: 'Piscina',
    members: 'Membros',
    events: 'Eventos',
    newsletter: 'Newsletter',
  },
}

export default function DashboardNavLinks() {
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const isAdmin = (user as any)?.role === 'admin'

  if (!isAdmin) return null

  const t = labels[i18n.language in labels ? i18n.language : 'en'] ?? labels['en']!

  return (
    <>
      <NavGroup label="Action">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link href="/admin/action-center">{t.actionCenter}</Link>
        </div>
      </NavGroup>
      <NavGroup label="Dashboards">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link href="/admin/dashboard?tab=pool">{t.pool}</Link>
          <Link href="/admin/dashboard?tab=members">{t.members}</Link>
          <Link href="/admin/dashboard?tab=events">{t.events}</Link>
          <Link href="/admin/newsletter-analytics">{t.newsletter}</Link>
        </div>
      </NavGroup>
    </>
  )
}
