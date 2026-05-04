'use client'

import { useRouter } from '@/i18n/routing'
import { ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function BackToCalendarButton() {
  const router = useRouter()
  const t = useTranslations('Event')

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-mid hover:text-deep transition-colors group"
    >
      <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      {t('backToCalendar')}
    </button>
  )
}
