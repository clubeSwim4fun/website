import configPromise from '@payload-config'
import { getPayload, TypedLocale } from 'payload'
import React from 'react'
import type { Metadata } from 'next'
import { CalendarBlock } from '@/blocks/Calendar/Component'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ locale: TypedLocale }> }

export default async function EventsPage({ params }: Args) {
  const { locale } = await params

  return (
    <div className="pt-[104px] pb-24">
      <div className="container mb-10">
        <h1 className="text-3xl font-bold">Calendário de Provas</h1>
      </div>
      <div className="container">
        {/* @ts-expect-error CalendarBlock is a server component with extended props */}
        <CalendarBlock defaultView="dayGridMonth" locale={locale} />
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
