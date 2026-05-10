'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Banner, LoadingOverlay } from '@payloadcms/ui'
import { useTranslation } from '@payloadcms/ui'
import { useRequireAdmin } from '@/admin/utils/requireAdmin'
import { T } from './tokens'
import { ACLocaleProvider, useACT } from './LocaleContext'
import SummaryCards from './components/SummaryCards'
import RegistrationsQueue from './components/RegistrationsQueue'
import SubscriptionsQueue from './components/SubscriptionsQueue'
import DorsalsQueue from './components/DorsalsQueue'
import FormsQueue from './components/FormsQueue'
import QueueSection, { EmptySection } from './components/QueueSection'
import ToastContainer, { useToasts } from './components/Toast'

interface QueueCounts {
  total: number
  queues: {
    registrations: {
      count: number
      urgency: string
      oldestAt: string | null
      oldestName?: string | null
    }
    subscriptions: {
      count: number
      urgency: string
      oldestAt: string | null
      oldestName?: string | null
    }
    dorsals: { count: number; urgency: string; oldestAt: string | null }
    forms: { count: number; urgency: string; oldestAt: string | null; oldestName?: string | null }
    stories: { count: number; urgency: string; oldestAt: string | null }
  }
}

function ActionCenterInner() {
  const { isAdmin } = useRequireAdmin()
  const t = useACT()
  const [counts, setCounts] = useState<QueueCounts | null>(null)
  const [countsLoading, setCountsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const { toasts, addToast, removeToast } = useToasts()

  // Per-queue counts (updated by child components)
  const [regCount, setRegCount] = useState(0)
  const [subCount, setSubCount] = useState(0)
  const [dorsalCount, setDorsalCount] = useState(0)
  const [formCount, setFormCount] = useState(0)

  // Section refs for scroll-to
  const regRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const dorsalRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/action-center/counts')
      if (!res.ok) return
      const data = await res.json()
      setCounts(data)
      setLastUpdated(new Date())
    } finally {
      setCountsLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    fetchCounts()
    const interval = setInterval(fetchCounts, 60000)
    return () => clearInterval(interval)
  }, [isAdmin, fetchCounts])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCounts()
  }

  const scrollTo = (queue: string) => {
    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      registrations: regRef,
      subscriptions: subRef,
      dorsals: dorsalRef,
      forms: formRef,
      stories: storyRef,
    }
    refMap[queue]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const minutesAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 60000)

  if (!isAdmin) return <Banner type="error">{t.noPermission}</Banner>

  const total = regCount + subCount + dorsalCount + formCount

  const summaryQueues = counts?.queues ?? {
    registrations: { count: regCount, urgency: 'none', oldestAt: null },
    subscriptions: { count: subCount, urgency: 'none', oldestAt: null },
    dorsals: { count: dorsalCount, urgency: 'none', oldestAt: null },
    forms: { count: formCount, urgency: 'none', oldestAt: null },
    stories: { count: 0, urgency: 'none', oldestAt: null },
  }

  return (
    <div
      style={{
        background: T.bgBase,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: T.textPrimary,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; }
        select { font-family: inherit; }
        input { font-family: inherit; }
        button { font-family: inherit; }
        textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.bgActive}; border-radius: 4px; }
      `}</style>

      {/* Top bar */}
      <div
        style={{
          height: 52,
          background: T.bgSurface,
          borderBottom: `1px solid ${T.borderSubtle}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: T.textPrimary,
          }}
        >
          {t.title}
        </span>
        {total > 0 && (
          <span
            style={{
              fontSize: 12,
              color: T.textMuted,
              background: T.bgRaised,
              border: `1px solid ${T.borderSubtle}`,
              padding: '2px 10px',
              borderRadius: 20,
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            {total} {t.pending}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: T.textMuted }}>
            {t.updated} {minutesAgo === 0 ? t.justNow : `${minutesAgo} ${t.minAgo}`}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              background: T.bgRaised,
              border: `1px solid ${T.borderDefault}`,
              borderRadius: T.rSm,
              color: T.textSecondary,
              fontSize: 12,
              fontWeight: 500,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {refreshing ? t.refreshing : `↺ ${t.refresh}`}
          </button>
        </div>
      </div>

      {/* Scroll area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px 40px',
          scrollbarWidth: 'thin',
          scrollbarColor: `${T.bgActive} transparent`,
        }}
      >
        {/* Summary cards */}
        <SummaryCards queues={summaryQueues} onCardClick={scrollTo} />

        {/* Queue sections */}
        <RegistrationsQueue
          sectionRef={regRef}
          onAction={(msg, type) => addToast(msg, type ?? 'success')}
          onCountChange={setRegCount}
        />
        <SubscriptionsQueue
          sectionRef={subRef}
          onAction={(msg, type) => addToast(msg, type ?? 'success')}
          onCountChange={setSubCount}
        />
        <DorsalsQueue
          sectionRef={dorsalRef}
          onAction={(msg, type) => addToast(msg, type ?? 'success')}
          onCountChange={setDorsalCount}
        />
        <FormsQueue
          sectionRef={formRef}
          onAction={(msg, type) => addToast(msg, type ?? 'success')}
          onCountChange={setFormCount}
        />

        {/* Stories — placeholder */}
        <QueueSection
          id="q-stories"
          sectionRef={storyRef}
          icon="📖"
          title={t.storySubmissions}
          count={0}
        >
          <EmptySection icon="📖" title={t.allStoriesReviewed} sub={t.newStoriesHere} />
        </QueueSection>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default function ActionCenter() {
  const { i18n } = useTranslation()
  const lang = i18n.language in { en: 1, pt: 1 } ? i18n.language : 'en'
  return (
    <ACLocaleProvider lang={lang}>
      <ActionCenterInner />
    </ACLocaleProvider>
  )
}
