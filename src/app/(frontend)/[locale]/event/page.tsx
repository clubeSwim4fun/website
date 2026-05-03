import { getPayload, TypedLocale } from 'payload'
import config from '@payload-config'
import React from 'react'
import type { Metadata } from 'next'
import { EventsCalendar } from '@/components/EventsCalendar'
import type { CalendarEvent } from '@/components/Calendar/calendar-types'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ locale: TypedLocale }> }

export default async function EventsPage({ params }: Args) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'EventsPage' })

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 1000,
    pagination: false,
    locale,
    select: {
      slug: true,
      title: true,
      start: true,
      end: true,
      distances: true,
      category: true,
      address: {
        street: true,
        state: true,
        country: true,
      },
    },
  })

  const events = result.docs as unknown as CalendarEvent[]

  // Stats
  const now = new Date()
  const currentYear = now.getFullYear()
  const yearEvents = events.filter((ev) => new Date(ev.start).getFullYear() === currentYear)
  const upcomingCount = events.filter((ev) => new Date(ev.start) >= now).length

  return (
    <div className="min-h-screen bg-[hsl(var(--sand))]">
      {/* ── Page header ── */}
      <div className="bg-gradient-to-br from-deep to-mid relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="container relative z-10 py-12 md:py-16">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--green))]" />
            <span className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">
              {locale === 'pt' ? `Época ${currentYear}` : `Season ${currentYear}`}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            {locale === 'pt' ? 'Calendário de Provas' : 'Events Calendar'}
          </h1>
          <p className="text-white/75 text-base max-w-lg mb-8 leading-relaxed">
            {locale === 'pt'
              ? `Todas as provas e eventos do clube em ${currentYear}. Inscreva-se antes que os lugares esgotem.`
              : `All club events and races in ${currentYear}. Register before spots run out.`}
          </p>
          <div className="flex gap-8">
            <div>
              <p className="font-outfit text-3xl font-extrabold text-white leading-none">
                {yearEvents.length}
              </p>
              <p className="text-xs text-white/60 mt-1">
                {locale === 'pt' ? `Provas em ${currentYear}` : `Events in ${currentYear}`}
              </p>
            </div>
            <div>
              <p className="font-outfit text-3xl font-extrabold text-white leading-none">
                {upcomingCount}
              </p>
              <p className="text-xs text-white/60 mt-1">
                {locale === 'pt' ? 'Próximas' : 'Upcoming'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Calendar ── */}
      <div className="container py-10">
        <EventsCalendar events={events} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'pt' ? 'Calendário de Provas' : 'Events Calendar',
  }
}
